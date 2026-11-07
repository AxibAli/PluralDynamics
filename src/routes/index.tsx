import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/Layout";
import { listBlogs } from "@/lib/cms";
import { About, Articles, Cta, Hero, IndustriesGrid, Pricing, ProductsShowcase, Services, Tech, Why } from "@/components/site/Sections";

export const Route = createFileRoute("/")({
  loader: () => listBlogs(),
  head: () => ({
    meta: [
      { title: "Plural Dynamics — IT Solutions For Your Company" },
      { name: "description", content: "As global technology consultants, we specialize in delivering world-class software through a unique and refined process." },
      { property: "og:title", content: "Plural Dynamics — IT Solutions For Your Company" },
      { property: "og:description", content: "As global technology consultants, we specialize in delivering world-class software through a unique and refined process." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const blogs = Route.useLoaderData();
  return (
    <SiteLayout>
      <Hero />
      <Services />
      <ProductsShowcase />
      <About />
      <IndustriesGrid compact />
      <Tech />
      <Why />
      <Pricing />
      <Articles posts={blogs} limit={3} />
      <Cta />
    </SiteLayout>
  );
}
