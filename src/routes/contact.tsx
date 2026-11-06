import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site/Layout";
import { ContactForm } from "@/components/site/Sections";

export const Route = createFileRoute("/contact")({
  // ?email= comes from the footer's "Let's Talk" box and pre-fills the form.
  validateSearch: (s: Record<string, unknown>): { email?: string } => (typeof s["email"] === "string" && s["email"] ? { email: s["email"].slice(0, 200) } : {}),
  head: () => ({
    meta: [
      { title: "Contact | Plural Dynamics" },
      { name: "description", content: "Book a free consultation with Plural Dynamics and tell us about your software project." },
      { property: "og:title", content: "Contact | Plural Dynamics" },
      { property: "og:description", content: "Book a free consultation with Plural Dynamics and tell us about your software project." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Contact" title="Contact Us" desc="Book a free consultation with Plural Dynamics and tell us about your software project." />
      <ContactForm />
    </SiteLayout>
  );
}
