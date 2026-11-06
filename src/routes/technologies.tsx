import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site/Layout";
import { TechOrbit, Tech, Cta } from "@/components/site/Sections";

export const Route = createFileRoute("/technologies")({
  head: () => ({
    meta: [
      { title: "Technologies | Plural Dynamics" },
      { name: "description", content: "React, .NET, Node.js, iOS, Android, Xamarin and the full stack Plural Dynamics builds with." },
      { property: "og:title", content: "Technologies | Plural Dynamics" },
      { property: "og:description", content: "React, .NET, Node.js, iOS, Android, Xamarin and the full stack Plural Dynamics builds with." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Technologies" title="Technologies" desc="React, .NET, Node.js, iOS, Android, Xamarin and the full stack Plural Dynamics builds with." />
      <TechOrbit /><Tech /><div className="pt-28" /><Cta />
    </SiteLayout>
  );
}
