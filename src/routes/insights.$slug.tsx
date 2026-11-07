import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, Clock, Link2, UserRound } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout, Eyebrow, Reveal } from "@/components/site/Layout";
import { ArticleCard, ArticleCover, Cta, topic } from "@/components/site/Sections";
import { BlogContent, outline } from "@/components/site/BlogContent";
import { getBlog } from "@/lib/cms";
import { formatDate, readingMinutes } from "@/lib/cms-types";
import { useI18n } from "@/i18n";

export const Route = createFileRoute("/insights/$slug")({
  loader: async ({ params }) => {
    const res = await getBlog({ data: { slug: params.slug } });
    if (!res.post) throw notFound();
    return { post: res.post, more: res.more };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.post;
    if (!p) return { meta: [{ title: "Post not found | Plural Dynamics" }, { name: "robots", content: "noindex" }] };
    const desc = (p.metaDescription || p.excerpt).slice(0, 158);
    return {
      meta: [
        { title: `${p.title} | Plural Dynamics Insights` },
        { name: "description", content: desc },
        { property: "og:title", content: p.title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "article:published_time", content: p.date },
        ...(p.cover ? [{ property: "og:image", content: p.cover }] : []),
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: Page,
});

function Page() {
  const { t } = useI18n();
  const { post: p, more } = Route.useLoaderData();
  const toc = outline(p.content);
  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success(t("Link copied"));
    } catch {
      toast.error(t("Couldn't copy the link"));
    }
  };
  return (
    <SiteLayout>
      <article>
        <header className="relative overflow-hidden bg-ink pb-16 pt-36 text-ink-foreground md:pt-40">
          <div className="grid-lines absolute inset-0" />
          <div className="absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full bg-primary/20 blur-[120px]" />
          <div className="relative mx-auto max-w-4xl px-5 lg:px-8">
            <Link to="/insights" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-muted transition-colors hover:text-primary"><ArrowLeft className="h-4 w-4 rtl:rotate-180" />{t("All insights")}</Link>
            <div className="mt-8"><Eyebrow>{topic(p).label}</Eyebrow></div>
            <h1 className="reveal mt-5 text-4xl font-bold leading-[1.08] md:text-6xl">{p.title}</h1>
            {p.excerpt && <p className="reveal mt-6 text-xl leading-relaxed text-ink-muted" style={{ animationDelay: "80ms" }}>{p.excerpt}</p>}
            <div className="reveal mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-semibold text-ink-muted" style={{ animationDelay: "140ms" }}>
              {p.author && <span className="inline-flex items-center gap-2"><UserRound className="h-4 w-4 text-primary" />{p.author}</span>}
              <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary" /><time dateTime={p.date}>{formatDate(p.date)}</time></span>
              <span className="inline-flex items-center gap-2"><Clock className="h-4 w-4 text-primary" />{t("{n} min read", { n: readingMinutes(p.content) })}</span>
            </div>
          </div>
        </header>

        <div className="mx-auto -mt-2 max-w-5xl px-5 pt-10 lg:px-8">
          <div className="aspect-[21/9] overflow-hidden rounded-[2rem] border border-border shadow-card">
            <ArticleCover a={p} i={0} tall />
          </div>
        </div>

        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 lg:grid-cols-[1fr_260px] lg:px-8">
          <div className="min-w-0 max-w-3xl">
            <BlogContent source={p.content} />
            <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-8">
              <span className="text-sm font-semibold text-muted-foreground">{t("Found this useful? Share it with your team.")}</span>
              <button type="button" onClick={share} className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-bold transition-colors hover:border-primary hover:text-primary"><Link2 className="h-4 w-4" />{t("Copy link")}</button>
            </div>
          </div>
          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            {toc.length > 1 && (
              <nav aria-label={t("On this page")} className="rounded-3xl border border-border bg-card p-6">
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{t("On this page")}</div>
                <ol className="mt-4 space-y-2.5 text-sm">
                  {toc.map((h) => <li key={h.id}><a href={`#${h.id}`} className="text-muted-foreground transition-colors hover:text-primary">{h.text}</a></li>)}
                </ol>
              </nav>
            )}
            <div className="rounded-3xl bg-ink p-6 text-ink-foreground">
              <div className="font-display text-xl font-bold">{t("Have a project in mind?")}</div>
              <p className="mt-2 text-sm text-ink-muted">{t("Talk to our team about what you're building.")}</p>
              <Link to="/contact" className="mt-5 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-glow">{t("Free consultancy")}</Link>
            </div>
          </aside>
        </div>
      </article>

      {more.length > 0 && (
        <section className="bg-secondary py-24">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <Eyebrow>Keep Reading</Eyebrow>
            <h2 className="mt-4 text-4xl font-bold md:text-5xl">{t("More from our blog")}</h2>
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {more.map((a, i) => <Reveal key={a.id} delay={i * 80}><ArticleCard a={a} i={i + 1} /></Reveal>)}
            </div>
          </div>
        </section>
      )}
      <div className="pt-28" />
      <Cta />
    </SiteLayout>
  );
}
