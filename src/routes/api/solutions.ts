import { createFileRoute } from "@tanstack/react-router";

// Public JSON list of solutions in display order.
export const Route = createFileRoute("/api/solutions")({
  server: {
    handlers: {
      GET: async () => {
        const { getSolutions } = await import("@/server/cms-store");
        return Response.json(await getSolutions());
      },
    },
  },
});
