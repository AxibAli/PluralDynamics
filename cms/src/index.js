// Startup tasks: public API permissions, the "Email new leads" webhook, and the one-time
// import of the old MongoDB content (when MONGODB_URI is set).
const { migrateFromMongo } = require('./migration/from-mongo');

// What the website (no login) may do. Everything else needs the admin panel.
const PUBLIC_ACTIONS = [
  'api::blog.blog.find',
  'api::blog.blog.findOne',
  'api::solution.solution.find',
  'api::solution.solution.findOne',
  'api::lead.lead.create',
];

async function grantPublicPermissions(strapi) {
  const role = await strapi.db.query('plugin::users-permissions.role').findOne({ where: { type: 'public' } });
  if (!role) return;
  for (const action of PUBLIC_ACTIONS) {
    const has = await strapi.db.query('plugin::users-permissions.permission').findOne({ where: { action, role: role.id } });
    if (!has) await strapi.db.query('plugin::users-permissions.permission').create({ data: { action, role: role.id } });
  }
}

const WEBHOOK_NAME = 'Email new leads';

/** Keeps one webhook that posts every new entry to our lead-email receiver (visible under Settings > Webhooks). */
async function ensureLeadWebhook(strapi) {
  const secret = process.env.WEBHOOK_SECRET;
  const base = strapi.config.get('server.url') || `http://localhost:${strapi.config.get('server.port')}`;
  if (!secret) {
    strapi.log.warn('[webhook] WEBHOOK_SECRET is not set: lead emails are off');
    return;
  }
  const wanted = {
    name: WEBHOOK_NAME,
    url: `${base.replace(/\/+$/, '')}/api/hooks/lead-email`,
    headers: { 'x-webhook-secret': secret },
    events: ['entry.create'],
    isEnabled: true,
  };
  const store = strapi.get('webhookStore');
  const runner = strapi.get('webhookRunner');
  const existing = (await store.findWebhooks()).find((w) => w.name === WEBHOOK_NAME);
  if (!existing) {
    const created = await store.createWebhook(wanted);
    runner.add(created);
    strapi.log.info(`[webhook] created "${WEBHOOK_NAME}" -> ${wanted.url}`);
  } else if (existing.url !== wanted.url || existing.headers?.['x-webhook-secret'] !== secret || !existing.isEnabled) {
    const updated = await store.updateWebhook(existing.id, { ...existing, ...wanted });
    runner.update(updated);
    strapi.log.info(`[webhook] updated "${WEBHOOK_NAME}" -> ${wanted.url}`);
  }
}

module.exports = {
  register() {},

  async bootstrap({ strapi }) {
    await grantPublicPermissions(strapi);
    await ensureLeadWebhook(strapi);

    // Runs in the background so the server starts (and passes Render's health check) right away.
    if (process.env.MONGODB_URI && !process.env.PD_MANUAL_MIGRATE) {
      setImmediate(() =>
        migrateFromMongo(strapi).catch((e) => strapi.log.error(`[migrate] failed: ${e.stack || e.message}`)),
      );
    }
  },
};
