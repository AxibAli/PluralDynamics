// Client for the Strapi CMS (cms/, deployed on Render). The static site reads published
// solutions and blogs, and posts contact-form leads, at VITE_STRAPI_URL. Editing happens in
// the Strapi admin panel (<VITE_STRAPI_URL>/admin). Responses are mapped to the site's
// own Blog / Solution shapes so components don't depend on Strapi's format.
import { sortBlogs, sortSolutions, type Blog, type ContactInput, type Solution } from "./cms-types";

/** Strapi origin, e.g. https://pluraldynamics-cms.onrender.com (set at build time). */
export const STRAPI_URL = (import.meta.env["VITE_STRAPI_URL"] ?? "http://localhost:1337").replace(/\/+$/, "");

type Media = { url: string } | null | undefined;
type StrapiBase = { id: number; documentId: string; createdAt: string; updatedAt: string };
type StrapiBlog = StrapiBase & Omit<Blog, "id" | "cover" | "createdAt" | "updatedAt"> & { cover?: Media };
type StrapiSolution = StrapiBase &
  Omit<Solution, "id" | "image" | "paragraphs" | "points" | "createdAt" | "updatedAt"> & {
    image?: Media;
    paragraphs?: { text: string }[] | null;
    points?: { text: string }[] | null;
  };

/** Cloudinary URLs are absolute; locally stored uploads come back as /uploads/... */
const mediaUrl = (m: Media) => (!m?.url ? "" : /^https?:\/\//i.test(m.url) ? m.url : `${STRAPI_URL}${m.url}`);
const str = (v: unknown) => (typeof v === "string" ? v : "");

const toBlog = (b: StrapiBlog): Blog => ({
  id: b.documentId,
  slug: b.slug,
  title: b.title,
  excerpt: str(b.excerpt),
  metaDescription: str(b.metaDescription),
  cover: mediaUrl(b.cover),
  category: str(b.category),
  author: str(b.author) || "Plural Dynamics",
  date: str(b.date),
  content: str(b.content),
  featured: Boolean(b.featured),
  createdAt: b.createdAt,
  updatedAt: b.updatedAt,
});

const toSolution = (s: StrapiSolution): Solution => ({
  id: s.documentId,
  heading: s.heading,
  eyebrow: str(s.eyebrow),
  tagline: str(s.tagline),
  image: mediaUrl(s.image),
  paragraphs: (s.paragraphs ?? []).map((p) => p.text).filter(Boolean),
  points: (s.points ?? []).map((p) => p.text).filter(Boolean),
  badge: str(s.badge),
  buttonLabel: str(s.buttonLabel),
  buttonLink: str(s.buttonLink),
  order: Number(s.order) || 0,
  createdAt: s.createdAt,
  updatedAt: s.updatedAt,
});

async function strapi<T>(path: string, init?: { method: "POST"; body: unknown }): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${STRAPI_URL}/api${path}`, init ? { method: init.method, headers: { "content-type": "application/json" }, body: JSON.stringify(init.body) } : undefined);
  } catch {
    throw new Error("Can't reach the server right now. Please try again in a moment.");
  }
  const json = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
  if (!res.ok) throw new Error(json.error?.message || `Request failed (${res.status})`);
  return json as T;
}

// ---------- public reads ----------

export const listSolutions = async () => {
  const { data } = await strapi<{ data: StrapiSolution[] }>("/solutions?populate=*&sort[0]=order:asc&pagination[pageSize]=100");
  return sortSolutions(data.map(toSolution));
};

export const listBlogs = async () => {
  const { data } = await strapi<{ data: StrapiBlog[] }>("/blogs?populate=cover&sort[0]=featured:desc&sort[1]=date:desc&pagination[pageSize]=100");
  return sortBlogs(data.map(toBlog));
};

export const getBlog = async ({ data }: { data: { slug: string } }) => {
  const blogs = await listBlogs();
  const post = blogs.find((b) => b.slug === data.slug) ?? null;
  const more = blogs.filter((b) => b.slug !== data.slug).slice(0, 3);
  return { post, more };
};

// ---------- contact form ----------

/** Saves a lead in Strapi; its "Email new leads" webhook then emails it to the team. */
export const submitContact = ({ data }: { data: ContactInput }) => strapi<{ ok: true }>("/leads", { method: "POST", body: { data } });
