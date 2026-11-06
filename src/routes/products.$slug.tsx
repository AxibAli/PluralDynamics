import { createFileRoute, notFound } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site/Layout";
import { Cta } from "@/components/site/Sections";
import { OriginalContent } from "@/components/site/OriginalContent";
import { excerpt, getPage, lead, productSlugs } from "@/lib/original";

export const Route = createFileRoute("/products/$slug")({
  loader: ({ params }) => {
    const p = getPage(params.slug);
    if (!p || !productSlugs.includes(params.slug)) throw notFound();
    return { name: p.title, lead: lead(params.slug), summary: excerpt(params.slug) };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.name} | Plural Dynamics` },
          { name: "description", content: loaderData.summary.slice(0, 158) },
          { property: "og:title", content: `${loaderData.name} | Plural Dynamics` },
          { property: "og:description", content: loaderData.summary.slice(0, 158) },
          { property: "og:type", content: "website" },
          { name: "twitter:card", content: "summary_large_image" },
        ]
      : [{ title: "Product not found | Plural Dynamics" }, { name: "robots", content: "noindex" }],
  }),
  component: Page,
});

function Page() {
  const { slug } = Route.useParams();
  const d = Route.useLoaderData();
  return (
    <SiteLayout>
      <PageHero eyebrow={d.name} title={d.lead || d.name} />
      <OriginalContent slug={slug} />
      <Cta />
    </SiteLayout>
  );
}
