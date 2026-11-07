import { Link, useNavigate, useRouter, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowRight, ChevronDown, Globe, Mail, MapPin, Menu, Moon, Phone, Sun, X } from "lucide-react";
import logo from "@/assets/plural-logo.png";
import { contact, industries, telHref } from "@/lib/site-data";
import { serviceCategories, splitTitle, type ServiceCategory, type ServiceItem } from "@/lib/services";
import { LANGS, saveLang, useI18n, type Lang } from "@/i18n";

type MenuKey = "services";
type NavItem = { to: "/" | "/about" | "/products" | "/services" | "/industries" | "/insights"; label: string; menu?: MenuKey };

const nav: NavItem[] = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About Us" },
  { to: "/products", label: "Products" },
  { to: "/services", label: "Services", menu: "services" },
  { to: "/industries", label: "Industries" },
  { to: "/insights", label: "Insights" },
];

function closeMenu() {
  (document.activeElement as HTMLElement | null)?.blur();
}

/** Sub-service link: original pages open directly, new services jump to their block on the category page. */
function ServiceLink({ cat, item, className, onPick }: { cat: ServiceCategory; item: ServiceItem; className: string; onPick?: () => void }) {
  const { t } = useI18n();
  return item.page ? (
    <Link to="/$slug" params={{ slug: item.page }} onClick={onPick} className={className}>{t(item.title)}</Link>
  ) : (
    <Link to="/$slug" params={{ slug: cat.slug }} hash={item.id} onClick={onPick} className={className}>{t(item.title)}</Link>
  );
}

