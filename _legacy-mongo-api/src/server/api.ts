// Standalone JSON API (deployed on Render): dashboard content, image uploads, admin login
// and the contact form. The static site on shared hosting calls it cross-origin, so every
// response carries CORS headers for the origins listed in CORS_ORIGIN. Server-only.
import { randomUUID } from "node:crypto";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { z, ZodError } from "zod";
import { blogInput, contactInput, solutionInput, type Contact } from "@/lib/cms-types";
import * as auth from "./auth";
import * as store from "./cms-store";
import { dbConfigured, getDb } from "./db";
import { env } from "./env";
import * as mail from "./mail";

class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

type Ctx = { req: IncomingMessage; params: Record<string, string>; body: unknown; ip: string; origin: string };
type Handler = (ctx: Ctx) => Promise<unknown>;

const MAX_IMAGE = 5 * 1024 * 1024;
const MAX_BODY = Math.ceil((MAX_IMAGE * 4) / 3) + 64 * 1024; // a base64 image plus some JSON

// ---------- helpers ----------

const allowedOrigins = () =>
  env("CORS_ORIGIN")
    .split(",")
    .map((s) => s.trim().replace(/\/+$/, ""))
    .filter(Boolean);

/** Public base URL of this API, used to turn stored "/api/uploads/..." paths into absolute links. */
function selfOrigin(req: IncomingMessage) {
  const fixed = env("PUBLIC_API_URL").replace(/\/+$/, "");
  if (fixed) return fixed;
  const proto = String(req.headers["x-forwarded-proto"] ?? "http").split(",")[0]!.trim();
  return `${proto}://${req.headers.host ?? "localhost"}`;
}

