import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site/Layout";
import { Services, Process, Cta } from "@/components/site/Sections";
import { OriginalContent } from "@/components/site/OriginalContent";
import { ServiceCategoriesGrid } from "@/components/site/ServicePage";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services | Plural Dynamics" },
      { name: "description", content: "Custom software, web, mobile, UI/UX, backend, cloud, ERP and IT support services from Plural Dynamics." },
      { property: "og:title", content: "Services | Plural Dynamics" },
      { property: "og:description", content: "Custom software, web, mobile, UI/UX, backend, cloud, ERP and IT support services from Plural Dynamics." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Services" title="Our Services" desc="Custom software, web, mobile, UI/UX, backend, cloud, ERP and IT support services from Plural Dynamics." />
      <ServiceCategoriesGrid /><OriginalContent slug="services" /><Services full /><Process /><Cta />
    </SiteLayout>
  );
}
