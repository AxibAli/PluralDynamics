// Helpers that summarise original product pages; used to seed the dashboard's solutions.
import { catalog, excerpt, getPage, lead, toSections } from "./original";

// Category lines paraphrase each product's own page; drafts have no confirmed category yet.
const productCategory: Record<string, string> = {
  gymflex: "Gym Management System",
  hotelpro: "Hotel Management System",
  insitsync: "Learning Management System",
};

/** Up to four feature titles: the "Core Features" cards, else the first carded section. */
function highlights(slug: string) {
  const p = getPage(slug);
  if (!p) return [];
  const secs = toSections(p);
  const sec = secs.find((x) => x.heading?.startsWith("Core Features") && x.body.some((b) => b.type === "card")) ?? secs.find((x) => x.body.some((b) => b.type === "card"));
  return (sec?.body ?? []).flatMap((b) => (b.type === "card" ? [b.title] : [])).slice(0, 4);
}

function tagline(slug: string) {
  const h = getPage(slug)?.blocks.find((b) => b.type === "h2" && !/^(Introduction to|Get Started)/.test(b.text)) as { text: string } | undefined;
  return h?.text ?? lead(slug);
}

const isDraft = (slug: string) => getPage(slug)?.blocks.some((b) => b.type === "h3" && b.text.toLowerCase().includes("draft")) ?? false;

/** Original products expressed as dashboard solutions (no image: the page draws a device mockup). */
export function seedSolutions() {
  return catalog.products.map((p, i) => ({
    image: "",
    eyebrow: productCategory[p.slug] ?? "Product · Coming Soon",
    heading: p.title,
    tagline: tagline(p.slug),
    paragraphs: [excerpt(p.slug)],
    points: highlights(p.slug),
    badge: isDraft(p.slug) ? "Product introduction — draft" : "",
    buttonLabel: `Explore ${p.title}`,
    buttonLink: `/products/${p.slug}`,
    order: i,
  }));
}
