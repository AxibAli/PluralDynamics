// Website contact form (POST /api/leads) and the receiver of the "Email new leads" webhook.
const { timingSafeEqual } = require('node:crypto');
const { factories } = require('@strapi/strapi');
const { sendLeadEmail } = require('../../../utils/lead-email');

const UID = 'api::lead.lead';

// Field rules match the site's form. Single-line fields can't carry newlines into email headers.
const FIELDS = {
  firstName: { max: 80, required: 'Please add your first name', line: true },
  lastName: { max: 80, line: true },
  email: { max: 200, required: 'Please add a valid email', line: true, email: true },
  phone: { max: 40, line: true },
  country: { max: 80, line: true },
  projectType: { max: 80, line: true },
  message: { max: 5000, required: 'Please add a message' },
  page: { max: 200, line: true },
};

function clean(body) {
  const out = {};
  for (const [key, rule] of Object.entries(FIELDS)) {
    const raw = body[key];
    const v = typeof raw === 'string' ? raw.trim() : '';
    if (rule.required && !v) return { error: rule.required };
    if (v.length > rule.max) return { error: `${key} is too long` };
    if (rule.line && /[\r\n]/.test(v)) return { error: `${key} must be a single line` };
    if (rule.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return { error: rule.required };
    out[key] = v;
  }
  return { data: out };
}

// Light flood control: 5 submissions per client per 10 minutes (per server instance).
const recent = new Map();
const WINDOW_MS = 10 * 60 * 1000;

const sameSecret = (a, b) => {
  const x = Buffer.from(String(a ?? ''));
  const y = Buffer.from(String(b ?? ''));
  return x.length > 0 && x.length === y.length && timingSafeEqual(x, y);
};

module.exports = factories.createCoreController(UID, ({ strapi }) => ({
  async create(ctx) {
    const body = (ctx.request.body && (ctx.request.body.data ?? ctx.request.body)) || {};
    if (body.website) return { ok: true }; // honeypot filled by a bot: pretend success, store nothing

    const ip = ctx.request.ip || 'unknown';
    const now = Date.now();
    const hits = (recent.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
    if (hits.length >= 5) return ctx.tooManyRequests('Too many messages. Please try again in a few minutes.');
    recent.set(ip, [...hits, now]);

    const { data, error } = clean(body);
    if (error) return ctx.badRequest(error);

    // Creating the entry fires the entry.create webhook, which emails the lead.
    await strapi.documents(UID).create({ data: { ...data, submittedAt: new Date().toISOString(), emailed: false } });
    ctx.status = 201;
    return { ok: true }; // never echo stored data back to the public
  },

  /** POST /api/hooks/lead-email: called by Strapi's webhook on entry.create. */
  async emailHook(ctx) {
    const secret = process.env.WEBHOOK_SECRET;
    if (!secret || !sameSecret(ctx.request.headers['x-webhook-secret'], secret)) return ctx.unauthorized('Bad webhook secret');

    const { event, uid, model, entry } = ctx.request.body || {};
    if (event !== 'entry.create' || (uid !== UID && model !== 'lead') || !entry?.documentId) return { skipped: true };

    // Claim the lead atomically so a retried or duplicated webhook never sends twice.
    const claimed = await strapi.db.connection('leads').where({ document_id: entry.documentId, emailed: false }).update({ emailed: true });
    if (!claimed) return { skipped: 'already emailed' };

    const lead = await strapi.documents(UID).findOne({ documentId: entry.documentId });
    try {
      await sendLeadEmail(strapi, lead);
    } catch (e) {
      // Release the claim so a later retry can send it; the lead itself is safe in the database.
      await strapi.db.connection('leads').where({ document_id: entry.documentId }).update({ emailed: false });
      strapi.log.error(`[lead-email] could not send email for lead ${entry.documentId}: ${e.message}`);
      return ctx.internalServerError('Email failed');
    }
    return { ok: true };
  },
}));
