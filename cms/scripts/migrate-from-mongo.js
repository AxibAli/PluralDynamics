// Manual run of the MongoDB import: `npm run migrate` (add `-- --force` to run it again).
// Uses the same .env as the server (DATABASE_URL, CLOUDINARY_*, MONGODB_URI).
process.env.PD_MANUAL_MIGRATE = '1'; // stop bootstrap from starting a second, background run
const { createStrapi, compileStrapi } = require('@strapi/strapi');
const { migrateFromMongo } = require('../src/migration/from-mongo');

(async () => {
  if (!process.env.MONGODB_URI) require('node:fs').existsSync('.env') && process.loadEnvFile?.('.env');
  if (!process.env.MONGODB_URI) throw new Error('Set MONGODB_URI (the old site database) first');
  const app = await createStrapi(await compileStrapi()).load();
  try {
    await migrateFromMongo(app, { force: process.argv.includes('--force') });
  } finally {
    await app.destroy();
  }
  process.exit(0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
