import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig, type PluginOption } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig(() => {
  const plugins: PluginOption[] = [
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      // Keep server-only modules out of the client bundle.
      importProtection: {
        behavior: "error",
        client: { files: ["**/server/**"], specifiers: ["server-only"] },
      },
      // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
      server: { entry: "server" },
      // Static build for shared hosting: every page is prerendered to HTML at build time, and
      // _shell.html serves URLs that only exist at runtime (blog posts). Content comes from
      // the Strapi CMS in cms/ (deployed on Render) at VITE_STRAPI_URL.
      spa: { enabled: true, maskPath: "/_shell" }, // own path, so it does not replace the prerendered home page
      prerender: { enabled: true, crawlLinks: true, failOnError: true, autoSubfolderIndex: false },
    }),
  ];

  plugins.push(viteReact());

  return {
    plugins,
    css: { transformer: "lightningcss" as const },
    resolve: {
      alias: { "@": path.resolve(__dirname, "./src") },
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-query",
        "@tanstack/query-core",
      ],
    },
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-dom/client",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
      ],
    },
    server: { host: "::", port: 8080 },
  };
});
