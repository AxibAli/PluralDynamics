// MongoDB-backed store for dashboard content, uploads (GridFS) and contact messages.
// Server-only. Without MONGODB_URI the site still renders, read-only, from the original content.
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { GridFSBucket, type Db } from "mongodb";
import { articles } from "@/lib/original";
import { seedSolutions } from "@/lib/products";
import { slugify, sortBlogs, sortSolutions, type Blog, type BlogInput, type Contact, type Solution, type SolutionInput } from "@/lib/cms-types";
import { dbConfigured, getDb } from "./db";
import { env } from "./env";

// Earlier versions stored content in data/cms.json and data/uploads; imported once on first connect.
const LEGACY_DIR = path.resolve(env("CMS_DATA_DIR") || path.join(process.cwd(), "data"));
const LEGACY_FILE = path.join(LEGACY_DIR, "cms.json");

type Doc<T> = Omit<T, "id"> & { _id: string };
const toDoc = <T extends { id: string }>({ id, ...rest }: T) => ({ _id: id, ...rest }) as unknown as Doc<T>;
const fromDoc = <T,>({ _id, ...rest }: Doc<T>) => ({ id: _id, ...rest }) as unknown as T;

const toIso = (d: string) => {
  const t = Date.parse(`${d} UTC`);
  return Number.isNaN(t) ? new Date().toISOString().slice(0, 10) : new Date(t).toISOString().slice(0, 10);
};

/** Original products and blog teasers, or the legacy JSON store if one exists. */
async function seedData(): Promise<{ solutions: Solution[]; blogs: Blog[] }> {
  if (existsSync(LEGACY_FILE)) return JSON.parse(await readFile(LEGACY_FILE, "utf8"));
  const now = new Date().toISOString();
  const used = new Set<string>();
  return {
    solutions: seedSolutions().map((s) => ({ ...s, id: randomUUID(), createdAt: now, updatedAt: now })),
    blogs: articles().map((a) => {
      let slug = slugify(a.title);
      while (used.has(slug)) slug += "-2";
      used.add(slug);
      // The original site only exposes a teaser line per post; full text is added from the dashboard.
      return { id: randomUUID(), slug, title: a.title, excerpt: `${a.excerpt}…`, metaDescription: "", cover: "", category: "", author: "Plural Dynamics", date: toIso(a.date), content: `${a.excerpt}…`, featured: false, createdAt: now, updatedAt: now };
    }),
  };
}

const g = globalThis as unknown as { __pdReady?: Promise<Db> | undefined; __pdFallback?: Promise<{ solutions: Solution[]; blogs: Blog[] }> };

/** Connects, creates indexes and seeds exactly once per database (a marker stops re-seeding after deletes). */
function ready(): Promise<Db> {
  g.__pdReady ??= (async () => {
    const db = await getDb();
    await db.collection("blogs").createIndex({ slug: 1 }, { unique: true });
    const meta = db.collection<{ _id: string; at: string }>("meta");
    if (!(await meta.findOne({ _id: "seeded" }))) {
      const seed = await seedData();
      if (seed.solutions.length) await db.collection<Doc<Solution>>("solutions").insertMany(seed.solutions.map(toDoc));
      if (seed.blogs.length) await db.collection<Doc<Blog>>("blogs").insertMany(seed.blogs.map(toDoc));
      await importLegacyUploads(db);
      await meta.insertOne({ _id: "seeded", at: new Date().toISOString() });
    }
    return db;
  })().catch((e: unknown) => {
    g.__pdReady = undefined;
    throw e;
  });
  return g.__pdReady;
}

const fallback = () => (g.__pdFallback ??= seedData());

/** Public pages must not go down with the database: log the error and serve the original content. */
async function orFallback<T>(read: () => Promise<T>, backup: () => Promise<T>): Promise<T> {
  if (!dbConfigured()) return backup();
  try {
    return await read();
  } catch (e) {
    console.error("[db] MongoDB unavailable, showing original content:", e instanceof Error ? e.message : e);
    return backup();
  }
}
const solutions = async () => (await ready()).collection<Doc<Solution>>("solutions");
const blogs = async () => (await ready()).collection<Doc<Blog>>("blogs");
const contacts = async () => (await ready()).collection<Doc<Contact>>("contacts");
const bucket = async () => new GridFSBucket(await ready(), { bucketName: "uploads" });

