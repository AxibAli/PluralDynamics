import { createFileRoute } from "@tanstack/react-router";

const mime: Record<string, string> = { png: "image/png", jpg: "image/jpeg", webp: "image/webp", gif: "image/gif" };

// Serves images uploaded from the dashboard (stored in MongoDB GridFS). The name pattern rejects anything unexpected.
export const Route = createFileRoute("/api/uploads/$file")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const m = /^[a-z0-9-]+\.(png|jpg|webp|gif)$/.exec(params.file);
        if (!m) return new Response("Not found", { status: 404 });
        const { getImage } = await import("@/server/cms-store");
        const buf = await getImage(params.file).catch(() => null);
        if (!buf) return new Response("Not found", { status: 404 });
        return new Response(new Uint8Array(buf), {
          headers: { "content-type": mime[m[1]!]!, "cache-control": "public, max-age=31536000, immutable", "x-content-type-options": "nosniff" },
        });
      },
    },
  },
});
