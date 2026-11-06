import { useState } from "react";
import { ChevronsLeft, ChevronsRight, Star } from "lucide-react";
import { CtaLink, Reveal } from "./Layout";
import { catalog } from "@/lib/original";
import { serviceCategories } from "@/lib/services";
import { industries, techList } from "@/lib/site-data";
import reviews from "@/content/testimonials.json";

const wrap = "mx-auto max-w-7xl px-5 lg:px-8";

// Every figure is counted from site content; "5+ years" comes from the original mobile-app-development page.
const stats = [
  { value: "5+", label: "Years of Experience" },
  { value: String(catalog.products.length), label: "In-House Products" },
  { value: String(serviceCategories.length), label: "Service Areas" },
  { value: `${techList.length}+`, label: "Technologies" },
  { value: String(industries.length), label: "Industries Served" },
];

type Review = { draft: boolean; quote: string; name: string; role: string; avatar?: string };
// Initials avatars until a real photo is supplied; one gradient per position keeps them distinct.
const avatarBg = ["from-rose-500 to-orange-400", "from-sky-500 to-indigo-500", "from-emerald-500 to-teal-400", "from-violet-500 to-fuchsia-500", "from-amber-500 to-red-500"];
const list = reviews.testimonials as Review[];

export function ClientStats() {
  const [i, setI] = useState(0);
  const r = list[i % list.length];
  const step = (d: number) => setI((x) => (x + d + list.length) % list.length);
  return (
    <section className="relative">
      {/* Black stats bar overlapping the red band */}
      <div className="relative z-10 mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal>
          <dl className="grid grid-cols-2 gap-y-8 bg-[oklch(0.12_0.004_20)] px-6 py-10 text-white shadow-card sm:grid-cols-3 lg:grid-cols-5">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <dd className="font-display text-5xl font-bold tracking-tight md:text-6xl">{s.value}</dd>
                <dt className="mt-2 text-xs font-bold uppercase tracking-[0.15em] text-white/80 md:text-sm">{s.label}</dt>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
      <div className="relative -mt-16 overflow-hidden bg-primary pb-24 pt-36 text-primary-foreground">
        <div className="absolute -left-24 top-10 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-72 w-72 rounded-full border-[48px] border-white/10" />
        <div className={`${wrap} relative grid items-center gap-14 lg:grid-cols-2`}>
          <Reveal>
            <h2 className="text-5xl font-bold uppercase leading-[0.95] md:text-7xl">Clients who grow with us</h2>
            <p className="mt-8 text-lg font-semibold uppercase tracking-wide">Here's what our clients have to say about us…</p>
            <div className="mt-8 rounded-2xl bg-white p-6 text-neutral-900 shadow-card">
              <p className="font-display text-xl font-bold">Ready to be our next success story?</p>
              <p className="mt-1 text-sm text-neutral-600">Tell us what you're building and we'll reply within one business day.</p>
              <div className="mt-5"><CtaLink to="/contact">Start a project</CtaLink></div>
            </div>
          </Reveal>
          {r && (
            <Reveal delay={120}>
              <div className="relative">
                <figure key={i} className="reveal relative rounded-2xl bg-white p-8 pb-16 text-neutral-700 shadow-card md:p-10 md:pb-16">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex gap-1 text-amber-400" aria-label="5 out of 5 stars">
                      {[0, 1, 2, 3, 4].map((k) => <Star key={k} className="h-6 w-6 fill-current" />)}
                    </div>
                    {r.draft && <span className="rounded-full border border-dashed border-primary px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">Sample review</span>}
                  </div>
                  <blockquote className="mt-6 text-lg leading-relaxed">“{r.quote}”</blockquote>
                  <div className="absolute bottom-5 right-8 font-display text-sm font-bold text-neutral-400">{String((i % list.length) + 1).padStart(2, "0")} / {String(list.length).padStart(2, "0")}</div>
                </figure>
                <div className="-mt-10 flex items-end gap-4 pl-8">
                  {r.avatar ? (
                    <img src={r.avatar} alt={r.name} loading="lazy" className="h-20 w-20 rounded-full border-4 border-white object-cover shadow-card" />
                  ) : (
                    <span className={`grid h-20 w-20 place-items-center rounded-full border-4 border-white bg-gradient-to-br ${avatarBg[i % avatarBg.length]} font-display text-2xl font-bold text-white shadow-card`} aria-hidden="true">
                      {r.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                    </span>
                  )}
                  <figcaption className="pb-1">
                    <div className="font-display text-xl font-bold uppercase">{r.name}</div>
                    <div className="text-white/85">{r.role}</div>
                  </figcaption>
                </div>
                <div className="absolute -right-3 top-1/3 flex flex-col gap-3 md:-right-7">
                  <button type="button" onClick={() => step(1)} aria-label="Next review" className="grid h-14 w-14 place-items-center rounded-full border-2 border-primary bg-white text-primary shadow-card transition-transform hover:scale-105"><ChevronsRight className="h-6 w-6" /></button>
                  <button type="button" onClick={() => step(-1)} aria-label="Previous review" className="grid h-14 w-14 place-items-center rounded-full border-2 border-white/60 bg-primary text-white transition-transform hover:scale-105"><ChevronsLeft className="h-6 w-6" /></button>
                </div>
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}

// Platforms Plural Dynamics builds on, from the original "Built With" list (not partner accreditations).
const platforms = [
  { name: "React", note: "Web & Mobile UI" },
  { name: "C# · .NET", note: "Enterprise Apps" },
  { name: "WordPress", note: "CMS & Websites" },
  { name: "Magento", note: "E-commerce" },
  { name: "Python", note: "Data & Backend" },
  { name: "Android · iOS", note: "Native Mobile" },
];

export function Platforms() {
  return (
    <section className="py-28">
      <div className={wrap}>
        <Reveal className="text-center">
          <h2 className="text-4xl font-bold uppercase md:text-6xl"><span className="text-primary">Platforms</span> We Build On</h2>
          <div className="mx-auto mt-6 flex max-w-xl items-center" aria-hidden="true">
            <span className="h-3 w-3 rounded-full bg-foreground" /><span className="h-1 flex-1 bg-primary" /><span className="h-3 w-3 rounded-full bg-foreground" />
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">Proven, well-supported technologies, so the software we build for you is easy to maintain and simple to hire for.</p>
        </Reveal>
        <div className="mt-14 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-6">
          {platforms.map((p, i) => (
            <Reveal key={p.name} delay={i * 60}>
              <div className="group grid h-40 place-items-center rounded-xl border border-border bg-card p-4 text-center shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary">
                <div>
                  <div className="font-display text-2xl font-bold transition-colors group-hover:text-primary">{p.name}</div>
                  <div className="mt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{p.note}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
