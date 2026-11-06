import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site/Layout";
import { IndustriesGrid, IndustriesIntro, Cta } from "@/components/site/Sections";

export const Route = createFileRoute("/industries")({
  head: () => ({
    meta: [
      { title: "Industries | Plural Dynamics" },
      { name: "description", content: "Software solutions for real estate, travel, healthcare, media, finance and retail." },
      { property: "og:title", content: "Industries | Plural Dynamics" },
      { property: "og:description", content: "Software solutions for real estate, travel, healthcare, media, finance and retail." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Industries" title="Industries" desc="Software solutions for real estate, travel, healthcare, media, finance and retail." />
      <IndustriesIntro /><IndustriesGrid /><Cta />
    </SiteLayout>
  );
}
