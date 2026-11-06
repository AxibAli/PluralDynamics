# Plural Dynamics

Company website for Plural Dynamics, built with TanStack Start, React, TypeScript and Tailwind CSS.

## Development

Requires Node.js 22+.

```sh
npm install                # website
npm --prefix cms install   # Strapi CMS
cp cms/.env.example cms/.env   # fill in DATABASE_URL and the secrets
npm run dev:cms            # Strapi on http://localhost:1337 (admin at /admin)
npm run dev                # site on http://localhost:8080 (reads VITE_STRAPI_URL)
```

## Architecture

| Part | Where | What |
| --- | --- | --- |
| Website (`/`) | Shared hosting (Apache, no Node) | Prerendered static pages; loads content from Strapi in the browser |
| CMS (`cms/`) | Render web service (Starter plan) | Strapi 5: blogs, solutions, leads, media library, admin panel |
| Database | Neon Postgres | Strapi's data |
| Images | Cloudinary | Media Library uploads |

Content types: **Blog**, **Solution** (draft & publish; the site shows published entries only)
and **Lead** (contact-form submissions). The website can only read published blogs and
solutions and create leads; everything else needs the admin panel.

**Webhook.** Strapi's *Email new leads* webhook (Settings > Webhooks) fires on every new
entry and posts to `/api/hooks/lead-email`, which emails new leads to `CONTACT_TO` and marks
them `emailed`. It is created on startup from `WEBHOOK_SECRET`; retries never send twice.

**Old content.** With `MONGODB_URI` set, Strapi imports the old site's solutions, blogs,
contact messages and images once on startup (or run `npm --prefix cms run migrate`).
Remove `MONGODB_URI` when the logs say `[migrate] done`.

## Deployment

1. **CMS on Render:** New > Blueprint from this repo (`render.yaml`). Enter `DATABASE_URL`,
   `CLOUDINARY_*`, `SMTP_USER`, `SMTP_PASS`, `CONTACT_TO`, `CORS_ORIGIN` (your site) and,
   for the import, `MONGODB_URI`. Then open `https://<cms>.onrender.com/admin` and create the
   first admin user.
2. **Website on shared hosting:** `VITE_STRAPI_URL=https://<cms>.onrender.com npm run build`,
   then upload the contents of `dist/client/` (including `.htaccess`) to `public_html/`.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the site dev server |
| `npm run dev:cms` | Start Strapi in development mode |
| `npm run build` | Static site build (output in `dist/client/`) |
| `npm run typecheck` | Type-check the site |
| `npm run lint` | Lint with ESLint |
| `npm test` | Run tests with Vitest |
