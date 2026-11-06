// Verbatim content extracted from pluraldynamics.com (template filler removed).
import data from "@/content/original-pages.json";
import drafts from "@/content/product-drafts.json";

export type Block =
  | { type: "eyebrow" | "h2" | "h3" | "p" | "li"; text: string }
  | { type: "card"; title: string; desc: string }
  | { type: "faq"; q: string; a: string };
export type OriginalPage = { slug: string; title: string; blocks: Block[] };
export type Section = { eyebrow?: string; heading?: string; body: Block[] };

const pages = { ...drafts, ...data } as unknown as Record<string, OriginalPage>;

export const getPage = (slug: string): OriginalPage | undefined => pages[slug];

export function toSections(page: OriginalPage): Section[] {
  const out: Section[] = [];
  let cur: Section | null = null;
  for (const b of page.blocks) {
    if (b.type === "eyebrow") {
      cur = { eyebrow: b.text, body: [] };
      out.push(cur);
    } else if (b.type === "h2") {
      if (cur && cur.heading === undefined && cur.body.length === 0) cur.heading = b.text;
      else {
        cur = { heading: b.text, body: [] };
        out.push(cur);
      }
    } else {
      if (!cur) {
        cur = { body: [] };
        out.push(cur);
      }
      cur.body.push(b);
    }
  }
  return out.filter((s) => s.body.length > 0);
}

export function excerpt(slug: string): string {
  const p = getPage(slug);
  const first = p?.blocks.find((b) => b.type === "p") as { text: string } | undefined;
  return first?.text ?? "";
}

export function lead(slug: string): string {
  const p = getPage(slug);
  const h = p?.blocks.find((b) => b.type === "h2") as { text: string } | undefined;
  return h?.text ?? "";
}

/** Feature cards plus the bullet lines that follow each, from the section named "Core Features…". */
export function coreFeatures(slug: string) {
  const p = getPage(slug);
  if (!p) return [];
  const sec = toSections(p).find((s) => s.heading?.startsWith("Core Features"));
  const feats: { title: string; desc: string; points: string[] }[] = [];
  for (const b of sec?.body ?? []) {
    if (b.type === "card") feats.push({ title: b.title, desc: b.desc, points: [] });
    else if ((b.type === "p" || b.type === "li") && feats.length) feats[feats.length - 1]!.points.push(b.text);
  }
  return feats;
}

export type CatalogItem = { slug: string; title: string };
const item = (slug: string): CatalogItem => ({ slug, title: getPage(slug)?.title ?? slug });

// Menu groups follow the original site; missing product introductions are explicitly marked drafts.
export const catalog = {
  products: ["gymflex", "hotelpro", "insitsync", "noore", "repairbox", "tope"].map(item),
  services: ["agile-product-development", "cloud-software-development", "desktop-software-development", "enterprise-cloud-computing-services", "it-support-services", "shopify", "wordpress-development"].map(item),
  expertise: ["branding", "custom-erp-development", "custom-software-solutions", "digital-marketing", "enterprise-web-development", "mobile-app-development", "product-development", "web-app-development"].map(item),
  technologies: ["android-development", "hybrid-app-development", "ios-development"].map(item),
};

export const productSlugs = catalog.products.map((p) => p.slug);
export const detailSlugs = [...catalog.services, ...catalog.expertise, ...catalog.technologies].map((p) => p.slug);

export function articles() {
  const p = getPage("the-current");
  const list: { title: string; excerpt: string; date: string }[] = [];
  let a: { title: string; excerpt: string; date: string } | null = null;
  for (const b of p?.blocks ?? []) {
    if (b.type === "h2") list.push((a = { title: b.text, excerpt: "", date: "" }));
    else if (b.type === "p" && a) {
      if (/^[A-Z][a-z]+ \d{1,2}, \d{4}$/.test(b.text)) a.date = b.text;
      else a.excerpt = b.text;
    }
  }
  return list;
}
