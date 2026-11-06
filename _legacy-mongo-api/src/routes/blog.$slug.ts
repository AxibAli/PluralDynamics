import { createFileRoute } from "@tanstack/react-router";

// Public JSON for a single blog post.
export const Route = createFileRoute("/api/blog/$slug")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { getBlogs } = await import("@/server/cms-store");
        const post = (await getBlogs()).find((b) => b.slug === params.slug);
        return post ? Response.json(post) : Response.json({ error: "Not found" }, { status: 404 });
      },
    },
  },
});
