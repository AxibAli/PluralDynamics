import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site/Layout";
import { Articles, Cta } from "@/components/site/Sections";
import { listBlogs } from "@/lib/cms";

const desc = "Practical guides and honest takes on software, web and mobile development, written by the Plural Dynamics team.";

export const Route = createFileRoute("/insights/")({
  loader: () => listBlogs(),
  head: () => ({
    meta: [
      { title: "Insights: Software, Web & Mobile Development Blog | Plural Dynamics" },
      { name: "description", content: desc },
      { property: "og:title", content: "Insights | Plural Dynamics" },
      { property: "og:description", content: desc },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Insights" title="Our Blogs" desc={desc} />
      <Articles posts={Route.useLoaderData()} />
      <Cta />
    </SiteLayout>
  );
}
