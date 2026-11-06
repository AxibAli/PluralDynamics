import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent, type MouseEvent as RME } from "react";
import { ArrowRight, ArrowUpRight, Award, BarChart3, CalendarDays, Check, Code2, Globe, Handshake, Lightbulb, PenTool, Server, ShieldCheck, Smartphone, Cloud, Building2, LifeBuoy, LayoutTemplate, MessagesSquare, Sparkles, TrendingUp, Wrench, AppWindow, Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import heroPoster from "@/assets/hero-poster.jpg";
import heroVideo from "@/assets/hero-bg.mp4";
import heroWebm from "@/assets/hero-bg.webm";
import { CtaLink, Eyebrow, Reveal } from "./Layout";
import { contact, coreValues, expertise, featuredServices, industries, leader, pricingPlans, projectTypes, reasons, techGroups, techList, telHref } from "@/lib/site-data";
import { catalog, coreFeatures, excerpt, getPage, lead, toSections } from "@/lib/original";
import { formatDate, slugify, type Blog, type Solution } from "@/lib/cms-types";
import { submitContact } from "@/lib/cms";

const wrap = "mx-auto max-w-7xl px-5 lg:px-8";

function Heading({ eyebrow, title, desc, center }: { eyebrow: string; title: string; desc?: string | undefined; dark?: boolean; center?: boolean | undefined }) {
  return (
    <Reveal className={`mb-14 max-w-3xl ${center ? "mx-auto text-center" : ""}`}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-4 text-4xl font-bold leading-[1.05] md:text-5xl">{title}</h2>
      {desc && <p className="mt-5 text-lg text-muted-foreground">{desc}</p>}
    </Reveal>
  );
}

export function glow(e: RME<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
}

function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (reduce || saveData) return;
    v.src = v.canPlayType('video/webm; codecs="vp9"') ? heroWebm : heroVideo;
    v.play().catch(() => {});
  }, []);
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <img src={heroPoster} alt="" width={1600} height={900} className="absolute inset-0 h-full w-full object-cover" />
      <video ref={ref} muted loop playsInline autoPlay preload="none" poster={heroPoster} onPlaying={() => setReady(true)} onError={() => setReady(false)} className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`} />
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/75 to-ink/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/60" />
    </div>
  );
}

const steps = [
  { t: "Consultation", I: MessagesSquare },
  { t: "Design", I: PenTool },
  { t: "Application", I: AppWindow },
  { t: "Maintenance", I: Wrench },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink pb-16 pt-36 text-ink-foreground lg:pt-48">
      <HeroVideo />
      <div className="grid-lines absolute inset-0 opacity-40" />
      <div className={`${wrap} relative`}>
        <div className="max-w-3xl">
          <div className="reveal inline-flex items-center gap-2 rounded-full border border-ink-border bg-ink/40 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-primary backdrop-blur">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" /> We Provide Best
          </div>
          <h1 className="reveal mt-7 text-5xl font-bold leading-[0.98] sm:text-6xl lg:text-8xl" style={{ animationDelay: "80ms" }}>
            IT Solutions For Your <span className="text-primary">Company</span>
          </h1>
          <p className="reveal mt-7 max-w-xl text-lg leading-relaxed text-ink-muted" style={{ animationDelay: "180ms" }}>
            As global technology consultants, we specialize in delivering world-class software through a unique and refined process.
          </p>
          <div className="reveal mt-10 flex flex-wrap gap-3" style={{ animationDelay: "280ms" }}>
            <CtaLink to="/contact">Meet With Us</CtaLink>
            <CtaLink to="/services" variant="ghost">Our Services</CtaLink>
          </div>
        </div>
      </div>
      <div className={`${wrap} relative mt-24 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-ink-border bg-ink-border md:grid-cols-4`}>
        {steps.map(({ t, I }, i) => (
          <div key={t} className="group bg-ink/85 px-6 py-7 backdrop-blur transition-colors hover:bg-ink-2">
            <div className="flex items-center justify-between">
              <I className="h-6 w-6 text-primary transition-transform group-hover:-translate-y-0.5" />
              <span className="font-display text-sm text-ink-muted">0{i + 1}</span>
            </div>
            <div className="mt-4 font-display text-lg font-semibold">{t}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/** "Our Process" from the original Agile Product Development page. */
export function Process() {
  const sec = toSections(getPage("agile-product-development")!).find((s) => s.heading === "Our Process");
  const cards = (sec?.body ?? []).filter((b) => b.type === "card") as { title: string; desc: string }[];
  return (
    <section className="py-28">
      <div className={wrap}>
        <Heading eyebrow="Why Choose Us" title="Our Process" />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((p, i) => (
            <Reveal key={p.title} delay={(i % 3) * 90}>
              <div className="group relative h-full rounded-3xl border border-border bg-card p-7 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40">
                <div className="font-display text-5xl font-bold text-foreground/10 transition-colors group-hover:text-primary/40">0{i + 1}</div>
                <h3 className="mt-5 text-xl font-bold">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
                <div className="absolute inset-x-7 bottom-0 h-0.5 origin-left scale-x-0 bg-primary transition-transform duration-500 group-hover:scale-x-100" />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function PageCard({ slug, title, i, product }: { slug: string; title: string; i: number; product?: boolean }) {
  const inner = (
    <>
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-xl font-bold">{title}</h3>
        <ArrowUpRight className="h-5 w-5 shrink-0 text-primary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </div>
      <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-muted-foreground">{excerpt(slug)}</p>
    </>
  );
  const cls = "card-glow group flex h-full flex-col rounded-3xl border border-border bg-card p-7 shadow-card transition-transform duration-300 hover:-translate-y-1";
  return (
    <Reveal delay={(i % 3) * 70}>
      {product ? (
        <Link to="/products/$slug" params={{ slug }} onMouseMove={glow} className={cls}>{inner}</Link>
      ) : (
        <Link to="/$slug" params={{ slug }} onMouseMove={glow} className={cls}>{inner}</Link>
      )}
    </Reveal>
  );
}

export function Services({ full = false }: { full?: boolean }) {
  return (
    <section className="bg-secondary py-28">
      <div className={wrap}>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-end">
          <Heading eyebrow="What We Do" title="Product Featured Service" />
          <Reveal className="mb-14">
            <ul className="grid grid-cols-2 gap-3">
              {featuredServices.map((s) => (
                <li key={s} className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold"><Check className="h-4 w-4 shrink-0 text-primary" />{s}</li>
              ))}
            </ul>
          </Reveal>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {(full ? catalog.services : catalog.services.slice(0, 6)).map((s, i) => <PageCard key={s.slug} {...s} i={i} />)}
        </div>
        {!full && <div className="mt-10"><CtaLink to="/services" variant="ghost">All services</CtaLink></div>}
      </div>
    </section>
  );
}

export function About() {
  return (
    <section className="py-28">
      <div className={`${wrap} grid items-center gap-16 lg:grid-cols-2`}>
        <Reveal>
          <div className="relative mx-auto max-w-md">
            <div className="absolute inset-0 translate-x-5 translate-y-5 rounded-[2rem] bg-primary" />
            <div className="relative overflow-hidden rounded-[2rem] bg-[oklch(0.14_0.006_20)]">
              <div className="grid-lines absolute inset-0" />
              <img src={leader.photo} alt={`${leader.name}, ${leader.role} of Plural Dynamics`} loading="lazy" className="relative mx-auto h-[440px] w-auto object-contain object-bottom pt-8" />
              <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-border bg-card/95 p-5 backdrop-blur">
                <div className="font-display text-lg font-bold">{leader.name}</div>
                <div className="text-sm text-primary">{leader.role}</div>
              </div>
            </div>
          </div>
        </Reveal>
        <div>
          <Heading eyebrow="About Us" title="Our Story" />
          <p className="text-lg leading-relaxed text-muted-foreground">Each great journey starts with one step. At Plural Dynamics, our journey started with a passion for technology and a vision toward impactful digital solutions. Today, we are a dynamic team of tech innovators, problem solvers, and creative thinkers, committed to helping businesses succeed in the digital world.</p>
          <Reveal delay={100} className="mt-8">
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="mb-4 h-1 w-10 rounded-full bg-primary" />
              <h3 className="text-lg font-bold">Our Mission</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">We believe technology can reshape businesses. Our mission is to enable companies to thrive in the digital era while embracing the most contemporary trends of technology for growth, efficiency, and innovation. Our goal is to be rated and recognized as the world’s top-notch digital solutions service through an innovative approach toward business and excellence.</p>
            </div>
          </Reveal>
          <div className="mt-8"><CtaLink to="/about" variant="ghost">About Us</CtaLink></div>
        </div>
      </div>
    </section>
  );
}

export function Tech() {
  return (
    <section className="overflow-hidden bg-ink py-28 text-ink-foreground">
      <div className={wrap}>
        <Heading eyebrow="Built With" title="Technologies Behind Our Solutions" />
      </div>
      <div className="relative mb-16 [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
        <div className="animate-marquee flex w-max gap-4 hover:[animation-play-state:paused]">
          {[...techList, ...techList].map((t, i) => (
            <div key={i} className="rounded-full border border-ink-border bg-ink-2 px-6 py-3 font-display font-semibold text-ink-muted transition-colors hover:border-primary hover:text-primary" aria-hidden={i >= techList.length}>{t}</div>
          ))}
        </div>
      </div>
      <div className={`${wrap} grid gap-5 sm:grid-cols-2 lg:grid-cols-3`}>
        {techGroups.map((g, i) => (
          <Reveal key={g.label} delay={(i % 3) * 80}>
            <div className="h-full rounded-2xl border border-ink-border bg-ink-2 p-6">
              <div className="text-xs font-bold uppercase tracking-widest text-primary">{g.label}</div>
              <div className="mt-4 flex flex-wrap gap-2">
                {g.items.map((t) => <span key={t} className="rounded-lg border border-ink-border px-3 py-1.5 text-sm transition-colors hover:border-primary hover:text-primary">{t}</span>)}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function Why() {
  return (
    <section className="py-28">
      <div className={wrap}>
        <Heading eyebrow="Why Choose Us" title="Why Choose Plural Dynamics" />
        <div className="grid gap-px overflow-hidden rounded-3xl border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
          {reasons.map((r, i) => (
            <Reveal key={r.title} delay={(i % 3) * 80} className="h-full">
              <div className="group h-full bg-card p-8 transition-colors hover:bg-accent">
                <div className="font-display text-sm font-bold text-primary">0{i + 1}</div>
                <h3 className="mt-4 text-xl font-bold">{r.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{r.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Pricing() {
  return (
    <section className="bg-secondary py-28">
      <div className={wrap}>
        <Heading center eyebrow="Pricing Plan" title="Choose Your Best Plan" />
        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          {pricingPlans.map((p, i) => {
            const muted = p.hot ? "text-ink-muted" : "text-muted-foreground";
            return (
              <Reveal key={p.name} delay={i * 90}>
                <div className={`relative flex h-full flex-col overflow-hidden rounded-3xl border p-9 shadow-card transition-transform duration-300 hover:-translate-y-1 ${p.hot ? "border-primary bg-ink text-ink-foreground" : "border-border bg-card"}`}>
                  {p.hot && <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/25 blur-3xl" />}
                  <div className="relative flex items-center justify-between gap-3">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-primary">{p.name}</h3>
                    {p.hot && <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground"><Sparkles className="h-3.5 w-3.5" />Popular</span>}
                  </div>
                  <p className={`relative mt-3 text-sm ${muted}`}>{p.desc}</p>
                  <div className="relative mt-6 flex items-end gap-1"><span className="font-display text-7xl font-bold">${p.price}</span><span className={`pb-3 ${muted}`}>/Day</span></div>
                  <div className={`relative my-8 h-px ${p.hot ? "bg-ink-border" : "bg-border"}`} />
                  <ul className="relative flex-1 space-y-3.5">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-sm font-medium">
                        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/15 text-primary"><Check className="h-3 w-3" strokeWidth={3} /></span>{f}
                      </li>
                    ))}
                  </ul>
                  <Link to="/contact" className={`relative mt-10 block rounded-full py-3.5 text-center text-sm font-bold uppercase tracking-wide transition-transform hover:-translate-y-0.5 ${p.hot ? "bg-primary text-primary-foreground shadow-glow" : "border border-border hover:border-primary hover:text-primary"}`}>Start</Link>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Topic chip: the post's own category, else derived from the title's keywords.
export function topic(post: Pick<Blog, "title" | "category">) {
  const t = `${post.category} ${post.title}`.toLowerCase();
  const Icon = t.includes("data") ? BarChart3 : t.includes("mobile") || t.includes("app") || t.includes("firebase") ? Smartphone : t.includes("trend") ? TrendingUp : Code2;
  const label = post.category || (Icon === BarChart3 ? "Data Science" : Icon === Smartphone ? "Mobile" : Icon === TrendingUp ? "Tech Trends" : "Development");
  return { label, Icon };
}

export function ArticleCover({ a, i, tall }: { a: Blog; i: number; tall?: boolean | undefined }) {
  const { Icon } = topic(a);
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-ink ${tall ? "h-64 md:h-full md:min-h-72" : "h-full min-h-44"}`}>
      {a.cover ? (
        <img src={a.cover} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
      ) : (
        <>
          <div className="grid-lines absolute inset-0 opacity-70" />
          <div className="absolute -bottom-16 -right-10 h-48 w-48 rounded-full bg-primary/40 blur-3xl transition-transform duration-500 group-hover:scale-125" />
          <span className="absolute bottom-3 left-5 font-display text-7xl font-bold leading-none text-ink-foreground/10">{String(i + 1).padStart(2, "0")}</span>
          <div className="absolute right-4 top-4 grid h-12 w-12 place-items-center rounded-2xl border border-ink-border bg-ink-2/80 text-primary backdrop-blur transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
            <Icon className="h-6 w-6" />
          </div>
        </>
      )}
      {a.featured && <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground"><Sparkles className="h-3.5 w-3.5" />Featured</span>}
    </div>
  );
}

