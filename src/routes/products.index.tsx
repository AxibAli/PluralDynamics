import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site/Layout";
import { ProductsIndex, Cta } from "@/components/site/Sections";
import { ClientStats, Platforms } from "@/components/site/Trust";
import { listSolutions } from "@/lib/cms";

export const Route = createFileRoute("/products/")({
  loader: () => listSolutions(),
  head: () => ({
    meta: [
      { title: "Our Products: GymFlex, HotelPro & More | Plural Dynamics" },
      { name: "description", content: "Ready-to-run software for gyms, hotels, training teams and more. Explore GymFlex, HotelPro, InstiSync, Nooré, Repairbox and topE by Plural Dynamics." },
      { property: "og:title", content: "Our Products | Plural Dynamics" },
      { property: "og:description", content: "Ready-to-run software for gyms, hotels, training teams and more. Explore GymFlex, HotelPro, InstiSync, Nooré, Repairbox and topE by Plural Dynamics." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Products" title="Our Products" desc="Ready-to-run software for gyms, hotels, training teams and more. Explore GymFlex, HotelPro, InstiSync, Nooré, Repairbox and topE by Plural Dynamics." />
      <ProductsIndex solutions={Route.useLoaderData()} />
      <div className="pt-24" />
      <ClientStats />
      <Platforms />
      <Cta />
    </SiteLayout>
  );
}
