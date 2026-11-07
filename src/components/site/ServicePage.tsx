import { Link } from "@tanstack/react-router";
import { ArrowDown, ArrowUpRight, BarChart3, BrainCircuit, Cloud, Code2, Compass, Boxes, LifeBuoy, PenTool, ShieldCheck, ShoppingCart, Smartphone, Users, type LucideIcon } from "lucide-react";
import { Eyebrow, Reveal } from "./Layout";
import { ContactForm } from "./Sections";
import { resolveItem, serviceCategories, splitTitle, type ServiceCategory } from "@/lib/services";
import { useI18n } from "@/i18n";

const wrap = "mx-auto max-w-7xl px-5 lg:px-8";

export const categoryIcons: Record<string, LucideIcon> = {
  "cyber-security": ShieldCheck,
  "software-development": Code2,
  "app-development": Smartphone,
  "erp-implementation": Boxes,
  "cloud-services": Cloud,
  "artificial-intelligence": BrainCircuit,
  "staff-augmentation": Users,
  "it-assurance": LifeBuoy,
  ecommerce: ShoppingCart,
  "strategy-consulting": Compass,
  "data-analytics": BarChart3,
  "design-solutions": PenTool,
};

function ServiceVisual({ Icon, title, points, n }: { Icon: LucideIcon; title: string; points: string[]; n: number }) {
  const { t } = useI18n();
  return (
    <div className="group relative aspect-[5/4] overflow-hidden rounded-[2rem] border border-ink-border bg-ink text-ink-foreground shadow-card">
      <div className="grid-lines absolute inset-0 opacity-70" />
      <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-primary/35 blur-3xl transition-transform duration-700 group-hover:scale-125" />
      <span className="absolute -bottom-6 right-4 select-none font-display text-[9rem] font-bold leading-none text-ink-foreground/[0.06]" aria-hidden="true">{String(n).padStart(2, "0")}</span>
      <div className="relative flex h-full flex-col justify-between p-8 md:p-10">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-glow transition-transform duration-500 group-hover:-rotate-6">
          <Icon className="h-8 w-8" />
        </div>
        <div>
          <div className="font-display text-2xl font-bold md:text-3xl">{t(title)}</div>
          <div className="mt-5 flex flex-wrap gap-2" aria-hidden="true">
            {points.slice(0, 3).map((p) => <span key={p} className="rounded-full border border-ink-border bg-ink-2/80 px-3 py-1.5 text-xs font-semibold text-ink-muted backdrop-blur">{t(p)}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ServiceCategoryPage({ cat }: { cat: ServiceCategory }) {
  const { t } = useI18n();
  const Icon = categoryIcons[cat.slug] ?? Code2;
  const items = cat.items.map(resolveItem);
  const [a, b] = splitTitle(t(cat.title));
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink pb-20 pt-36 text-ink-foreground md:pt-40">
        <div className="grid-lines absolute inset-0" />
        <div className="absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full bg-primary/20 blur-[120px]" />
        <div className={`${wrap} relative grid items-center gap-12 lg:grid-cols-[1.25fr_1fr]`}>
          <div>
            <Eyebrow>Our Services</Eyebrow>
            <h1 className="reveal mt-5 text-5xl font-bold leading-[1.02] md:text-7xl"><span className="text-primary">{a}</span>{b}</h1>
            <p className="reveal mt-6 text-2xl font-semibold leading-snug" style={{ animationDelay: "80ms" }}>{t(cat.headline)}</p>
            <p className="reveal mt-5 max-w-2xl text-lg leading-relaxed text-ink-muted" style={{ animationDelay: "140ms" }}>{t(cat.intro)}</p>
            <div className="reveal mt-9 flex flex-wrap gap-4" style={{ animationDelay: "200ms" }}>
              <a href="#contact" className="inline-flex -skew-x-12 bg-primary px-8 py-4 shadow-glow transition-transform hover:-translate-y-0.5">
                <span className="inline-flex skew-x-12 items-center gap-2 font-bold text-primary-foreground">{t("Get a free quote")} <ArrowUpRight className="h-5 w-5 rtl:-scale-x-100" /></span>
              </a>
            </div>
          </div>
          {/* In-page index doubles as the hero visual */}
          <nav aria-label={t(cat.title)} className="reveal rounded-[2rem] border border-ink-border bg-ink-2/70 p-6 backdrop-blur" style={{ animationDelay: "160ms" }}>
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground"><Icon className="h-5 w-5" /></span>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-ink-muted">{t("What we offer")}</span>
            </div>
            <ol className="divide-y divide-ink-border">
              {items.map((it, i) => (
                <li key={it.id}>
                  <a href={`#${it.id}`} className="group flex items-center gap-4 py-3.5 font-semibold transition-colors hover:text-primary">
                    <span className="font-display text-sm text-primary">{String(i + 1).padStart(2, "0")}</span>
                    <span className="flex-1">{t(it.title)}</span>
                    <ArrowDown className="h-4 w-4 text-ink-muted transition-transform group-hover:translate-y-0.5 group-hover:text-primary" />
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </section>

      {/* One block per sub-service, image side alternating */}
      {items.map((it, i) => (
        <section key={it.id} id={it.id} className={`scroll-mt-20 py-20 md:py-24 ${i % 2 ? "bg-secondary" : ""}`}>
          <div className={`${wrap} grid items-center gap-12 lg:grid-cols-2 lg:gap-20`}>
            <Reveal className={i % 2 ? "lg:order-2" : ""}>
              <ServiceVisual Icon={Icon} title={it.title} points={it.points} n={i + 1} />
            </Reveal>
            <Reveal delay={100}>
              <div className="text-sm font-bold uppercase tracking-[0.2em] text-primary">{String(i + 1).padStart(2, "0")} · {t(cat.title)}</div>
              <h2 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">{t(it.title)}</h2>
              {it.summary && <p className="mt-4 text-xl font-semibold leading-snug">{t(it.summary)}</p>}
              {it.body.map((p) => <p key={p.slice(0, 32)} className="mt-4 text-lg leading-relaxed text-muted-foreground">{t(p)}</p>)}
              {it.points.length > 0 && (
                <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                  {it.points.map((p) => (
                    <li key={p} className="flex items-start gap-3 font-medium">
                      <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-primary ring-4 ring-primary/15" />{t(p)}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-9">
                {it.page ? (
                  <Link to="/$slug" params={{ slug: it.page }} className="group inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 font-bold transition-colors hover:border-primary hover:text-primary">
                    {t("Explore {name}", { name: t(it.title) })} <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                ) : (
                  <a href="#contact" className="group inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 font-bold transition-colors hover:border-primary hover:text-primary">
                    {t("Discuss your project")} <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </a>
                )}
              </div>
            </Reveal>
          </div>
        </section>
      ))}

      <div id="contact" className="scroll-mt-16">
        <ContactForm />
      </div>

      <RelatedServices current={cat.slug} />
    </>
  );
}

function RelatedServices({ current }: { current: string }) {
  const { t } = useI18n();
  return (
    <section className="bg-secondary py-24">
      <div className={wrap}>
        <Eyebrow>Explore More</Eyebrow>
        <h2 className="mt-4 text-4xl font-bold md:text-5xl">{t("More ways we can help")}</h2>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {serviceCategories.filter((c) => c.slug !== current).map((c, i) => {
            const I = categoryIcons[c.slug] ?? Code2;
            const [a, b] = splitTitle(t(c.title));
            return (
              <Reveal key={c.slug} delay={(i % 4) * 60}>
                <Link to="/$slug" params={{ slug: c.slug }} className="group flex h-full items-center gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"><I className="h-5 w-5" /></span>
                  <span className="font-display font-bold"><span className="text-primary">{a}</span>{b}</span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/** Grid of all service categories, used on /services. */
export function ServiceCategoriesGrid() {
  const { t } = useI18n();
  return (
    <section className="py-24">
      <div className={wrap}>
        <Eyebrow>What We Do</Eyebrow>
        <h2 className="mt-4 max-w-3xl text-4xl font-bold md:text-5xl">{t("Everything you need to build, run and grow your software")}</h2>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {serviceCategories.map((c, i) => {
            const I = categoryIcons[c.slug] ?? Code2;
            const [a, b] = splitTitle(t(c.title));
            return (
              <Reveal key={c.slug} delay={(i % 3) * 70}>
                <Link to="/$slug" params={{ slug: c.slug }} className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card p-7 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary">
                  <div className="flex items-start justify-between">
                    <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"><I className="h-7 w-7" /></span>
                    <ArrowUpRight className="h-5 w-5 text-primary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                  <h3 className="mt-6 text-2xl font-bold"><span className="text-primary">{a}</span>{b}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t(c.headline)}</p>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {c.items.map((it) => <li key={it.id} className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-foreground">{t(it.title)}</li>)}
                  </ul>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