function ArticleMeta({ a }: { a: Blog }) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
      <span className="rounded-full bg-primary/10 px-3 py-1 uppercase tracking-wider text-primary">{topic(a).label}</span>
      <span className="inline-flex items-center gap-1.5 text-muted-foreground"><CalendarDays className="h-3.5 w-3.5" />{formatDate(a.date)}</span>
    </div>
  );
}

const articleCls = "group block h-full rounded-3xl border border-border bg-card p-3 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40";

export function ArticleCard({ a, i, featured }: { a: Blog; i: number; featured?: boolean }) {
  return (
    <Link to="/insights/$slug" params={{ slug: a.slug }} className={`${articleCls} grid gap-5 ${featured ? "md:grid-cols-[1.1fr_1fr]" : "grid-rows-[11rem_1fr]"}`}>
      <ArticleCover a={a} i={i} tall={featured} />
      <div className={`flex flex-col px-3 pb-4 ${featured ? "md:justify-center md:py-6 md:pr-6" : ""}`}>
        <ArticleMeta a={a} />
        <h3 className={`mt-4 font-bold leading-snug transition-colors group-hover:text-primary ${featured ? "text-2xl md:text-3xl" : "text-lg"}`}>{a.title}</h3>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{a.excerpt}</p>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-bold text-primary">Read article <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
      </div>
    </Link>
  );
}

