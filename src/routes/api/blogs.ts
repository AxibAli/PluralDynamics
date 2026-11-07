import { createFileRoute } from "@tanstack/react-router";

// Public JSON feed of blog posts (highlighted post first, then newest).
export const Route = createFileRoute("/api/blogs")({
  server: {
    handlers: {
      GET: async () => {
        const { getBlogs } = await import("@/server/cms-store");
        return Response.json(await getBlogs());
      },
    },
  },
});
