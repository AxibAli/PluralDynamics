// Server functions (RPC endpoints) for dashboard content and the contact form. The site and
// the /admin dashboard run in one Node.js app; data lives in MongoDB. Handlers run only on
// the server, and server-only modules are imported lazily so nothing leaks into the client.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { blogInput, contactInput, solutionInput, type Contact } from "./cms-types";

const store = () => import("@/server/cms-store");
const auth = () => import("@/server/auth");
const admin = async () => (await auth()).requireAdmin();

// ---------- public reads ----------

export const listSolutions = createServerFn({ method: "GET" }).handler(async () => (await store()).getSolutions());

export const listBlogs = createServerFn({ method: "GET" }).handler(async () => (await store()).getBlogs());

export const getBlog = createServerFn({ method: "GET" })
  .inputValidator(z.object({ slug: z.string().max(120) }))
  .handler(async ({ data }) => {
    const blogs = await (await store()).getBlogs();
    const post = blogs.find((b) => b.slug === data.slug) ?? null;
    const more = blogs.filter((b) => b.slug !== data.slug).slice(0, 3);
    return { post, more };
  });

// ---------- session ----------

export const adminStatus = createServerFn({ method: "GET" }).handler(async () => {
  const a = await auth();
  // Dashboard switched off: report nothing and don't touch the database.
  if (!a.dashboardEnabled()) return { enabled: false, configured: false, signedIn: false, db: false, dbError: "", mail: false };
  const { dbConfigured, getDb } = await import("@/server/db");
  const { mailConfigured } = await import("@/server/mail");
  const signedIn = a.isAdmin();
  // Signed-in admins see why the database is down, without the URI or password.
  let dbError = "";
  if (signedIn && dbConfigured())
    await getDb().catch((e: unknown) => {
      dbError = (e instanceof Error ? e.message : String(e)).replace(/\/\/[^@\s]*@/g, "//***@");
    });
  return { enabled: true, configured: a.adminConfigured(), signedIn, db: dbConfigured() && !dbError, dbError, mail: mailConfigured() };
});

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator(z.object({ password: z.string().max(200) }))
  .handler(async ({ data }) => {
    (await auth()).login(data.password);
    return { ok: true };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  (await auth()).logout();
  return { ok: true };
});

// ---------- solutions (products) ----------

export const saveSolution = createServerFn({ method: "POST" })
  .inputValidator(solutionInput)
  .handler(async ({ data }) => {
    await admin();
    return (await store()).upsertSolution({ ...data, paragraphs: data.paragraphs.filter(Boolean), points: data.points.filter(Boolean) });
  });

export const deleteSolution = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    await admin();
    await (await store()).removeSolution(data.id);
    return { ok: true };
  });

// ---------- blogs ----------

export const saveBlog = createServerFn({ method: "POST" })
  .inputValidator(blogInput)
  .handler(async ({ data }) => {
    await admin();
    return (await store()).upsertBlog(data);
  });

export const deleteBlog = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    await admin();
    await (await store()).removeBlog(data.id);
    return { ok: true };
  });

// ---------- images (stored in MongoDB GridFS, served at /api/uploads/<name>) ----------

const MAX_BYTES = 5 * 1024 * 1024;
const types: Record<string, { ext: string; magic: (b: Buffer) => boolean }> = {
  "image/png": { ext: "png", magic: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  "image/jpeg": { ext: "jpg", magic: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  "image/webp": { ext: "webp", magic: (b) => b.subarray(0, 4).toString() === "RIFF" && b.subarray(8, 12).toString() === "WEBP" },
  "image/gif": { ext: "gif", magic: (b) => b.subarray(0, 4).toString() === "GIF8" },
};

export const uploadImage = createServerFn({ method: "POST" })
  .inputValidator(z.object({ type: z.string(), data: z.string().max(Math.ceil((MAX_BYTES * 4) / 3) + 8) }))
  .handler(async ({ data }) => {
    await admin();
    const t = types[data.type];
    if (!t) throw new Error("Use a PNG, JPG, WebP or GIF image");
    const buf = Buffer.from(data.data, "base64");
    if (buf.length > MAX_BYTES) throw new Error("Image must be 5 MB or smaller");
    if (!t.magic(buf)) throw new Error("File content doesn't match its image type");
    const name = `${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}.${t.ext}`;
    await (await store()).putImage(name, data.type, buf);
    return { url: `/api/uploads/${name}` };
  });

// ---------- contact form ----------

// Light flood control: 5 submissions per client per 10 minutes.
const recent = new Map<string, number[]>();

export const submitContact = createServerFn({ method: "POST" })
  .inputValidator(contactInput)
  .handler(async ({ data }) => {
    const { website, ...fields } = data;
    if (website) return { ok: true }; // bot filled the hidden field: pretend success, store nothing
    const ip = (await auth()).clientIp();
    const now = Date.now();
    const hits = (recent.get(ip) ?? []).filter((t) => now - t < 10 * 60 * 1000);
    if (hits.length >= 5) throw new Error("Too many messages. Please try again in a few minutes.");
    recent.set(ip, [...hits, now]);

    const { dbConfigured } = await import("@/server/db");
    const mail = await import("@/server/mail");
    const s = await store();
    const contact: Contact = { ...fields, id: crypto.randomUUID(), createdAt: new Date().toISOString(), emailed: false };
    let saved = false;
    let emailed = false;
    if (dbConfigured()) {
      try {
        await s.addContact(contact);
        saved = true;
      } catch (e) {
        console.error("[contact] could not save message", e);
      }
    }
    if (mail.mailConfigured()) {
      try {
        await mail.sendContactEmail(contact);
        emailed = true;
        if (saved) await s.markEmailed(contact.id);
      } catch (e) {
        console.error("[contact] could not send email:", mail.describeMailError(e));
      }
    }
    if (!saved && !emailed) throw new Error("Sorry, your message couldn't be sent right now. Please email us directly.");
    return { ok: true };
  });

/** Dashboard button: sends a test email and reports exactly why it failed, if it did. */
export const sendTestEmail = createServerFn({ method: "POST" }).handler(async () => {
  await admin();
  const mail = await import("@/server/mail");
  if (!mail.mailConfigured()) return { ok: false, message: "Email isn't set up: SMTP_HOST, SMTP_USER and SMTP_PASS must all be filled in .env (then restart the app)." };
  try {
    const to = await mail.sendTestEmail();
    return { ok: true, message: `Test email sent to ${to}. If it doesn't arrive within a few minutes, check the Spam/Junk folder.` };
  } catch (e) {
    const message = mail.describeMailError(e);
    console.error("[contact] test email failed:", message);
    return { ok: false, message };
  }
});

export const listContacts = createServerFn({ method: "GET" }).handler(async () => {
  await admin();
  const { dbConfigured } = await import("@/server/db");
  return dbConfigured() ? (await store()).getContacts().catch(() => []) : [];
});

export const deleteContact = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    await admin();
    await (await store()).removeContact(data.id);
    return { ok: true };
  });
