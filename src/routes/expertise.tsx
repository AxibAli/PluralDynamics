import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site/Layout";
import { ExpertiseList, Process, Cta } from "@/components/site/Sections";

export const Route = createFileRoute("/expertise")({
  head: () => ({
    meta: [
      { title: "Expertise | Plural Dynamics" },
      { name: "description", content: "Custom software, exclusive ERP systems, cloud development, global outsourcing and WordPress solutions." },
      { property: "og:title", content: "Expertise | Plural Dynamics" },
      { property: "og:description", content: "Custom software, exclusive ERP systems, cloud development, global outsourcing and WordPress solutions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Expertise" title="Expertise" desc="Custom software, exclusive ERP systems, cloud development, global outsourcing and WordPress solutions." />
      <ExpertiseList /><Process /><Cta />
    </SiteLayout>
  );
}
