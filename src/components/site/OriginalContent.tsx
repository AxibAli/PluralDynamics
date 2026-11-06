import { Check, Plus } from "lucide-react";
import { Eyebrow, Reveal } from "./Layout";
import { glow } from "./Sections";
import { getPage, toSections, type Block, type Section } from "@/lib/original";

const wrap = "mx-auto max-w-7xl px-5 lg:px-8";

function Body({ body }: { body: Block[] }) {
  // group consecutive blocks of the same kind so cards form grids and bullets form lists
  const groups: { kind: string; items: Block[] }[] = [];
  for (const b of body) {
    const kind = b.type === "card" ? "card" : b.type === "li" ? "li" : b.type === "faq" ? "faq" : "flow";
    const last = groups[groups.length - 1];
    if (last && last.kind === kind) last.items.push(b);
    else groups.push({ kind, items: [b] });
  }
  return (
    <div className="space-y-8">
      {groups.map((g, gi) => {
        if (g.kind === "card")
          return (
            <div key={gi} className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {g.items.map((b, i) =>
                b.type === "card" ? (
                  <Reveal key={i} delay={(i % 3) * 70}>
                    <article onMouseMove={glow} className="card-glow group h-full rounded-3xl border border-border bg-card p-7 shadow-card transition-transform duration-300 hover:-translate-y-1">
                      <div className="font-display text-sm font-bold text-primary">{String(i + 1).padStart(2, "0")}</div>
                      <h3 className="mt-3 text-xl font-bold">{b.title}</h3>
                      {b.desc && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{b.desc}</p>}
                    </article>
                  </Reveal>
                ) : null,
              )}
            </div>
          );
        if (g.kind === "li")
          return (
            <ul key={gi} className="grid gap-3 sm:grid-cols-2">
              {g.items.map((b, i) =>
                b.type === "li" ? (
                  <li key={i} className="flex gap-3 rounded-2xl border border-border bg-card px-5 py-4 text-sm leading-relaxed">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{b.text}</span>
                  </li>
                ) : null,
              )}
            </ul>
          );
        if (g.kind === "faq")
          return (
            <div key={gi} className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card">
              {g.items.map((b, i) =>
                b.type === "faq" ? (
                  <details key={i} className="group px-6 py-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-semibold">
                      {b.q}
                      <Plus className="h-5 w-5 shrink-0 text-primary transition-transform group-open:rotate-45" />
                    </summary>
                    <p className="mt-3 text-muted-foreground">{b.a}</p>
                  </details>
                ) : null,
              )}
            </div>
          );
        return (
          <div key={gi} className="max-w-4xl space-y-4">
            {g.items.map((b, i) =>
              b.type === "h3" ? (
                <h3 key={i} className="pt-4 text-2xl font-bold">{b.text}</h3>
              ) : b.type === "p" ? (
                <p key={i} className="text-lg leading-relaxed text-muted-foreground">{b.text}</p>
              ) : null,
            )}
          </div>
        );
      })}
    </div>
  );
}

function SectionView({ s, i }: { s: Section; i: number }) {
  return (
    <section className={`py-20 md:py-24 ${i % 2 ? "bg-secondary" : ""}`}>
      <div className={wrap}>
        {(s.eyebrow || s.heading) && (
          <Reveal className="mb-10 max-w-3xl">
            {s.eyebrow && <Eyebrow>{s.eyebrow}</Eyebrow>}
            {s.heading && <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">{s.heading}</h2>}
          </Reveal>
        )}
        <Body body={s.body} />
      </div>
    </section>
  );
}

export function OriginalContent({ slug }: { slug: string }) {
  const p = getPage(slug);
  if (!p) return null;
  return <>{toSections(p).map((s, i) => <SectionView key={i} s={s} i={i} />)}</>;
}
