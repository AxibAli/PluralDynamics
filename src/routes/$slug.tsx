import { createFileRoute, notFound } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site/Layout";
import { Cta } from "@/components/site/Sections";
import { OriginalContent } from "@/components/site/OriginalContent";
import { ServiceCategoryPage } from "@/components/site/ServicePage";
import { detailSlugs, excerpt, getPage, lead } from "@/lib/original";
import { getCategory } from "@/lib/services";

export const Route = createFileRoute("/$slug")({
  loader: ({ params }) => {
    const c = getCategory(params.slug);
    if (c) return { kind: "category" as const, title: `${c.title} Services`, lead: c.headline, desc: c.metaDescription };
    const p = getPage(params.slug);
    if (!p || !detailSlugs.includes(params.slug)) throw notFound();
    return { kind: "page" as const, title: p.title, lead: lead(params.slug), desc: excerpt(params.slug) };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} | Plural Dynamics` },
          { name: "description", content: loaderData.desc.slice(0, 158) },
          { property: "og:title", content: `${loaderData.title} | Plural Dynamics` },
          { property: "og:description", content: loaderData.desc.slice(0, 158) },
          { property: "og:type", content: "website" },
          { name: "twitter:card", content: "summary_large_image" },
        ]
      : [{ title: "Page not found | Plural Dynamics" }, { name: "robots", content: "noindex" }],
  }),
  component: Page,
});

function Page() {
  const { slug } = Route.useParams();
  const d = Route.useLoaderData();
  const cat = getCategory(slug);
  if (d.kind === "category" && cat)
    return (
      <SiteLayout>
        <ServiceCategoryPage cat={cat} />
      </SiteLayout>
    );
  return (
    <SiteLayout>
      <PageHero eyebrow={d.title} title={d.lead || d.title} />
      <OriginalContent slug={slug} />
      <Cta />
    </SiteLayout>
  );
}
