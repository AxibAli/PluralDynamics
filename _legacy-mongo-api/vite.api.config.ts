// Builds the standalone API server (src/server/main.ts) into dist-api/index.mjs for Render.
// npm packages stay external and are loaded from node_modules at runtime.
import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  build: {
    ssr: "src/server/main.ts",
    outDir: "dist-api",
    emptyOutDir: true,
    target: "node22",
    rollupOptions: { output: { entryFileNames: "index.mjs" } },
  },
});
