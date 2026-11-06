import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site/Layout";
import { AboutStory, CoreValues, Cta } from "@/components/site/Sections";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us | Plural Dynamics" },
      { name: "description", content: "Our story, mission, and core values at Plural Dynamics." },
      { property: "og:title", content: "About Us | Plural Dynamics" },
      { property: "og:description", content: "Our story, mission, and core values at Plural Dynamics." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      <PageHero eyebrow="About Us" title="About Us" desc="Our story, mission, and core values at Plural Dynamics." />
      <AboutStory /><CoreValues /><Cta />
    </SiteLayout>
  );
}