// Reads are cached in memory for a minute so page loads don't wait on a database round
// trip; every write clears the cache, so dashboard changes show up immediately.
const TTL_MS = 60_000;
const cache = ((globalThis as unknown as { __pdCache?: Map<string, { at: number; value: Promise<unknown> }> }).__pdCache ??= new Map());
function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value as Promise<T>;
  const value = load();
  cache.set(key, { at: Date.now(), value });
  value.catch(() => cache.delete(key)); // never cache a failure
  return value;
}
const bust = (key: string) => cache.delete(key);

// ---------- solutions ----------

export async function getSolutions(): Promise<Solution[]> {
  return cached("solutions", () => orFallback(
    async () => sortSolutions((await (await solutions()).find().toArray()).map(fromDoc<Solution>)),
    async () => sortSolutions((await fallback()).solutions),
  ));
}

export async function upsertSolution(data: SolutionInput): Promise<Solution> {
  bust("solutions");
  const col = await solutions();
  const now = new Date().toISOString();
  const { id, ...fields } = data;
  if (id) {
    const res = await col.findOneAndUpdate({ _id: id }, { $set: { ...fields, updatedAt: now } }, { returnDocument: "after" });
    if (!res) throw new Error("Solution not found");
    bust("solutions");
    return fromDoc<Solution>(res);
  }
  const row: Solution = { ...fields, id: randomUUID(), createdAt: now, updatedAt: now };
  await col.insertOne(toDoc(row));
  bust("solutions");
  return row;
}

export async function removeSolution(id: string) {
  await (await solutions()).deleteOne({ _id: id });
  bust("solutions");
}

// ---------- blogs ----------

export async function getBlogs(): Promise<Blog[]> {
  return cached("blogs", () => orFallback(
    async () => sortBlogs((await (await blogs()).find().toArray()).map(fromDoc<Blog>)),
    async () => sortBlogs((await fallback()).blogs),
  ));
}

export async function upsertBlog(data: BlogInput): Promise<Blog> {
  const col = await blogs();
  const now = new Date().toISOString();
  const { id, ...fields } = data;
  // Unique slug: from the form, else the title, suffixed while another post holds it.
  const base = fields.slug || slugify(fields.title);
  let slug = base;
  for (let n = 2; await col.findOne({ slug, _id: { $ne: id ?? "" } }); n++) slug = `${base}-${n}`;
  let row: Blog;
  if (id) {
    const res = await col.findOneAndUpdate({ _id: id }, { $set: { ...fields, slug, updatedAt: now } }, { returnDocument: "after" });
    if (!res) throw new Error("Blog not found");
    row = fromDoc<Blog>(res);
  } else {
    row = { ...fields, slug, id: randomUUID(), createdAt: now, updatedAt: now };
    await col.insertOne(toDoc(row));
  }
  // Only one highlighted post: ticking this one clears the rest.
  if (row.featured) await col.updateMany({ _id: { $ne: row.id }, featured: true }, { $set: { featured: false } });
  bust("blogs");
  return row;
}

export async function removeBlog(id: string) {
  await (await blogs()).deleteOne({ _id: id });
  bust("blogs");
}

// ---------- images (GridFS) ----------

export async function putImage(name: string, contentType: string, buf: Buffer) {
  const b = await bucket();
  await new Promise<void>((res, rej) => {
    const up = b.openUploadStream(name, { metadata: { contentType } });
    up.on("finish", () => res()).on("error", rej);
    up.end(buf);
  });
}

export async function getImage(name: string): Promise<Buffer | null> {
  if (!dbConfigured()) return null;
  const b = await bucket();
  if (!(await b.find({ filename: name }).limit(1).hasNext())) return null;
  const chunks: Buffer[] = [];
  for await (const c of b.openDownloadStreamByName(name)) chunks.push(c as Buffer);
  return Buffer.concat(chunks);
}

async function importLegacyUploads(db: Db) {
  const dir = path.join(LEGACY_DIR, "uploads");
  if (!existsSync(dir)) return;
  const b = new GridFSBucket(db, { bucketName: "uploads" });
  for (const f of await readdir(dir)) {
    const buf = await readFile(path.join(dir, f));
    await new Promise<void>((res, rej) => b.openUploadStream(f).on("finish", () => res()).on("error", rej).end(buf));
  }
}

// ---------- contact messages ----------

export async function addContact(c: Contact) {
  await (await contacts()).insertOne(toDoc(c));
}

export async function markEmailed(id: string) {
  await (await contacts()).updateOne({ _id: id }, { $set: { emailed: true } });
}

export async function getContacts(): Promise<Contact[]> {
  return (await (await contacts()).find().sort({ createdAt: -1 }).limit(500).toArray()).map(fromDoc<Contact>);
}

export async function removeContact(id: string) {
  await (await contacts()).deleteOne({ _id: id });
}
