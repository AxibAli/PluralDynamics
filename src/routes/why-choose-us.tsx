import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site/Layout";
import { Why, Cta } from "@/components/site/Sections";
import { OriginalContent } from "@/components/site/OriginalContent";

export const Route = createFileRoute("/why-choose-us")({
  head: () => ({
    meta: [
      { title: "Why Choose Us | Plural Dynamics" },
      { name: "description", content: "Choosing the right partner for your business is critical. At Plural Dynamics, we understand that your success is our success." },
      { property: "og:title", content: "Why Choose Us | Plural Dynamics" },
      { property: "og:description", content: "Choosing the right partner for your business is critical. At Plural Dynamics, we understand that your success is our success." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Why Choose Us" title="Why Partner with Plural Dynamics" />
      <OriginalContent slug="why-choose-us" />
      <Why />
      <Cta />
    </SiteLayout>
  );
}
