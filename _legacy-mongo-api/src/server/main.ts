// Entry point of the API server on Render: `npm run build:api && npm run start:api`.
import { createApiServer } from "./api";
import { env } from "./env";

const port = Number(env("PORT") || 3001);
createApiServer().listen(port, () => {
  console.log(`[api] listening on :${port}; allowed site origins: ${env("CORS_ORIGIN") || "(none - set CORS_ORIGIN)"}`);
});
