// Runs the API server from source for local development (no build step); restart to pick up edits.
import { createServer } from "vite";

const vite = await createServer({ configFile: "vite.api.config.ts", server: { middlewareMode: true }, appType: "custom" });
await vite.ssrLoadModule("/src/server/main.ts");
