import { afterEach, describe, expect, it, vi } from "vitest";
import { getBlog, listBlogs, listSolutions, STRAPI_URL, submitContact } from "@/lib/cms";

const base = { createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-02T00:00:00.000Z" };
const reply = (status: number, body: unknown) => Promise.resolve(new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } }));

afterEach(() => vi.unstubAllGlobals());

describe("Strapi client", () => {
  it("maps blogs, putting the featured post first and resolving media URLs", async () => {
    const fetchMock = vi.fn(() =>
      reply(200, {
        data: [
          { id: 1, documentId: "a", slug: "old", title: "Old", date: "2024-01-01", content: "x", featured: false, cover: { url: "/uploads/a.png" }, ...base },
          { id: 2, documentId: "b", slug: "star", title: "Star", date: "2023-01-01", content: "y", featured: true, cover: { url: "https://res.cloudinary.com/x/b.png" }, excerpt: null, ...base },
        ],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const blogs = await listBlogs();
    expect(blogs.map((b) => b.slug)).toEqual(["star", "old"]);
    expect(blogs[0]).toMatchObject({ id: "b", cover: "https://res.cloudinary.com/x/b.png", excerpt: "", author: "Plural Dynamics" });
    expect(blogs[1]!.cover).toBe(`${STRAPI_URL}/uploads/a.png`);
    const { post, more } = await getBlog({ data: { slug: "old" } });
    expect(post?.title).toBe("Old");
    expect(more.map((b) => b.slug)).toEqual(["star"]);
  });

  it("flattens solution paragraphs and points", async () => {
    vi.stubGlobal("fetch", () =>
      reply(200, { data: [{ id: 1, documentId: "s", heading: "GymFlex", order: 2, image: null, paragraphs: [{ text: "One" }, { text: "" }], points: [{ text: "Fast" }], ...base }] }),
    );
    const [s] = await listSolutions();
    expect(s).toMatchObject({ id: "s", heading: "GymFlex", image: "", paragraphs: ["One"], points: ["Fast"], order: 2 });
  });

  it("posts leads to Strapi and surfaces its error message", async () => {
    const fetchMock = vi.fn(() => reply(400, { data: null, error: { status: 400, name: "BadRequestError", message: "Please add a message" } }));
    vi.stubGlobal("fetch", fetchMock);
    const data = { firstName: "A", lastName: "", email: "a@b.co", phone: "", country: "", projectType: "", message: "", page: "/contact", website: "" };
    await expect(submitContact({ data })).rejects.toThrow("Please add a message");
    expect(fetchMock).toHaveBeenCalledWith(`${STRAPI_URL}/api/leads`, expect.objectContaining({ method: "POST", body: JSON.stringify({ data }) }));
  });
});