function MegaMenu() {
  const { t } = useI18n();
  return (
    <div className="mx-auto max-w-[90rem] px-5 lg:px-8">
      <div className="max-h-[calc(100vh-7rem)] overflow-y-auto rounded-3xl border border-ink-border bg-ink-2 p-8 shadow-card">
        <div className="grid grid-cols-4 gap-x-10 gap-y-8">
          {serviceCategories.map((c) => {
            const [a, b] = splitTitle(t(c.title));
            return (
              <div key={c.slug}>
                <Link to="/$slug" params={{ slug: c.slug }} onClick={closeMenu} className="block border-b border-ink-border pb-3 font-display text-lg font-bold text-ink-foreground transition-colors hover:text-primary">
                  <span className="text-primary">{a}</span>{b}
                </Link>
                <ul className="mt-3 space-y-0.5">
                  {c.items.map((it) => (
                    <li key={it.id} className="flex items-center gap-3">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary ring-[3px] ring-primary/15" />
                      <ServiceLink cat={c} item={it} onPick={closeMenu} className="py-1.5 text-sm text-ink-muted transition-colors hover:text-primary" />
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
        <div className="mt-8 flex items-center justify-between border-t border-ink-border pt-5 text-sm">
          <span className="text-ink-muted">{t("Not sure which service fits? We'll help you choose.")}</span>
          <Link to="/services" onClick={closeMenu} className="inline-flex items-center gap-1.5 font-bold text-primary hover:underline">{t("View all services")} <ArrowRight className="h-4 w-4 rtl:rotate-180" /></Link>
        </div>
      </div>
    </div>
  );
}

export function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e?.isIntersecting && (setOn(true), io.disconnect()), { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`${on ? "reveal" : "opacity-0"} ${className}`} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode; dark?: boolean | undefined }) {
  const { t } = useI18n();
  return (
    <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
      <span className="h-px w-8 bg-current" /> {typeof children === "string" ? t(children) : children}
    </span>
  );
}

export function CtaLink({ to, children, variant = "primary" }: { to: "/contact" | "/services" | "/about"; children: ReactNode; variant?: "primary" | "ghost" }) {
  const base = "group inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold transition-all duration-300";
  const v = variant === "primary"
    ? "bg-primary text-primary-foreground shadow-glow hover:-translate-y-0.5 hover:bg-primary/90"
    : "border border-ink-border text-ink-foreground hover:border-primary hover:text-primary";
  const { t } = useI18n();
  return (
    <Link to={to} className={`${base} ${v}`}>
      {typeof children === "string" ? t(children) : children}
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
    </Link>
  );
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { t } = useI18n();
  const [dark, setDark] = useState(true);
  useEffect(() => setDark(document.documentElement.classList.contains("dark")), []);
  const toggle = () => {
    const next = !dark;
    const root = document.documentElement;
    root.classList.add("theme-anim");
    root.classList.toggle("dark", next);
    root.style.colorScheme = next ? "dark" : "light";
    try { localStorage.setItem("pd-theme", next ? "dark" : "light"); } catch { /* ignore */ }
    setDark(next);
    window.setTimeout(() => root.classList.remove("theme-anim"), 400);
  };
  return (
    <button type="button" onClick={toggle} aria-label={dark ? t("Switch to light theme") : t("Switch to dark theme")} title={dark ? t("Light theme") : t("Dark theme")} className={`grid h-11 w-11 place-items-center rounded-full border border-ink-border text-ink-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-primary ${className}`}>
      {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}

/** Header dropdown that switches the site language (saved in a cookie; Arabic flips to right-to-left). */
function LanguageSwitcher() {
  const { lang, t } = useI18n();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);
  const pick = async (code: Lang) => {
    setOpen(false);
    if (code === lang) return;
    saveLang(code);
    await router.invalidate();
  };
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(!open)} aria-haspopup="listbox" aria-expanded={open} aria-label={t("Change language")} title={t("Change language")} className="flex h-11 items-center gap-1.5 rounded-full border border-ink-border px-3 text-sm font-bold text-ink-foreground transition-colors hover:border-primary hover:text-primary">
        <Globe className="h-4 w-4" />
        <span className="uppercase">{lang}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul role="listbox" aria-label={t("Change language")} className="absolute end-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-2xl border border-ink-border bg-ink-2 p-1.5 shadow-card">
          {LANGS.map((l) => (
            <li key={l.code}>
              <button type="button" role="option" aria-selected={l.code === lang} onClick={() => void pick(l.code)} lang={l.code} dir={l.dir} className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${l.code === lang ? "bg-primary/10 text-primary" : "text-ink-foreground hover:bg-primary/5 hover:text-primary"}`}>
                {l.native}
                <span className="text-xs font-bold uppercase text-ink-muted">{l.code}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Header() {
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 24);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 h-20 transition-all duration-300 ${scrolled || open ? "border-b border-ink-border bg-ink/90 backdrop-blur-xl" : "bg-transparent"}`}>
        <div className="mx-auto flex h-full max-w-[90rem] items-center justify-between gap-4 px-5 lg:px-8">
          <Link to="/" className="shrink-0" onClick={() => setOpen(false)} aria-label="Plural Dynamics home">
            <img src={logo} alt="Plural Dynamics" className="logo-adapt h-9 w-auto" width={190} height={48} />
          </Link>
          <nav className="hidden items-center xl:flex" aria-label="Main">
            {nav.map((n) =>
              n.menu ? (
                <div key={n.label} className="group">
                  <Link to={n.to} className="flex items-center gap-1 rounded-full px-2.5 py-2 text-sm font-semibold text-ink-muted transition-colors hover:text-primary" activeProps={{ className: "text-ink-foreground" }}>
                    {t(n.label)} <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
                  </Link>
                  <div className="invisible absolute inset-x-0 top-full translate-y-2 pt-1 opacity-0 transition-all duration-200 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    <MegaMenu />
                  </div>
                </div>
              ) : (
                <Link key={n.label} to={n.to} activeOptions={{ exact: true }} className="relative rounded-full px-2.5 py-2 text-sm font-semibold text-ink-muted transition-colors hover:text-primary" activeProps={{ className: "text-ink-foreground after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-primary" }}>
                  {t(n.label)}
                </Link>
              ),
            )}
          </nav>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <Link to="/contact" className="hidden rounded-full bg-primary px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5 sm:inline-flex">
              {t("Free Consultancy")}
            </Link>
            <button onClick={() => setOpen(!open)} className="grid h-11 w-11 place-items-center rounded-full border border-ink-border text-ink-foreground xl:hidden" aria-label={open ? t("Close menu") : t("Open menu")} aria-expanded={open}>
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>
      <div className={`fixed inset-x-0 bottom-0 top-20 z-40 overflow-y-auto bg-ink px-5 pb-10 transition-all duration-300 xl:hidden ${open ? "visible opacity-100" : "invisible -translate-y-2 opacity-0"}`}>
        <nav className="flex flex-col pt-4" aria-label="Mobile">
          {nav.map((n) =>
            n.menu ? (
              <details key={n.label} className="group border-b border-ink-border">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between py-3 font-display text-2xl font-semibold text-ink-foreground">
                  {t(n.label)} <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-180" />
                </summary>
                <div className="grid gap-1 pb-4">
                  {serviceCategories.map((c) => {
                    const [a, b] = splitTitle(t(c.title));
                    return (
                      <div key={c.slug} className="grid gap-0.5 pt-3">
                        <Link to="/$slug" params={{ slug: c.slug }} onClick={() => setOpen(false)} className="px-3 py-1.5 font-display text-base font-bold text-ink-foreground"><span className="text-primary">{a}</span>{b}</Link>
                        {c.items.map((it) => <ServiceLink key={it.id} cat={c} item={it} onPick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-ink-muted hover:text-primary" />)}
                      </div>
                    );
                  })}
                </div>
              </details>
            ) : (
              <Link key={n.label} to={n.to} onClick={() => setOpen(false)} className="border-b border-ink-border py-4 font-display text-2xl font-semibold text-ink-foreground" activeOptions={{ exact: true }} activeProps={{ className: "text-primary" }}>
                {t(n.label)}
              </Link>
            ),
          )}
          <Link to="/contact" onClick={() => setOpen(false)} className="mt-8 rounded-full bg-primary py-4 text-center font-bold uppercase text-primary-foreground">
            {t("Free Consultancy")}
          </Link>
        </nav>
      </div>
    </>
  );
}

/** Arrow tile used on the footer's square buttons. */
function ArrowTile({ tone }: { tone: "red" | "light" }) {
  return (
    <span className={`grid h-full w-12 shrink-0 place-items-center ${tone === "red" ? "bg-primary text-primary-foreground" : "bg-white text-primary"}`}>
      <span className="grid h-7 w-7 place-items-center rounded-full border-2 border-current transition-transform duration-300 group-hover:translate-x-0.5">
        <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
      </span>
    </span>
  );
}

function FooterCol({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-s-2 border-border ps-5">
      <h4 className="font-display text-lg font-semibold text-foreground">{title}</h4>
      <ul className="mt-5 space-y-3 text-sm text-muted-foreground">{children}</ul>
    </div>
  );
}

function Footer() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const a = "transition-colors hover:text-primary";
  const start = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();
    // Hand the address to the contact form, which opens with it filled in.
    void navigate({ to: "/contact", search: email ? { email } : {} });
  };
  return (
    <footer className="relative overflow-hidden bg-[oklch(0.13_0.01_20)] text-white">
      {/* Brand glow + texture behind the band */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -left-40 -top-40 h-[560px] w-[560px] rounded-full bg-primary/45 blur-[140px]" />
        <div className="absolute right-[-10%] top-10 h-[420px] w-[620px] rotate-12 rounded-full bg-[oklch(0.45_0.17_15)]/40 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-72 w-[520px] rounded-full bg-[oklch(0.62_0.19_40)]/25 blur-[120px]" />
        <div className="grid-lines absolute inset-0 opacity-30" />
      </div>

      {/* Band: headline + email */}
      <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-24 lg:px-8">
        <span className="grid h-11 w-11 place-items-center bg-white text-primary shadow-card"><Mail className="h-5 w-5" /></span>
        <h2 className="mt-8 max-w-3xl text-4xl font-semibold leading-[1.1] md:text-6xl">
          {t("You Bring The Idea.")}
          <br />
          {t("We’ll Build The")} <span className="text-primary">{t("Software.")}</span>
        </h2>
        <p className="mt-5 max-w-2xl text-lg text-white/70">{t("From the first sketch to launch day and beyond, we turn plans into products people love to use. Share your email and we’ll start the conversation.")}</p>
        <form onSubmit={start} className="mt-10 flex max-w-2xl flex-col gap-3 sm:flex-row">
          <label htmlFor="footer-email" className="sr-only">{t("Your email")}</label>
          <input id="footer-email" name="email" type="email" placeholder={t("Enter your email…")} autoComplete="email" className="h-14 flex-1 border border-white/15 bg-white/10 px-5 text-sm text-white outline-none backdrop-blur transition placeholder:text-white/55 focus:border-primary focus:bg-white/15" />
          <button className="group flex h-14 items-stretch border-2 border-white bg-white font-semibold text-neutral-900">
            <span className="flex items-center px-6">{t("Let’s Talk")}</span>
            <ArrowTile tone="red" />
          </button>
        </form>
      </div>

      {/* Card */}
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="bg-card text-foreground shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)] dark:ring-1 dark:ring-white/10">
          <div className="grid gap-12 p-8 md:p-12 lg:grid-cols-[1.35fr_1fr_1fr_1fr_1.25fr] lg:gap-8">
            <div>
              <img src={logo} alt="Plural Dynamics" className="logo-adapt h-10 w-auto" width={190} height={48} loading="lazy" />
              <p className="mt-10 max-w-[15ch] font-display text-[1.75rem] font-semibold leading-tight">
                {t("Software That Moves Your Business")} <span className="text-primary">{t("Forward.")}</span>
              </p>
              <Link to="/contact" className="group mt-8 inline-flex h-12 items-stretch border-2 border-primary bg-[oklch(0.16_0.01_20)] text-sm font-semibold text-white">
                <span className="flex items-center px-5">{t("Get In Touch")}</span>
                <ArrowTile tone="red" />
              </Link>
            </div>
            <FooterCol title={t("Services")}>
              {serviceCategories.slice(0, 5).map((c) => (
                <li key={c.slug}><Link to="/$slug" params={{ slug: c.slug }} className={a}>{t(c.title)}</Link></li>
              ))}
            </FooterCol>
            <FooterCol title={t("Industries")}>
              {industries.slice(0, 5).map((i) => (
                <li key={i.slug}><Link to="/industries" className={a}>{t(i.title.replace(/ and .*| & .*/, ""))}</Link></li>
              ))}
            </FooterCol>
            <FooterCol title={t("Company")}>
              <li><Link to="/about" className={a}>{t("About Us")}</Link></li>
              <li><Link to="/products" className={a}>{t("Products")}</Link></li>
              <li><Link to="/insights" className={a}>{t("Insights")}</Link></li>
              <li><Link to="/why-choose-us" className={a}>{t("Why Choose Us")}</Link></li>
              <li><Link to="/contact" className={a}>{t("Contact Us")}</Link></li>
            </FooterCol>
            <FooterCol title={t("Contact")}>
              <li><a href={`mailto:${contact.email}`} className={`${a} inline-flex items-center gap-2 font-semibold text-foreground`}><Mail className="h-4 w-4 shrink-0 text-primary" />{contact.email}</a></li>
              {contact.offices.map((o) => (
                <li key={o.city}>
                  <a href={telHref(o.phone)} className={`${a} flex items-start gap-2`}>
                    <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    <span><span className="block text-xs font-semibold uppercase tracking-wider text-foreground">{t(o.city)}</span>{o.phone}</span>
                  </a>
                </li>
              ))}
            </FooterCol>
          </div>
          <div className="flex flex-col gap-3 border-t border-border px-8 py-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-12">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {contact.offices.map((o) => (
                <span key={o.city} className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-primary" />{t(o.city)}, {t(o.country)}</span>
              ))}
            </div>
            <span>{t("© {year} Plural Dynamics. All rights reserved.", { year: new Date().getFullYear() })}</span>
          </div>
        </div>
      </div>

      {/* Closing stripes */}
      <div
        className="relative mt-14 h-28"
        aria-hidden="true"
        style={{
          backgroundImage: "repeating-linear-gradient(to bottom, transparent 0 9px, color-mix(in oklab, var(--brand-primary) 55%, transparent) 9px 11px, transparent 11px 16px, rgba(0,0,0,.55) 16px 19px)",
          maskImage: "linear-gradient(to bottom, transparent, black 35%, black)",
        }}
      />
    </footer>
  );
}

/** Brand-red bar at the very top while a navigation waits on data; hidden for quick hops. */
function RouteProgress() {
  const { t } = useI18n();
  const loading = useRouterState({ select: (s) => s.status === "pending" });
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!loading) return setShow(false);
    const t = window.setTimeout(() => setShow(true), 150);
    return () => window.clearTimeout(t);
  }, [loading]);
  if (!show) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px]" role="progressbar" aria-label={t("Loading page")}>
      <div className="route-progress h-full bg-primary shadow-glow" />
    </div>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  // Key the page on the path that has finished loading: the old page stays (and eases back)
  // while the next one loads, then the new page mounts and plays its entrance.
  const pathname = useRouterState({ select: (s) => (s.resolvedLocation ?? s.location).pathname });
  // Leaving = a navigation to a different page is in flight (not a #hash or ?query change).
  const leaving = useRouterState({ select: (s) => s.status === "pending" && s.location.pathname !== s.resolvedLocation?.pathname });
  return (
    <div className="page-shell min-h-screen overflow-x-hidden" data-leaving={leaving || undefined}>
      <RouteProgress />
      <Header />
      <main key={pathname} className="animate-page">{children}</main>
      <Footer />
    </div>
  );
}

export function PageHero({ eyebrow, title, desc }: { eyebrow: string; title: ReactNode; desc?: string }) {
  const { t } = useI18n();
  return (
    <section className="relative overflow-hidden bg-ink pb-20 pt-36 text-ink-foreground md:pb-24 md:pt-40">
      <div className="grid-lines absolute inset-0" />
      <div className="absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full bg-primary/20 blur-[120px]" />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="reveal mt-5 max-w-4xl break-words text-4xl font-bold leading-[1.05] sm:text-5xl md:text-7xl">{typeof title === "string" ? t(title) : title}</h1>
        {desc && <p className="reveal mt-6 max-w-2xl text-lg text-ink-muted" style={{ animationDelay: "120ms" }}>{t(desc)}</p>}
      </div>
    </section>
  );
}
