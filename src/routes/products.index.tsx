import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site/Layout";
import { ProductsIndex, Cta } from "@/components/site/Sections";
import { ClientStats, Platforms } from "@/components/site/Trust";
import { listSolutions } from "@/lib/cms";
import { Loading, LoadError } from "@/components/site/Loading";

export const Route = createFileRoute("/products/")({
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
  // Fetched in the browser so the prerendered page stays current after dashboard edits.
  const solutions = useQuery({ queryKey: ["solutions"], queryFn: listSolutions, staleTime: 30_000 });
  return (
    <SiteLayout>
      <PageHero eyebrow="Products" title="Our Products" desc="Ready-to-run software for gyms, hotels, training teams and more. Explore GymFlex, HotelPro, InstiSync, Nooré, Repairbox and topE by Plural Dynamics." />
      {solutions.isPending ? <Loading /> : solutions.isError ? <LoadError /> : <ProductsIndex solutions={solutions.data} />}
      <div className="pt-24" />
      <ClientStats />
      <Platforms />
      <Cta />
    </SiteLayout>
  );
}
