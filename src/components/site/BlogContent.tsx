// Renders the dashboard's lightweight post format as React nodes (never raw HTML):
//   ## Heading / ### Subheading, "- " bullets, "1. " numbered items, "> " quotes,
//   ![alt](image-url) on its own line, **bold**, and [link text](url). Blank lines split paragraphs.
import type { ReactNode } from "react";

const safe = (u: string) => u.startsWith("/") || /^https?:\/\//i.test(u);

function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  for (let m = re.exec(text); m; m = re.exec(text)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1]) out.push(<strong key={m.index} className="font-bold text-foreground">{m[1]}</strong>);
    else if (m[2] && m[3] && safe(m[3]))
      out.push(
        <a key={m.index} href={m[3]} className="font-semibold text-primary underline underline-offset-4" {...(/^https?:/i.test(m[3]) ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
          {m[2]}
        </a>,
      );
    else out.push(m[0]);
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export const headingId = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** Section headings, for the table of contents. */
export const outline = (src: string) =>
  src
    .split(/\r?\n/)
    .filter((l) => l.startsWith("## "))
    .map((l) => ({ id: headingId(l.slice(3)), text: l.slice(3).trim() }));

export function BlogContent({ source }: { source: string }) {
  const blocks = source.replace(/\r\n/g, "\n").split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className="space-y-6 text-lg leading-[1.85] text-muted-foreground">
      {blocks.map((b, i) => {
        const lines = b.split("\n");
        if (b.startsWith("### ")) return <h3 key={i} className="pt-4 text-2xl font-bold text-foreground">{inline(b.slice(4))}</h3>;
        if (b.startsWith("## ")) {
          const t = b.slice(3);
          return <h2 key={i} id={headingId(t)} className="scroll-mt-28 pt-6 text-3xl font-bold leading-tight text-foreground">{inline(t)}</h2>;
        }
        const img = /^!\[([^\]]*)\]\(([^)\s]+)\)$/.exec(b);
        if (img && safe(img[2]!))
          return (
            <figure key={i} className="py-2">
              <img src={img[2]} alt={img[1]} loading="lazy" className="w-full rounded-3xl border border-border" />
              {img[1] && <figcaption className="mt-3 text-center text-sm">{img[1]}</figcaption>}
            </figure>
          );
        if (lines.every((l) => l.startsWith("> ")))
          return (
            <blockquote key={i} className="rounded-r-2xl border-l-4 border-primary bg-primary/5 px-6 py-5 font-display text-xl font-semibold italic text-foreground">
              {inline(lines.map((l) => l.slice(2)).join(" "))}
            </blockquote>
          );
        if (lines.every((l) => /^[-*] /.test(l)))
          return (
            <ul key={i} className="space-y-3">
              {lines.map((l, k) => (
                <li key={k} className="flex gap-3"><span className="mt-3 h-2 w-2 shrink-0 rounded-full bg-primary" /><span>{inline(l.slice(2))}</span></li>
              ))}
            </ul>
          );
        if (lines.every((l) => /^\d+\. /.test(l)))
          return (
            <ol key={i} className="space-y-3">
              {lines.map((l, k) => (
                <li key={k} className="flex gap-4">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 font-display text-sm font-bold text-primary">{k + 1}</span>
                  <span>{inline(l.replace(/^\d+\. /, ""))}</span>
                </li>
              ))}
            </ol>
          );
        return <p key={i}>{inline(lines.join(" "))}</p>;
      })}
    </div>
  );
}
