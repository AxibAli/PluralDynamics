// One-time import of the old site's MongoDB data into Strapi: solutions, blogs, contact
// messages (as leads) and the images in GridFS (into the Media Library / Cloudinary).
// Runs from bootstrap when MONGODB_URI is set, or by hand with `npm run migrate`.
// Safe to re-run: finished runs are recorded, and existing entries are skipped.
const dns = require('node:dns');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const DONE_KEY = 'mongo-import';
const UPLOAD_RE = /(?:https?:\/\/[^\s"'()]+)?\/api\/uploads\/([a-z0-9-]+\.(?:png|jpg|webp|gif))/g;
const MIME = { png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif' };

/** Accepts a password typed raw into the URI (e.g. containing "@") by percent-encoding the credentials. */
function normalizeUri(raw) {
  const m = /^(mongodb(?:\+srv)?:\/\/)([^:@/]+):(.*)@([^@/]+(?:\/.*)?)$/.exec(raw);
  if (!m) return raw;
  const dec = (s) => {
    try {
      return decodeURIComponent(s);
    } catch {
      return s;
    }
  };
  return `${m[1]}${encodeURIComponent(dec(m[2]))}:${encodeURIComponent(dec(m[3]))}@${m[4]}`;
}

// mongodb+srv needs DNS SRV lookups, which some Windows setups refuse on the loopback resolver.
function ensureSrvDns(uri) {
  if (!uri.startsWith('mongodb+srv://')) return;
  const servers = dns.getServers();
  if (servers.length && servers.every((s) => s.startsWith('127.') || s === '::1')) dns.setServers([...servers, '1.1.1.1', '8.8.8.8']);
}

async function migrateFromMongo(strapi, { force = false } = {}) {
  const flags = strapi.store({ type: 'plugin', name: 'pd-migration' });
  if (!force && (await flags.get({ key: DONE_KEY }))) {
    strapi.log.info('[migrate] MongoDB import already done; remove MONGODB_URI from the environment');
    return;
  }

  const { MongoClient, GridFSBucket } = require('mongodb');
  const uri = normalizeUri(process.env.MONGODB_URI.trim());
  ensureSrvDns(uri);
  const client = await new MongoClient(uri, { serverSelectionTimeoutMS: 15000 }).connect();
  const db = client.db(process.env.MONGODB_DB || 'pluraldynamics');
  const log = (m) => strapi.log.info(`[migrate] ${m}`);
  const base = (strapi.config.get('server.url') || '').replace(/\/+$/, '');
  const absolute = (url) => (/^https?:\/\//i.test(url) ? url : `${base}${url}`);

  try {
    // ---------- images: GridFS -> Media Library ----------
    const bucket = new GridFSBucket(db, { bucketName: 'uploads' });
    const media = new Map(); // old file name -> { id, url }
    const upload = strapi.plugin('upload').service('upload');
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'pd-migrate-'));
    for (const file of await bucket.find().toArray()) {
      const name = file.filename;
      const ext = /\.([a-z]+)$/.exec(name)?.[1];
      if (!MIME[ext]) continue;
      const existing = await strapi.db.query('plugin::upload.file').findOne({ where: { name } });
      if (existing) {
        media.set(name, { id: existing.id, url: existing.url });
        continue;
      }
      const chunks = [];
      for await (const c of bucket.openDownloadStream(file._id)) chunks.push(c);
      const filepath = path.join(tmp, name);
      await fs.writeFile(filepath, Buffer.concat(chunks));
      const [saved] = await upload.upload({
        data: { fileInfo: { name, alternativeText: '', caption: '' } },
        files: { filepath, originalFilename: name, mimetype: MIME[ext], size: chunks.reduce((n, c) => n + c.length, 0) },
      });
      media.set(name, { id: saved.id, url: saved.url });
      log(`image ${name} -> ${saved.url}`);
    }
    await fs.rm(tmp, { recursive: true, force: true });

    const mediaId = (url) => {
      if (!url) return null;
      UPLOAD_RE.lastIndex = 0;
      const m = UPLOAD_RE.exec(url);
      if (!m) {
        if (url) strapi.log.warn(`[migrate] image "${url}" is not an uploaded file; add it by hand`);
        return null;
      }
      return media.get(m[1])?.id ?? null;
    };
    // Images embedded in blog text: point them at their new Media Library URLs.
    const rewrite = (text) => String(text ?? '').replace(UPLOAD_RE, (all, name) => (media.has(name) ? absolute(media.get(name).url) : all));

    // ---------- solutions ----------
    let n = 0;
    for (const s of await db.collection('solutions').find().toArray()) {
      const dupe = await strapi.documents('api::solution.solution').findFirst({ filters: { heading: s.heading }, status: 'draft' });
      if (dupe) continue;
      await strapi.documents('api::solution.solution').create({
        status: 'published',
        data: {
          heading: s.heading,
          eyebrow: s.eyebrow || '',
          tagline: s.tagline || '',
          image: mediaId(s.image),
          paragraphs: (s.paragraphs || []).filter(Boolean).map((text) => ({ text })),
          points: (s.points || []).filter(Boolean).map((text) => ({ text })),
          badge: s.badge || '',
          buttonLabel: s.buttonLabel || '',
          buttonLink: s.buttonLink || '',
          order: Number(s.order) || 0,
        },
      });
      n++;
    }
    log(`solutions imported: ${n}`);

    // ---------- blogs ----------
    n = 0;
    for (const b of await db.collection('blogs').find().toArray()) {
      const dupe = await strapi.documents('api::blog.blog').findFirst({ filters: { slug: b.slug }, status: 'draft' });
      if (dupe) continue;
      await strapi.documents('api::blog.blog').create({
        status: 'published',
        data: {
          title: b.title,
          slug: b.slug,
          excerpt: rewrite(b.excerpt),
          metaDescription: b.metaDescription || '',
          cover: mediaId(b.cover),
          category: b.category || '',
          author: b.author || 'Plural Dynamics',
          date: b.date || new Date().toISOString().slice(0, 10),
          content: rewrite(b.content),
          featured: Boolean(b.featured),
        },
      });
      n++;
    }
    log(`blogs imported: ${n}`);

    // ---------- contact messages -> leads ----------
    // Marked as emailed so the new-lead webhook doesn't re-send old enquiries.
    n = 0;
    for (const c of await db.collection('contacts').find().toArray()) {
      const dupe = await strapi.documents('api::lead.lead').findFirst({ filters: { email: c.email, submittedAt: c.createdAt } });
      if (dupe) continue;
      await strapi.documents('api::lead.lead').create({
        data: {
          firstName: c.firstName || '-',
          lastName: c.lastName || '',
          email: c.email,
          phone: c.phone || '',
          country: c.country || '',
          projectType: c.projectType || '',
          message: c.message || '-',
          page: c.page || '',
          submittedAt: c.createdAt,
          emailed: true,
        },
      });
      n++;
    }
    log(`leads imported: ${n}`);

    await flags.set({ key: DONE_KEY, value: { at: new Date().toISOString(), images: media.size } });
    log('done. You can now remove MONGODB_URI from the environment.');
  } finally {
    await client.close();
  }
}

module.exports = { migrateFromMongo };
