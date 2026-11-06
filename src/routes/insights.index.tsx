import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site/Layout";
import { Articles, Cta } from "@/components/site/Sections";
import { listBlogs } from "@/lib/cms";
import { Loading, LoadError } from "@/components/site/Loading";

const desc = "Practical guides and honest takes on software, web and mobile development, written by the Plural Dynamics team.";

export const Route = createFileRoute("/insights/")({
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
  // Fetched in the browser so the prerendered page stays current after dashboard edits.
  const blogs = useQuery({ queryKey: ["blogs"], queryFn: listBlogs, staleTime: 30_000 });
  return (
    <SiteLayout>
      <PageHero eyebrow="Insights" title="Our Blogs" desc={desc} />
      {blogs.isPending ? <Loading /> : blogs.isError ? <LoadError /> : <Articles posts={blogs.data} />}
      <Cta />
    </SiteLayout>
  );
}