/** Uploaded images are stored as site-relative paths; the static site needs them on the API host. */
const absolutize = <T>(value: T, origin: string): T =>
  JSON.parse(JSON.stringify(value).replace(/(["(])\/api\/uploads\//g, `$1${origin}/api/uploads/`)) as T;

const requireAdmin = (ctx: Ctx) => {
  if (!auth.isAdmin(ctx.req.headers.authorization)) throw new HttpError(401, "Not signed in");
};

const parse = <T>(schema: z.ZodType<T>, body: unknown): T => schema.parse(body);

function readBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks: Buffer[] = [];
    req.on("data", (c: Buffer) => {
      size += c.length;
      if (size > MAX_BODY) {
        reject(new HttpError(413, "Request too large"));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => {
      if (!chunks.length) return resolve(undefined);
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch {
        reject(new HttpError(400, "Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

// ---------- routes ----------

const imageTypes: Record<string, { ext: string; magic: (b: Buffer) => boolean }> = {
  "image/png": { ext: "png", magic: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  "image/jpeg": { ext: "jpg", magic: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  "image/webp": { ext: "webp", magic: (b) => b.subarray(0, 4).toString() === "RIFF" && b.subarray(8, 12).toString() === "WEBP" },
  "image/gif": { ext: "gif", magic: (b) => b.subarray(0, 4).toString() === "GIF8" },
};

// Light flood control for the contact form: 5 submissions per client per 10 minutes.
const recentContacts = new Map<string, number[]>();

const routes: [method: string, pattern: string, handler: Handler][] = [
  ["GET", "/api/health", async () => ({ ok: true })],

  // ----- public reads -----
  ["GET", "/api/solutions", async (c) => absolutize(await store.getSolutions(), c.origin)],
  ["GET", "/api/blogs", async (c) => absolutize(await store.getBlogs(), c.origin)],
  [
    "GET",
    "/api/blog/:slug",
    async (c) => {
      const blogs = await store.getBlogs();
      const post = blogs.find((b) => b.slug === c.params["slug"]) ?? null;
      const more = blogs.filter((b) => b.slug !== c.params["slug"]).slice(0, 3);
      return absolutize({ post, more }, c.origin);
    },
  ],

  // ----- session -----
  [
    "GET",
    "/api/admin/status",
    async (c) => {
      // Dashboard switched off: report nothing and don't touch the database.
      if (!auth.dashboardEnabled()) return { enabled: false, messages: false, configured: false, signedIn: false, db: false, dbError: "", mail: false };
      const signedIn = auth.isAdmin(c.req.headers.authorization);
      // Signed-in admins see why the database is down, without the URI or password.
      let dbError = "";
      if (signedIn && dbConfigured())
        await getDb().catch((e: unknown) => {
          dbError = (e instanceof Error ? e.message : String(e)).replace(/\/\/[^@\s]*@/g, "//***@");
        });
      return { enabled: true, messages: auth.messagesEnabled(), configured: auth.adminConfigured(), signedIn, db: dbConfigured() && !dbError, dbError, mail: mail.mailConfigured() };
    },
  ],
  [
    "POST",
    "/api/admin/login",
    async (c) => {
      const { password } = parse(z.object({ password: z.string().max(200) }), c.body);
      try {
        return { token: auth.login(password, c.ip) };
      } catch (e) {
        throw new HttpError(401, e instanceof Error ? e.message : "Login failed");
      }
    },
  ],

  // ----- solutions -----
  [
    "POST",
    "/api/admin/solutions",
    async (c) => {
      requireAdmin(c);
      const data = parse(solutionInput, c.body);
      return store.upsertSolution({ ...data, paragraphs: data.paragraphs.filter(Boolean), points: data.points.filter(Boolean) });
    },
  ],
  [
    "DELETE",
    "/api/admin/solutions/:id",
    async (c) => {
      requireAdmin(c);
      await store.removeSolution(c.params["id"]!);
      return { ok: true };
    },
  ],

  // ----- blogs -----
  [
    "POST",
    "/api/admin/blogs",
    async (c) => {
      requireAdmin(c);
      return store.upsertBlog(parse(blogInput, c.body));
    },
  ],
  [
    "DELETE",
    "/api/admin/blogs/:id",
    async (c) => {
      requireAdmin(c);
      await store.removeBlog(c.params["id"]!);
      return { ok: true };
    },
  ],

  // ----- images -----
  [
    "POST",
    "/api/admin/uploads",
    async (c) => {
      requireAdmin(c);
      const data = parse(z.object({ type: z.string(), data: z.string().max(Math.ceil((MAX_IMAGE * 4) / 3) + 8) }), c.body);
      const t = imageTypes[data.type];
      if (!t) throw new HttpError(400, "Use a PNG, JPG, WebP or GIF image");
      const buf = Buffer.from(data.data, "base64");
      if (buf.length > MAX_IMAGE) throw new HttpError(400, "Image must be 5 MB or smaller");
      if (!t.magic(buf)) throw new HttpError(400, "File content doesn't match its image type");
      const name = `${Date.now().toString(36)}-${randomUUID().slice(0, 8)}.${t.ext}`;
      await store.putImage(name, data.type, buf);
      return { url: `${c.origin}/api/uploads/${name}` };
    },
  ],

  // ----- contact form -----
  [
    "POST",
    "/api/contact",
    async (c) => {
      const { website, ...fields } = parse(contactInput, c.body);
      if (website) return { ok: true }; // bot filled the hidden field: pretend success, store nothing
      const now = Date.now();
      const hits = (recentContacts.get(c.ip) ?? []).filter((t) => now - t < 10 * 60 * 1000);
      if (hits.length >= 5) throw new HttpError(429, "Too many messages. Please try again in a few minutes.");
      recentContacts.set(c.ip, [...hits, now]);

      const contact: Contact = { ...fields, id: randomUUID(), createdAt: new Date().toISOString(), emailed: false };
      let saved = false;
      let emailed = false;
      if (dbConfigured()) {
        try {
          await store.addContact(contact);
          saved = true;
        } catch (e) {
          console.error("[contact] could not save message", e);
        }
      }
      if (mail.mailConfigured()) {
        try {
          await mail.sendContactEmail(contact);
          emailed = true;
          if (saved) await store.markEmailed(contact.id);
        } catch (e) {
          console.error("[contact] could not send email", e);
        }
      }
      if (!saved && !emailed) throw new HttpError(503, "Sorry, your message couldn't be sent right now. Please email us directly.");
      return { ok: true };
    },
  ],
  [
    "GET",
    "/api/admin/contacts",
    async (c) => {
      requireAdmin(c);
      if (!auth.messagesEnabled() || !dbConfigured()) return [];
      return store.getContacts().catch(() => []);
    },
  ],
  [
    "DELETE",
    "/api/admin/contacts/:id",
    async (c) => {
      requireAdmin(c);
      await store.removeContact(c.params["id"]!);
      return { ok: true };
    },
  ],
];

const mime: Record<string, string> = { png: "image/png", jpg: "image/jpeg", webp: "image/webp", gif: "image/gif" };

/** Images uploaded from the dashboard (MongoDB GridFS). The name pattern rejects anything unexpected. */
async function serveUpload(file: string, res: ServerResponse) {
  const m = /^[a-z0-9-]+\.(png|jpg|webp|gif)$/.exec(file);
  const buf = m ? await store.getImage(file).catch(() => null) : null;
  if (!m || !buf) {
    res.writeHead(404, { "content-type": "text/plain" }).end("Not found");
    return;
  }
  res
    .writeHead(200, {
      "content-type": mime[m[1]!]!,
      "cache-control": "public, max-age=31536000, immutable",
      "x-content-type-options": "nosniff",
      "cross-origin-resource-policy": "cross-origin",
    })
    .end(buf);
}

function match(pattern: string, path: string): Record<string, string> | null {
  const a = pattern.split("/");
  const b = path.split("/");
  if (a.length !== b.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < a.length; i++) {
    if (a[i]!.startsWith(":")) params[a[i]!.slice(1)] = decodeURIComponent(b[i]!);
    else if (a[i] !== b[i]) return null;
  }
  return params;
}

// ---------- server ----------

export function createApiServer() {
  return createServer(async (req, res) => {
    const origin = String(req.headers.origin ?? "").replace(/\/+$/, "");
    const allowed = allowedOrigins();
    if (origin && (allowed.includes(origin) || allowed.includes("*"))) {
      res.setHeader("access-control-allow-origin", origin);
      res.setHeader("vary", "Origin");
      res.setHeader("access-control-allow-headers", "content-type, authorization");
      res.setHeader("access-control-allow-methods", "GET, POST, DELETE, OPTIONS");
      res.setHeader("access-control-max-age", "86400");
    }
    if (req.method === "OPTIONS") {
      res.writeHead(204).end();
      return;
    }

    const url = new URL(req.url ?? "/", "http://x");
    const path = url.pathname.replace(/\/+$/, "") || "/";
    const send = (status: number, body: unknown) => res.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }).end(JSON.stringify(body));

    try {
      if (req.method === "GET" && path.startsWith("/api/uploads/")) return await serveUpload(path.slice("/api/uploads/".length), res);
      if (path === "/") return send(200, { name: "Plural Dynamics API", ok: true });

      for (const [method, pattern, handler] of routes) {
        if (method !== req.method) continue;
        const params = match(pattern, path);
        if (!params) continue;
        const body = method === "POST" ? await readBody(req) : undefined;
        const ip = String(req.headers["x-forwarded-for"] ?? "").split(",")[0]!.trim() || req.socket.remoteAddress || "local";
        return send(200, await handler({ req, params, body, ip, origin: selfOrigin(req) }));
      }
      return send(404, { error: "Not found" });
    } catch (e) {
      if (e instanceof HttpError) return send(e.status, { error: e.message });
      if (e instanceof ZodError) return send(400, { error: e.issues[0]?.message ?? "Invalid input" });
      console.error(e);
      return send(500, { error: "Server error" });
    }
  });
}
