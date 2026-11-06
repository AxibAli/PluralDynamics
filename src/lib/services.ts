// Service categories for the mega menu and /<category> pages. New copy lives in
// service-categories.json; items with `page` reuse an original page untouched.
import data from "@/content/service-categories.json";
import { excerpt, getPage, lead } from "./original";

export type ServiceItem = { id: string; title: string; page?: string; summary?: string; body?: string[]; points?: string[] };
export type ServiceCategory = { slug: string; title: string; headline: string; intro: string; metaDescription: string; items: ServiceItem[] };

export const serviceCategories = data.categories as unknown as ServiceCategory[];
export const getCategory = (slug: string) => serviceCategories.find((c) => c.slug === slug);

/** "Cyber Security" → ["Cyber", " Security"], "e-Commerce" → ["e-", "Commerce"]; the first part renders in brand red. */
export function splitTitle(t: string): [string, string] {
  const i = t.indexOf(" ");
  if (i > 0) return [t.slice(0, i), t.slice(i)];
  const h = t.indexOf("-");
  return h > 0 ? [t.slice(0, h + 1), t.slice(h + 1)] : [t, ""];
}

/** Display content for an item: original-page items are summarised from source, never rewritten. */
export function resolveItem(item: ServiceItem) {
  if (!item.page) return { ...item, summary: item.summary ?? "", body: item.body ?? [], points: item.points ?? [], page: undefined };
  const p = getPage(item.page);
  const cards = p?.blocks.flatMap((b) => (b.type === "card" ? [b.title] : [])) ?? [];
  const lis = p?.blocks.flatMap((b) => (b.type === "li" ? [b.text.split(":")[0]!] : [])) ?? [];
  return {
    id: item.id,
    title: item.title,
    summary: lead(item.page),
    body: [excerpt(item.page)],
    points: (cards.length ? cards : lis).slice(0, 4),
    page: item.page,
  };
}
