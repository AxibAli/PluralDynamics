// Loads .env into process.env for server code (Vite only exposes VITE_* vars).
// Variables already set in the real environment win. Server-only.
import path from "node:path";

try {
  process.loadEnvFile(path.join(process.cwd(), ".env"));
} catch {
  /* no .env file: rely on the real environment */
}

export const env = (key: string) => process.env[key]?.trim() ?? "";