/** Blog listing; posts come from the dashboard, highlighted post first. */
export function Articles({ posts, limit }: { posts: Blog[]; limit?: number }) {
  const [first, ...rest] = posts.slice(0, limit);
  if (!first) return null;
  if (limit) {
    // Home: one featured story beside a compact list.
    return (
      <section className="py-28">
        <div className={wrap}>
          <div className="flex flex-wrap items-end justify-between gap-x-6">
            <Heading eyebrow="Recent Articles" title="Latest News For Us" />
            <Link to="/insights" className="group mb-14 inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-bold transition-colors hover:border-primary hover:text-primary">
              View all insights <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
            <Reveal><ArticleCard a={first} i={0} /></Reveal>
            <div className="grid gap-6">
              {rest.map((a, i) => (
                <Reveal key={a.id} delay={(i + 1) * 90}>
                  <Link to="/insights/$slug" params={{ slug: a.slug }} className={`${articleCls} flex gap-5`}>
                    <div className="w-32 shrink-0 sm:w-40"><ArticleCover a={a} i={i + 1} /></div>
                    <div className="flex flex-col justify-center py-2 pr-3">
                      <ArticleMeta a={a} />
                      <h3 className="mt-3 text-lg font-bold leading-snug transition-colors group-hover:text-primary">{a.title}</h3>
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{a.excerpt}</p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }
  // Insights page: highlighted lead story, then a grid.
  return (
    <section className="py-24">
      <div className={wrap}>
        <Reveal><ArticleCard a={first} i={0} featured /></Reveal>
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((a, i) => (
            <Reveal key={a.id} delay={(i % 3) * 90}><ArticleCard a={a} i={i + 1} /></Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Cta() {
  return (
    <section className="px-5 pb-28">
      <Reveal className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-ink-border bg-ink px-8 py-20 text-center text-ink-foreground md:px-16">
          <div className="grid-lines absolute inset-0" />
          <div className="absolute left-1/2 top-0 h-80 w-[640px] -translate-x-1/2 rounded-full bg-primary/25 blur-[120px]" />
          <div className="relative">
            <h2 className="mx-auto max-w-3xl text-4xl font-bold leading-tight md:text-6xl">Start Your Project with Us!</h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-ink-muted">Our engineers are ready to assist you. Contact us today, and we’ll provide a prompt response.</p>
            <div className="mt-10 flex justify-center"><CtaLink to="/contact">Contact Us</CtaLink></div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export function ContactForm() {
  // Email typed into the footer's "Let's Talk" box arrives as ?email= and pre-fills the form.
  const prefill = useRouterState({ select: (s) => (s.location.search as { email?: unknown }).email });
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const d = new FormData(form);
    const v = (k: string) => String(d.get(k) ?? "").trim();
    if (!v("first") || !/^\S+@\S+\.\S+$/.test(v("email")) || !v("message")) {
      toast.error("Please add your name, a valid email and a message.");
      return;
    }
    setBusy(true);
    try {
      await submitContact({
        data: { firstName: v("first"), lastName: v("last"), email: v("email"), phone: v("phone"), country: v("country"), projectType: v("type"), message: v("message"), page: window.location.pathname, website: v("website") },
      });
      setSent(true);
      toast.success("Thanks! We'll be in touch shortly.");
      form.reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't send your message. Please try again.");
    } finally {
      setBusy(false);
    }
  };
  const field = "w-full rounded-xl border border-input bg-background px-4 py-3.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20";
  return (
    <section className="py-28">
      <div className={`${wrap} grid gap-14 lg:grid-cols-[1fr_1.3fr]`}>
        <div>
          <Heading eyebrow="Contact Us" title="Get In Touch" />
          <a href={`mailto:${contact.email}`} className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground"><Mail className="h-5 w-5" /></span>
            <span>
              <span className="block text-xs font-bold uppercase tracking-widest text-primary">Mail Us</span>
              <span className="mt-0.5 block font-semibold group-hover:text-primary">{contact.email}</span>
            </span>
          </a>
          <ul className="mt-4 space-y-4">
            {contact.offices.map((o) => (
              <li key={o.city} className="rounded-2xl border border-border bg-card p-5">
                <div className="text-xs font-bold uppercase tracking-widest text-primary">{o.city} Office · {o.country}</div>
                <div className="mt-2 flex gap-2 font-semibold"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{o.address}</div>
                <a href={telHref(o.phone)} className="mt-2 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"><Phone className="h-4 w-4 shrink-0 text-primary" />{o.phone}</a>
              </li>
            ))}
          </ul>
        </div>
        <form onSubmit={submit} className="relative rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <input name="first" placeholder="First name *" className={field} aria-label="First name" />
            <input name="last" placeholder="Last name *" className={field} aria-label="Last name" />
            <input name="email" type="email" placeholder="Email *" className={field} aria-label="Email" defaultValue={typeof prefill === "string" ? prefill : undefined} />
            <input name="phone" type="tel" placeholder="Phone *" className={field} aria-label="Phone" />
            <input name="country" placeholder="Which country do you reside in?" className={`${field} sm:col-span-2`} aria-label="Which country do you reside in?" />
            <select name="type" className={`${field} sm:col-span-2`} aria-label="Tell us about your project type?" defaultValue="">
              <option value="" disabled>Tell us about your project type?</option>
              {projectTypes.map((s) => <option key={s}>{s}</option>)}
            </select>
            <textarea name="message" rows={5} placeholder="Message *" className={`${field} sm:col-span-2`} aria-label="Message" />
            {/* Honeypot: hidden from people, bots fill it and get silently dropped */}
            <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
          </div>
          <button disabled={busy} className="mt-6 w-full rounded-full bg-primary py-4 font-bold text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5 disabled:opacity-60">{busy ? "Sending…" : sent ? "Message received ✓" : "Submit"}</button>
        </form>
      </div>
    </section>
  );
}

export function ProductsShowcase() {
  const list = ["gymflex", "hotelpro"].map((slug) => ({ slug, name: getPage(slug)!.title, lead: lead(slug), summary: excerpt(slug), features: coreFeatures(slug) }));
  const [active, setActive] = useState(0);
  const [feat, setFeat] = useState(0);
  const p = list[active]!;
  const f = p.features[feat] ?? p.features[0];
  return (
    <section className="relative overflow-hidden bg-ink py-28 text-ink-foreground">
      <div className="absolute right-0 top-1/3 h-[420px] w-[420px] rounded-full bg-primary/15 blur-[140px]" />
      <div className={`${wrap} relative`}>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Heading eyebrow="Products" title="Our Products" />
          <Link to="/products" className="group mb-14 inline-flex items-center gap-2 rounded-full border border-ink-border px-5 py-3 text-sm font-bold text-ink-foreground transition-colors hover:border-primary hover:text-primary">
            See all products <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="mb-8 inline-flex rounded-full border border-ink-border bg-ink-2 p-1">
          {list.map((x, i) => (
            <button key={x.slug} onClick={() => { setActive(i); setFeat(0); }} className={`rounded-full px-5 py-2.5 text-sm font-bold transition-all ${i === active ? "bg-primary text-primary-foreground shadow-glow" : "text-ink-muted hover:text-ink-foreground"}`}>{x.name}</button>
          ))}
        </div>
        <div key={p.slug} className="reveal grid gap-6 lg:grid-cols-[1fr_1.15fr]">
          <div className="rounded-3xl border border-ink-border bg-ink-2 p-8">
            <div className="text-xs font-bold uppercase tracking-widest text-primary">{p.lead}</div>
            <h3 className="mt-3 text-3xl font-bold">{p.name}</h3>
            <p className="mt-4 line-clamp-5 leading-relaxed text-ink-muted">{p.summary}</p>
            <div className="mt-8 space-y-1">
              {p.features.map((x, i) => (
                <button key={x.title} onMouseEnter={() => setFeat(i)} onClick={() => setFeat(i)} className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-semibold transition-all ${i === feat ? "bg-primary/10 text-ink-foreground" : "text-ink-muted hover:text-ink-foreground"}`}>
                  {x.title}<ArrowUpRight className={`h-4 w-4 text-primary transition-all ${i === feat ? "opacity-100" : "opacity-0"}`} />
                </button>
              ))}
            </div>
            <Link to="/products/$slug" params={{ slug: p.slug }} className="mt-8 inline-flex items-center gap-1 text-sm font-bold text-primary">Explore {p.name} <ArrowUpRight className="h-4 w-4" /></Link>
          </div>
          {f && <MockScreen product={p.name} feature={f} />}
        </div>
      </div>
    </section>
  );
}

function MockScreen({ product, feature }: { product: string; feature: { title: string; desc: string; points: string[] } }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-ink-border bg-ink-2 p-3 shadow-glow">
      <div className="flex items-center gap-1.5 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-primary" /><span className="h-2.5 w-2.5 rounded-full bg-ink-muted/40" /><span className="h-2.5 w-2.5 rounded-full bg-ink-muted/40" />
        <span className="ml-3 truncate rounded-md border border-ink-border px-3 py-1 text-xs text-ink-muted">{product.toLowerCase()} / {feature.title.toLowerCase().replace(/[^a-z]+/g, "-")}</span>
      </div>
      <div key={feature.title} className="reveal rounded-2xl border border-ink-border bg-ink p-5">
        <div className="font-display text-xl font-bold">{feature.title}</div>
        <p className="mt-1 text-sm text-ink-muted">{feature.desc}</p>
        <div className="mt-5 flex h-24 items-end gap-2" aria-hidden="true">
          {[40, 65, 50, 85, 60, 95, 75].map((h, i) => <div key={i} className="flex-1 rounded-t-md bg-primary opacity-80" style={{ height: `${h}%`, animation: `reveal .6s ${i * 60}ms both` }} />)}
        </div>
        <div className="mt-5 grid gap-2">
          {feature.points.map((pt) => <div key={pt} className="flex items-start gap-2 rounded-lg border border-ink-border px-3 py-2 text-sm"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{pt}</div>)}
        </div>
      </div>
    </div>
  );
}

function DashScreen({ name, panel }: { name: string; panel: string }) {
  return (
    <div className="flex h-full bg-white text-neutral-800" aria-hidden="true">
      <div className="flex w-[9%] flex-col items-center gap-[6%] border-r border-neutral-100 bg-neutral-50 pt-[4%]">
        <span className="h-2 w-2 rounded-full bg-primary" />
        {[0, 1, 2, 3, 4, 5].map((i) => <span key={i} className={`h-1.5 w-1.5 rounded-sm ${i === 0 ? "bg-primary/60" : "bg-neutral-300"}`} />)}
      </div>
      <div className="flex flex-1 flex-col gap-[3%] p-[3%]">
        <div className="flex items-center justify-between">
          <span className="text-[7px] font-bold text-primary sm:text-[8px]">{name} · Dashboard</span>
          <span className="flex items-center gap-1"><span className="h-1 w-6 rounded bg-neutral-200" /><span className="h-2.5 w-2.5 rounded-full bg-primary" /></span>
        </div>
        <div className="grid grid-cols-3 gap-[3%]">
          {[62, 48, 80].map((w, i) => (
            <div key={i} className="rounded border border-neutral-100 p-[6%]">
              <div className="h-1 w-1/2 rounded bg-neutral-200" />
              <div className="mt-1 h-1.5 rounded bg-neutral-800/70" style={{ width: `${w}%` }} />
            </div>
          ))}
        </div>
        <div className="grid flex-1 grid-cols-[1.3fr_1fr] gap-[3%]">
          <div className="flex flex-col rounded border border-neutral-100 p-[4%]">
            <span className="truncate text-[6px] font-semibold">{panel}</span>
            <div className="mt-auto flex h-3/5 items-end gap-[6%]">
              {[45, 70, 55, 90, 65, 80, 50].map((h, i) => <span key={i} className={`flex-1 rounded-t-sm ${i === 3 ? "bg-primary" : "bg-primary/30"}`} style={{ height: `${h}%` }} />)}
            </div>
          </div>
          <div className="grid grid-cols-7 content-start gap-[6%] rounded border border-neutral-100 p-[5%]">
            {Array.from({ length: 28 }, (_, i) => <span key={i} className={`aspect-square rounded-[1px] ${i === 17 ? "bg-amber-200" : i % 9 === 4 ? "bg-primary/50" : "bg-neutral-100"}`} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

function PhoneScreen({ name }: { name: string }) {
  return (
    <div className="flex h-full flex-col gap-[5%] bg-white p-[8%] pt-[14%] text-neutral-800" aria-hidden="true">
      <div className="flex items-center justify-between"><span className="text-[6px] font-bold text-primary">{name}</span><span className="h-2 w-2 rounded-full bg-primary" /></div>
      <div className="rounded-md bg-neutral-50 p-[10%]">
        <div className="mx-auto aspect-square w-3/4 rounded-full p-[14%]" style={{ background: "conic-gradient(var(--brand-primary) 0 58%, #22c55e 58% 82%, #a3a3a3 82% 100%)" }}>
          <div className="h-full w-full rounded-full bg-neutral-50" />
        </div>
      </div>
      <div className="grid grid-cols-5 gap-[8%] rounded-md bg-neutral-50 p-[8%]">
        {Array.from({ length: 15 }, (_, i) => <span key={i} className={`aspect-square rounded-full ${i % 4 === 1 ? "bg-primary" : i % 3 === 0 ? "bg-violet-400" : "bg-green-500"}`} />)}
      </div>
    </div>
  );
}

function DeviceMockup({ name, panel }: { name: string; panel: string }) {
  return (
    <div className="relative mx-auto aspect-[5/4] w-full max-w-xl">
      <div className="absolute -inset-6 rounded-full bg-primary/10 blur-3xl" />
      {/* Monitor */}
      <div className="absolute left-[14%] top-[2%] w-[78%]">
        <div className="rounded-t-2xl bg-neutral-900 p-[1.6%] pb-[3%] shadow-2xl">
          <div className="aspect-[16/10] overflow-hidden rounded-md"><DashScreen name={name} panel={panel} /></div>
        </div>
        <div className="mx-auto h-[3.2rem] w-[16%] bg-gradient-to-b from-neutral-400 to-neutral-300 [clip-path:polygon(18%_0,82%_0,100%_100%,0_100%)]" />
        <div className="mx-auto h-1.5 w-[34%] rounded-full bg-neutral-300" />
      </div>
      {/* Laptop */}
      <div className="absolute bottom-[8%] left-0 w-[50%]">
        <div className="rounded-t-xl bg-neutral-900 p-[2%] shadow-2xl">
          <div className="aspect-[16/10] overflow-hidden rounded-sm"><DashScreen name={name} panel={panel} /></div>
        </div>
        <div className="-mx-[7%] h-2.5 rounded-b-xl bg-gradient-to-b from-neutral-300 to-neutral-400"><div className="mx-auto h-1 w-1/5 rounded-b bg-neutral-500/50" /></div>
      </div>
      {/* Phone */}
      <div className="absolute bottom-[4%] right-[2%] w-[19%] rounded-[1.3rem] bg-neutral-900 p-[1.2%] shadow-2xl">
        <div className="relative aspect-[9/19] overflow-hidden rounded-[1.1rem]">
          <span className="absolute left-1/2 top-[2.5%] z-10 h-[3.5%] w-1/3 -translate-x-1/2 rounded-full bg-neutral-900" />
          <PhoneScreen name={name} />
        </div>
      </div>
    </div>
  );
}

/** "GymFlex" → ["Gym", "Flex"]: the leading part is drawn in brand red. */
function splitName(name: string): [string, string] {
  const i = name.search(/(?<=.)[A-Z]/);
  return i > 0 ? [name.slice(0, i), name.slice(i)] : ["", name];
}

/** Products page: one section per CMS product, image side alternating. */
export function ProductsIndex({ solutions }: { solutions: Solution[] }) {
  return (
    <>
      {solutions.map((p, i) => {
        const [head, tail] = splitName(p.heading);
        const external = /^https?:\/\//i.test(p.buttonLink);
        return (
          <section key={p.id} id={slugify(p.heading)} className={`scroll-mt-20 overflow-hidden py-24 ${i % 2 ? "bg-secondary" : ""}`}>
            <div className={`${wrap} grid items-center gap-14 lg:grid-cols-2 lg:gap-20`}>
              <Reveal className={i % 2 ? "lg:order-2" : ""}>
                {p.image ? (
                  <img src={p.image} alt={`${p.heading} product preview`} loading="lazy" className="mx-auto w-full max-w-xl object-contain" />
                ) : (
                  <DeviceMockup name={p.heading} panel={p.points[0] ?? "Overview"} />
                )}
              </Reveal>
              <Reveal delay={120}>
                {p.eyebrow && <div className="text-sm font-bold uppercase tracking-[0.2em] text-primary">{p.eyebrow}</div>}
                <h2 className="mt-4 text-5xl font-bold tracking-tight md:text-6xl"><span className="text-primary">{head}</span>{tail}</h2>
                {p.tagline && <p className="mt-4 text-xl font-semibold">{p.tagline}</p>}
                {p.paragraphs.map((t, k) => <p key={k} className="mt-5 text-lg leading-relaxed text-muted-foreground">{t}</p>)}
                {p.points.length > 0 && (
                  <ul className="mt-8 space-y-4">
                    {p.points.map((f) => (
                      <li key={f} className="flex items-center gap-4 text-lg">
                        <span className="h-3 w-3 shrink-0 rounded-full bg-primary ring-4 ring-primary/15" />{f}
                      </li>
                    ))}
                  </ul>
                )}
                {p.badge && <span className="mt-6 inline-flex rounded-full border border-dashed border-primary/50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">{p.badge}</span>}
                <div className="mt-10 flex flex-wrap items-center gap-6">
                  {p.buttonLink && (
                    <a href={p.buttonLink} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="group inline-flex -skew-x-12 bg-primary px-9 py-4 shadow-glow transition-transform hover:-translate-y-0.5">
                      <span className="inline-flex skew-x-12 items-center gap-2 text-lg font-bold text-primary-foreground">{p.buttonLabel || `Explore ${p.heading}`} <ArrowUpRight className="h-5 w-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span>
                    </a>
                  )}
                  <Link to="/contact" className="inline-flex items-center gap-2 font-semibold text-muted-foreground transition-colors hover:text-primary">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-foreground"><Check className="h-3 w-3" strokeWidth={3} /></span>Request a demo
                  </Link>
                </div>
              </Reveal>
            </div>
          </section>
        );
      })}
    </>
  );
}

const expIcons = [Code2, Building2, Cloud, Globe, LayoutTemplate];

export function ExpertiseList() {
  return (
    <>
      <section className="py-24">
        <div className={`${wrap} space-y-4`}>
          {expertise.map((e, i) => {
            const I = expIcons[i] ?? Code2;
            return (
              <Reveal key={e.slug} delay={60}>
                <article id={e.slug} onMouseMove={glow} className="card-glow group grid scroll-mt-28 items-center gap-6 rounded-3xl border border-border bg-card p-8 md:grid-cols-[80px_1fr]">
                  <div className="font-display text-5xl font-bold text-muted-foreground/30 transition-colors group-hover:text-primary">0{i + 1}</div>
                  <div className="min-w-0">
                    <h3 className="flex items-center gap-3 text-2xl font-bold"><I className="h-6 w-6 shrink-0 text-primary" />{e.title}</h3>
                    <p className="mt-2 max-w-3xl text-muted-foreground">{e.desc}</p>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>
      <section className="bg-secondary py-24">
        <div className={wrap}>
          <Heading eyebrow="Expertise" title="Explore our expertise" />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {catalog.expertise.map((s, i) => <PageCard key={s.slug} {...s} i={i} />)}
          </div>
        </div>
      </section>
    </>
  );
}

const indIcons = [Building2, Globe, LifeBuoy, PenTool, Server, LayoutTemplate];
export function IndustriesGrid({ compact = false }: { compact?: boolean }) {
  return (
    <section className={compact ? "py-28" : "py-24"}>
      <div className={wrap}>
        {compact && <Heading eyebrow="Industries" title="Industries" />}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {industries.map((d, i) => {
            const I = indIcons[i] ?? Globe;
            return (
              <Reveal key={d.slug} delay={(i % 3) * 80}>
                <article id={d.slug} onMouseMove={glow} className="card-glow group relative h-full scroll-mt-28 overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-card">
                  <I className="absolute -right-6 -top-6 h-32 w-32 text-foreground/[0.04] transition-transform duration-500 group-hover:scale-110 group-hover:text-primary/10" />
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-accent text-accent-foreground"><I className="h-5 w-5" /></div>
                  <h3 className="mt-6 text-xl font-bold">{d.title}</h3>
                  <p className={`mt-3 text-sm leading-relaxed text-muted-foreground ${compact ? "line-clamp-3" : ""}`}>{d.desc}</p>
                </article>
              </Reveal>
            );
          })}
        </div>
        {compact && <div className="mt-10"><Link to="/industries" className="inline-flex items-center gap-1 text-sm font-bold text-primary">All industries <ArrowUpRight className="h-4 w-4" /></Link></div>}
      </div>
    </section>
  );
}

export function IndustriesIntro() {
  return (
    <section className="py-24">
      <div className={`${wrap} grid gap-12 lg:grid-cols-[0.8fr_1.2fr]`}>
        <Reveal>
          <Eyebrow>About Us</Eyebrow>
          <h2 className="mt-4 text-4xl font-bold md:text-5xl">Advancement Of Technology</h2>
        </Reveal>
        <Reveal delay={100} className="space-y-5 text-lg leading-relaxed text-muted-foreground">
          <p>Despite the rapid advancement of technology, system software remains essential in providing user-friendly solutions tailored to clients’ needs. At Plural Dynamics, our primary goal is to develop efficient, convenient, and impactful systems that align with user preferences, work environments, and business priorities.</p>
          <p>We invest significantly in advanced and exclusive training programs for our engineers, ensuring they continuously enhance their skills. Our extensive knowledge database allows us to initiate, develop, and deliver solutions with superior effectiveness and efficiency. Client feedback underscores our credibility, demonstrating that we are up to 20% more productive than alternatives within the first 12 months of consultation. Moreover, we take pride in delivering tailored solutions up to 10 weeks ahead of schedule.</p>
        </Reveal>
      </div>
    </section>
  );
}

export function TechOrbit() {
  const ring1 = ["React", "Angular", "Node.js", ".NET", "Python", "PHP"];
  const ring2 = ["iOS", "Android", "Xamarin", "MongoDB", "MySQL", "WordPress", "Magento", "Django"];
  return (
    <section className="py-24">
      <div className={`${wrap} grid items-center gap-14 lg:grid-cols-2`}>
        <div>
          <Heading eyebrow="Technologies" title="Technology services" />
          <div className="grid gap-4">
            {catalog.technologies.map((t, i) => <PageCard key={t.slug} {...t} i={i} />)}
          </div>
        </div>
        <div className="relative mx-auto aspect-square w-full max-w-[460px]" aria-hidden="true">
          <div className="absolute inset-[30%] grid place-items-center rounded-full bg-primary shadow-glow"><span className="font-display text-xl font-bold text-primary-foreground">Plural</span></div>
          {[ring1, ring2].map((ring, r) => (
            <div key={r} className="animate-spin-slow absolute rounded-full border border-border" style={{ inset: r ? "0%" : "16%", animationDirection: r ? "reverse" : "normal", animationDuration: r ? "60s" : "40s" }}>
              {ring.map((t, i) => {
                const a = (i / ring.length) * Math.PI * 2;
                return <span key={t} className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold" style={{ left: `${50 + 50 * Math.cos(a)}%`, top: `${50 + 50 * Math.sin(a)}%` }}>{t}</span>;
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AboutStory() {
  return (
    <section className="py-24">
      <div className={`${wrap} grid gap-5 lg:grid-cols-6`}>
        <Reveal className="lg:col-span-4">
          <div className="relative h-full overflow-hidden rounded-[2rem] border border-border bg-card p-8 shadow-card md:p-12">
            <span className="pointer-events-none absolute -right-4 -top-10 select-none font-display text-[11rem] font-bold leading-none text-primary/5" aria-hidden="true">PD</span>
            <Eyebrow>Innovative Minds</Eyebrow>
            <h2 className="mt-4 text-4xl font-bold md:text-5xl">Our Story</h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">Each great journey starts with one step. At Plural Dynamics, our journey started with a passion for technology and a vision toward impactful digital solutions. Today, we are a dynamic team of tech innovators, problem solvers, and creative thinkers, committed to helping businesses succeed in the digital world.</p>
            <p className="mt-4 leading-relaxed text-muted-foreground">We’re experts in creating engaging and captivating user interfaces, mobile applications that are easy to use, and responsive websites. While our SEO techniques increase exposure and set up your company for growth, our back-end development guarantees the security, scalability, and efficiency of your systems. We at Plural Dynamics offer more than just services – we offer an opportunity for your business through us to reach out and connect with its target audience.</p>
            <div className="mt-8"><CtaLink to="/contact">Contact Us</CtaLink></div>
          </div>
        </Reveal>
        <Reveal delay={100} className="lg:col-span-2">
          <div className="relative flex h-full min-h-[440px] flex-col justify-end overflow-hidden rounded-[2rem] bg-[oklch(0.14_0.006_20)]">
            <div className="grid-lines absolute inset-0" />
            <div className="absolute left-1/2 top-1/3 h-56 w-56 -translate-x-1/2 rounded-full bg-primary/30 blur-3xl" />
            <img src={leader.photo} alt={`${leader.name}, ${leader.role} of Plural Dynamics`} loading="lazy" className="absolute inset-x-0 bottom-0 mx-auto h-[92%] w-auto object-contain object-bottom" />
            <div className="relative m-4 rounded-2xl border border-white/10 bg-black/50 p-5 text-white backdrop-blur-md">
              <div className="font-display text-lg font-bold">{leader.name}</div>
              <div className="text-sm text-primary">{leader.role}</div>
            </div>
          </div>
        </Reveal>
        <Reveal delay={150} className="lg:col-span-3">
          <div className="relative h-full overflow-hidden rounded-[2rem] bg-primary p-8 text-primary-foreground md:p-10">
            <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full border-[40px] border-white/10" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] opacity-80">Driven By Innovation</span>
            <h3 className="mt-4 text-3xl font-bold">Our Mission</h3>
            <p className="relative mt-5 leading-relaxed opacity-90">We believe technology can reshape businesses. Our mission is to enable companies to thrive in the digital era while embracing the most contemporary trends of technology for growth, efficiency, and innovation. Our goal is to be rated and recognized as the world’s top-notch digital solutions service through an innovative approach toward business and excellence.</p>
          </div>
        </Reveal>
        <Reveal delay={200} className="lg:col-span-3">
          <div className="relative h-full overflow-hidden rounded-[2rem] border border-ink-border bg-ink p-8 text-ink-foreground md:p-10">
            <div className="grid-lines absolute inset-0 opacity-60" />
            <div className="relative">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">What We Do</span>
              <h3 className="mt-4 text-3xl font-bold">Product Featured Service</h3>
              <div className="mt-6 flex flex-wrap gap-2">
                {featuredServices.map((f) => (
                  <span key={f} className="rounded-full border border-ink-border bg-ink-2 px-4 py-2 text-sm font-semibold transition-colors hover:border-primary hover:text-primary">{f}</span>
                ))}
              </div>
              <Link to="/services" className="mt-8 inline-flex items-center gap-1.5 text-sm font-bold text-primary">All services <ArrowUpRight className="h-4 w-4" /></Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const valueIcons = [Lightbulb, Award, ShieldCheck, Handshake];

export function CoreValues() {
  return (
    <section className="bg-secondary pb-32 pt-24">
      <div className={wrap}>
        <Heading eyebrow="Our Guiding Principles" title="Our Cores" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {coreValues.map((v, i) => {
            const Icon = valueIcons[i % valueIcons.length]!;
            return (
              <Reveal key={v.title} delay={i * 80} className={i % 2 ? "lg:translate-y-10" : ""}>
                <div className="group relative h-full overflow-hidden rounded-[2rem] border border-border bg-card p-7 shadow-card transition-all duration-500 hover:-translate-y-1 hover:border-primary">
                  <div className="absolute inset-x-0 bottom-0 h-0 bg-primary transition-all duration-500 group-hover:h-full" />
                  <div className="relative flex items-start justify-between">
                    <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary transition-colors duration-500 group-hover:bg-white/15 group-hover:text-primary-foreground">
                      <Icon className="h-7 w-7" />
                    </div>
                    <span className="font-display text-5xl font-bold text-primary/15 transition-colors duration-500 group-hover:text-white/25">0{i + 1}</span>
                  </div>
                  <h3 className="relative mt-10 text-xl font-bold transition-colors duration-500 group-hover:text-primary-foreground">{v.title}</h3>
                  <p className="relative mt-3 text-sm leading-relaxed text-muted-foreground transition-colors duration-500 group-hover:text-primary-foreground/85">{v.desc}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
