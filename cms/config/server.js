// Render sets PORT and RENDER_EXTERNAL_URL automatically.
module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: env('PUBLIC_URL', env('RENDER_EXTERNAL_URL', '')),
  proxy: { koa: true }, // behind Render's proxy: trust X-Forwarded-* (client IP, https)
  app: { keys: env.array('APP_KEYS') },
});
