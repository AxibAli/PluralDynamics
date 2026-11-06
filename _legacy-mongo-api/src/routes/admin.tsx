import { createFileRoute, Link, notFound, useNavigate, useRouter } from "@tanstack/react-router";
import { useRef, useState, type ReactNode } from "react";
import { AlertTriangle, ArrowDown, ArrowUp, ExternalLink, Eye, FileText, ImagePlus, Inbox, LayoutGrid, Loader2, LogOut, Mail, Pencil, Plus, Star, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/plural-logo.png";
import { ThemeToggle } from "@/components/site/Layout";
import { BlogContent } from "@/components/site/BlogContent";
import { adminLogin, adminLogout, adminStatus, deleteBlog, deleteContact, deleteSolution, listBlogs, listContacts, listSolutions, saveBlog, saveSolution, uploadImage } from "@/lib/cms";
import { Loading } from "@/components/site/Loading";
import { formatDate, slugify, type Blog, type BlogInput, type Contact, type Solution, type SolutionInput } from "@/lib/cms-types";

export const Route = createFileRoute("/admin")({
  ssr: false, // runs in the browser: the session token lives in localStorage
  pendingComponent: () => <Loading />,
  loader: async () => {
    const status = await adminStatus();
    if (!status.enabled) throw notFound(); // hidden when ADMIN_DASHBOARD=off
    if (!status.signedIn) return { status, solutions: [] as Solution[], blogs: [] as Blog[], contacts: [] as Contact[] };
    const [solutions, blogs, contacts] = await Promise.all([listSolutions(), listBlogs(), status.messages ? listContacts() : Promise.resolve([] as Contact[])]);
    return { status, solutions, blogs, contacts };
  },
  head: () => ({ meta: [{ title: "Dashboard | Plural Dynamics" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: AdminPage,
});

const errMsg = (e: unknown) => (e instanceof Error ? e.message : "Something went wrong");
const input = "w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20";
const btn = "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-colors disabled:opacity-50";
const btnPrimary = `${btn} bg-primary text-primary-foreground shadow-glow hover:bg-primary/90`;
const btnGhost = `${btn} border border-border hover:border-primary hover:text-primary`;

function AdminPage() {
  const { status } = Route.useLoaderData();
  if (!status.configured) return <Notice />;
  if (!status.signedIn) return <Login />;
  return <Dashboard />;
}

function Shell({ children }: { children: ReactNode }) {
  return <div className="grid min-h-screen place-items-center bg-secondary px-5">{children}</div>;
}

function Notice() {
  return (
    <Shell>
      <div className="max-w-md rounded-3xl border border-border bg-card p-8 shadow-card">
        <img src={logo} alt="Plural Dynamics" className="logo-adapt h-9 w-auto" />
        <h1 className="mt-6 text-2xl font-bold">Dashboard is locked</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Set <code className="rounded bg-muted px-1.5 py-0.5">ADMIN_PASSWORD</code> (at least 8 characters) in the project's <code className="rounded bg-muted px-1.5 py-0.5">.env</code> file or server environment, then restart the server.
        </p>
      </div>
    </Shell>
  );
}

function Login() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const password = String(new FormData(e.currentTarget).get("password") ?? "");
    setBusy(true);
    try {
      await adminLogin({ data: { password } });
      await router.invalidate();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Shell>
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl border border-border bg-card p-8 shadow-card">
        <img src={logo} alt="Plural Dynamics" className="logo-adapt h-9 w-auto" />
        <h1 className="mt-6 text-2xl font-bold">Sign in to the dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">Manage solutions and blog posts.</p>
        <label className="mt-6 block text-sm font-semibold" htmlFor="pw">Password</label>
        <input id="pw" name="password" type="password" autoComplete="current-password" required className={`${input} mt-2`} />
        <button disabled={busy} className={`${btnPrimary} mt-6 w-full py-3`}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}Sign in</button>
      </form>
    </Shell>
  );
}

type Tab = "solutions" | "blogs" | "messages";

function Dashboard() {
  const { solutions, blogs, contacts, status } = Route.useLoaderData();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("solutions");
  const [editing, setEditing] = useState<Solution | Blog | "new" | null>(null);

  const logout = async () => {
    await adminLogout();
    await router.invalidate();
  };
  const pick = (t: Tab) => {
    setTab(t);
    setEditing(null);
  };
  const nav = (t: Tab, label: string, Icon: typeof LayoutGrid, count: number) => (
    <button type="button" onClick={() => pick(t)} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-colors ${tab === t ? "bg-primary text-primary-foreground" : "text-ink-muted hover:bg-ink-2 hover:text-ink-foreground"}`}>
      <Icon className="h-4 w-4" />
      <span className="flex-1 text-left">{label}</span>
      <span className={`rounded-full px-2 py-0.5 text-xs ${tab === t ? "bg-white/20" : "bg-ink-2"}`}>{count}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-secondary lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="flex flex-col gap-2 border-b border-ink-border bg-ink p-5 text-ink-foreground lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <Link to="/" className="mb-6 block"><img src={logo} alt="Plural Dynamics" className="logo-adapt h-8 w-auto" /></Link>
        <div className="mb-2 px-4 text-[11px] font-bold uppercase tracking-[0.2em] text-ink-muted">Content</div>
        {nav("solutions", "Solutions", LayoutGrid, solutions.length)}
        {nav("blogs", "Blogs", FileText, blogs.length)}
        {status.messages && nav("messages", "Messages", Inbox, contacts.length)}
        <div className="mt-auto flex items-center gap-2 pt-6">
          <ThemeToggle />
          <button type="button" onClick={logout} className="flex flex-1 items-center justify-center gap-2 rounded-full border border-ink-border py-3 text-sm font-bold text-ink-muted hover:border-primary hover:text-primary"><LogOut className="h-4 w-4" />Sign out</button>
        </div>
      </aside>
      <main className="min-w-0 p-5 md:p-10">
        {!status.db && (
          <Warn>
            {status.dbError
              ? <>The database isn't reachable right now, so changes can't be saved. Usually this means your current IP isn't allowed in MongoDB Atlas (Security → Network Access).</>
              : <>Database not connected. Add <code>MONGODB_URI</code> to <code>.env</code> and restart the server.</>}
            {status.dbError && (
              <details className="mt-2 text-xs opacity-70">
                <summary className="cursor-pointer">Technical details</summary>
                <code className="mt-1 block whitespace-pre-wrap break-all">{status.dbError}</code>
              </details>
            )}
          </Warn>
        )}
        {status.messages && !status.mail && <Warn>Email isn't set up, so contact-form messages are only stored here. Add the <code>SMTP_*</code> settings to <code>.env</code> to receive them by email.</Warn>}
        {tab === "messages" && status.messages ? (
          <MessageList list={contacts} />
        ) : tab === "solutions" ? (
          editing ? <SolutionForm key={editing === "new" ? "new" : editing.id} item={editing === "new" ? null : (editing as Solution)} nextOrder={solutions.length} onDone={() => setEditing(null)} /> : <SolutionList list={solutions} onEdit={setEditing} />
        ) : editing ? (
          <BlogForm key={editing === "new" ? "new" : editing.id} item={editing === "new" ? null : (editing as Blog)} onDone={() => setEditing(null)} />
        ) : (
          <BlogList list={blogs} onEdit={setEditing} />
        )}
      </main>
    </div>
  );
}

function PageHead({ title, desc, action }: { title: string; desc: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      </div>
      {action}
    </div>
  );
}

function useAction() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const run = async <T,>(fn: () => Promise<T>, ok: string) => {
    setBusy(true);
    try {
      const r = await fn();
      await router.invalidate();
      toast.success(ok);
      return r;
    } catch (e) {
      toast.error(errMsg(e));
      return undefined;
    } finally {
      setBusy(false);
    }
  };
  return { busy, run };
}

const Thumb = ({ src, fallback }: { src: string; fallback: string }) =>
  src ? <img src={src} alt="" className="h-14 w-20 shrink-0 rounded-lg border border-border object-cover" /> : <div className="grid h-14 w-20 shrink-0 place-items-center rounded-lg bg-ink font-display text-lg font-bold text-primary">{fallback.slice(0, 2)}</div>;

// ---------------- Solutions ----------------

function SolutionList({ list, onEdit }: { list: Solution[]; onEdit: (s: Solution | "new") => void }) {
  const { busy, run } = useAction();
  const remove = (s: Solution) => window.confirm(`Delete "${s.heading}"? This can't be undone.`) && run(() => deleteSolution({ data: { id: s.id } }), "Solution deleted");
  const move = (i: number, d: number) => {
    const a = list[i];
    const b = list[i + d];
    if (!a || !b) return;
    // Swap, then renumber so every row's order matches its position.
    const next = [...list];
    next[i] = b;
    next[i + d] = a;
    void run(async () => {
      for (const [k, s] of next.entries()) if (s.order !== k) await saveSolution({ data: { ...s, order: k } });
    }, "Order updated");
  };
  return (
    <>
      <PageHead title="Solutions" desc="Each solution appears as its own section on the Solutions page, in this order." action={<button type="button" onClick={() => onEdit("new")} className={btnPrimary}><Plus className="h-4 w-4" />Add solution</button>} />
      <div className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card">
        {list.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">No solutions yet. Add your first one.</p>}
        {list.map((s, i) => (
          <div key={s.id} className="flex flex-wrap items-center gap-4 p-4">
            <Thumb src={s.image} fallback={s.heading} />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold uppercase tracking-wider text-primary">{s.eyebrow || "No headline"}</div>
              <div className="truncate font-display text-lg font-bold">{s.heading}</div>
              <div className="truncate text-sm text-muted-foreground">{s.tagline}</div>
            </div>
            <div className="flex items-center gap-1">
              <IconBtn label="Move up" disabled={busy || i === 0} onClick={() => move(i, -1)}><ArrowUp className="h-4 w-4" /></IconBtn>
              <IconBtn label="Move down" disabled={busy || i === list.length - 1} onClick={() => move(i, 1)}><ArrowDown className="h-4 w-4" /></IconBtn>
              <a href={`/products#${slugify(s.heading)}`} target="_blank" rel="noreferrer" aria-label="View live" title="View live" className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-primary"><Eye className="h-4 w-4" /></a>
              <IconBtn label="Edit" onClick={() => onEdit(s)}><Pencil className="h-4 w-4" /></IconBtn>
              <IconBtn label="Delete" disabled={busy} danger onClick={() => remove(s)}><Trash2 className="h-4 w-4" /></IconBtn>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function SolutionForm({ item, nextOrder, onDone }: { item: Solution | null; nextOrder: number; onDone: () => void }) {
  const navigate = useNavigate();
  const { busy, run } = useAction();
  const [v, setV] = useState<SolutionInput>(
    item ?? { image: "", eyebrow: "", heading: "", tagline: "", paragraphs: [""], points: [""], badge: "", buttonLabel: "", buttonLink: "", order: nextOrder },
  );
  const set = <K extends keyof SolutionInput>(k: K, val: SolutionInput[K]) => setV((x) => ({ ...x, [k]: val }));
  const save = async (view: boolean) => {
    const saved = await run(() => saveSolution({ data: item ? { ...v, id: item.id } : v }), item ? "Solution updated" : "Solution added");
    if (!saved) return;
    if (view) await navigate({ to: "/products", hash: slugify(saved.heading) });
    else onDone();
  };
  return (
    <FormFrame title={item ? `Edit: ${item.heading}` : "Add a solution"} onCancel={onDone} busy={busy} onSave={() => save(false)} onSaveView={() => save(true)}>
      <Card title="Image">
        <ImageField value={v.image} onChange={(x) => set("image", x)} hint="Product screenshot or device mockup (PNG, JPG, WebP, GIF up to 5 MB). Leave empty to show the built-in device mockup." />
      </Card>
      <Card title="Text">
        <Field label="Headline" hint='Small red line above the name, e.g. "HRMS · ERP Platform".'><input className={input} value={v.eyebrow} onChange={(e) => set("eyebrow", e.target.value)} /></Field>
        <Field label="Heading *" hint="Product name. A camel-case name like NexFirm gets a two-colour look."><input className={input} required value={v.heading} onChange={(e) => set("heading", e.target.value)} /></Field>
        <Field label="Sub-heading" hint="One-line promise under the name."><input className={input} value={v.tagline} onChange={(e) => set("tagline", e.target.value)} /></Field>
        <ListField label="Paragraphs" items={v.paragraphs} onChange={(x) => set("paragraphs", x)} multiline addLabel="Add paragraph" />
        <ListField label="Points" items={v.points} onChange={(x) => set("points", x)} addLabel="Add point" />
        <Field label="Badge (optional)" hint='Small outlined label, e.g. "Coming soon".'><input className={input} value={v.badge} onChange={(e) => set("badge", e.target.value)} /></Field>
      </Card>
      <Card title="Explore button">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Button text" hint="Defaults to “Explore <name>”."><input className={input} value={v.buttonLabel} onChange={(e) => set("buttonLabel", e.target.value)} /></Field>
          <Field label="Button link" hint="A page on this site (/products/gymflex) or a full URL (https://…)."><input className={input} value={v.buttonLink} onChange={(e) => set("buttonLink", e.target.value)} placeholder="https://" /></Field>
        </div>
      </Card>
    </FormFrame>
  );
}

// ---------------- Blogs ----------------

function BlogList({ list, onEdit }: { list: Blog[]; onEdit: (b: Blog | "new") => void }) {
  const { busy, run } = useAction();
  const remove = (b: Blog) => window.confirm(`Delete "${b.title}"? This can't be undone.`) && run(() => deleteBlog({ data: { id: b.id } }), "Post deleted");
  const feature = (b: Blog) => run(() => saveBlog({ data: { ...b, featured: !b.featured } }), b.featured ? "Highlight removed" : "Post highlighted at the top");
  return (
    <>
      <PageHead title="Blogs" desc="The highlighted post (★) is shown first on the Insights page and home page; the rest follow newest first." action={<button type="button" onClick={() => onEdit("new")} className={btnPrimary}><Plus className="h-4 w-4" />New post</button>} />
      <div className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card">
        {list.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">No posts yet. Write your first one.</p>}
        {list.map((b) => (
          <div key={b.id} className="flex flex-wrap items-center gap-4 p-4">
            <Thumb src={b.cover} fallback={b.title} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                {b.featured && <span className="rounded-full bg-primary px-2 py-0.5 font-bold text-primary-foreground">Highlighted</span>}
                {formatDate(b.date)}{b.category && ` · ${b.category}`}
              </div>
              <div className="truncate font-display text-lg font-bold">{b.title}</div>
              <div className="truncate text-sm text-muted-foreground">/insights/{b.slug}</div>
            </div>
            <div className="flex items-center gap-1">
              <IconBtn label={b.featured ? "Remove highlight" : "Highlight at top"} disabled={busy} onClick={() => feature(b)}><Star className={`h-4 w-4 ${b.featured ? "fill-primary text-primary" : ""}`} /></IconBtn>
              <a href={`/insights/${b.slug}`} target="_blank" rel="noreferrer" aria-label="View live" title="View live" className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-primary"><Eye className="h-4 w-4" /></a>
              <IconBtn label="Edit" onClick={() => onEdit(b)}><Pencil className="h-4 w-4" /></IconBtn>
              <IconBtn label="Delete" disabled={busy} danger onClick={() => remove(b)}><Trash2 className="h-4 w-4" /></IconBtn>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

const today = () => new Date().toISOString().slice(0, 10);

function BlogForm({ item, onDone }: { item: Blog | null; onDone: () => void }) {
  const navigate = useNavigate();
  const { busy, run } = useAction();
  const [v, setV] = useState<BlogInput>(
    item ?? { title: "", slug: "", excerpt: "", metaDescription: "", cover: "", category: "", author: "Plural Dynamics", date: today(), content: "", featured: false },
  );
  const [preview, setPreview] = useState(false);
  const set = <K extends keyof BlogInput>(k: K, val: BlogInput[K]) => setV((x) => ({ ...x, [k]: val }));
  const save = async (view: boolean) => {
    const saved = await run(() => saveBlog({ data: item ? { ...v, id: item.id } : v }), item ? "Post updated" : "Post published");
    if (!saved) return;
    if (view) await navigate({ to: "/insights/$slug", params: { slug: saved.slug } });
    else onDone();
  };
  return (
    <FormFrame title={item ? `Edit: ${item.title}` : "New blog post"} onCancel={onDone} busy={busy} onSave={() => save(false)} onSaveView={() => save(true)}>
      <Card title="Post">
        <Field label="Title *"><input className={input} required value={v.title} onChange={(e) => set("title", e.target.value)} /></Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="URL slug" hint={`Leave empty to use: ${slugify(v.title || "post-title")}`}><input className={input} value={v.slug} onChange={(e) => set("slug", e.target.value.toLowerCase())} placeholder="my-post-title" /></Field>
          <Field label="Category" hint="e.g. Mobile, Cloud, AI. Shown as a chip on the card."><input className={input} value={v.category} onChange={(e) => set("category", e.target.value)} /></Field>
          <Field label="Author"><input className={input} value={v.author} onChange={(e) => set("author", e.target.value)} /></Field>
          <Field label="Publish date"><input type="date" className={input} value={v.date} onChange={(e) => set("date", e.target.value)} /></Field>
        </div>
        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4">
          <input type="checkbox" className="mt-1 h-4 w-4 accent-[var(--brand-primary)]" checked={v.featured} onChange={(e) => set("featured", e.target.checked)} />
          <span>
            <span className="block text-sm font-bold">Highlight this post</span>
            <span className="block text-xs text-muted-foreground">It moves to the top spot on the Insights and home pages. Only one post can be highlighted; ticking this removes the highlight from any other post.</span>
          </span>
        </label>
      </Card>
      <Card title="Cover image">
        <ImageField value={v.cover} onChange={(x) => set("cover", x)} hint="Wide image works best (around 1600×700). Leave empty for the branded cover." />
      </Card>
      <Card title="Summary & SEO">
        <Field label="Excerpt" hint="Two or three sentences shown on the blog cards and under the title."><textarea rows={3} className={input} value={v.excerpt} onChange={(e) => set("excerpt", e.target.value)} /></Field>
        <Field label={`Meta description (${v.metaDescription.length}/158)`} hint="What Google shows under the link. Falls back to the excerpt."><textarea rows={2} className={input} value={v.metaDescription} onChange={(e) => set("metaDescription", e.target.value)} /></Field>
      </Card>
      <Card
        title="Content"
        action={<button type="button" onClick={() => setPreview(!preview)} className={btnGhost}>{preview ? <><Pencil className="h-4 w-4" />Edit</> : <><Eye className="h-4 w-4" />Preview</>}</button>}
      >
        {preview ? (
          <div className="rounded-2xl border border-border bg-background p-6"><BlogContent source={v.content || "_Nothing to preview yet._"} /></div>
        ) : (
          <>
            <textarea rows={22} className={`${input} font-mono text-[13px] leading-relaxed`} value={v.content} onChange={(e) => set("content", e.target.value)} placeholder={"Write your post here.\n\n## A section heading\n\nA paragraph with **bold text** and a [link](https://example.com).\n\n- A bullet point\n- Another one"} />
            <p className="text-xs leading-relaxed text-muted-foreground">
              Formatting: leave a blank line between paragraphs · <code>## Heading</code> · <code>### Subheading</code> · <code>- bullet</code> · <code>1. step</code> · <code>&gt; quote</code> · <code>**bold**</code> · <code>[text](url)</code> · <code>![caption](image-url)</code>
            </p>
          </>
        )}
      </Card>
    </FormFrame>
  );
}

// ---------------- Messages ----------------

function Warn({ children }: { children: ReactNode }) {
  return (
    <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm leading-relaxed [&_code]:rounded [&_code]:bg-black/10 [&_code]:px-1">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
      <p>{children}</p>
    </div>
  );
}

function MessageList({ list }: { list: Contact[] }) {
  const { busy, run } = useAction();
  const remove = (c: Contact) => window.confirm(`Delete the message from ${c.firstName}?`) && run(() => deleteContact({ data: { id: c.id } }), "Message deleted");
  return (
    <>
      <PageHead title="Messages" desc="Everything sent through the website's contact forms, newest first." />
      <div className="space-y-4">
        {list.length === 0 && <p className="rounded-3xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">No messages yet.</p>}
        {list.map((c) => (
          <article key={c.id} className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="font-display text-lg font-bold">{c.firstName} {c.lastName}</div>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <a href={`mailto:${c.email}`} className="text-primary hover:underline">{c.email}</a>
                  {c.phone && <span>{c.phone}</span>}
                  {c.country && <span>{c.country}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                {c.projectType && <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">{c.projectType}</span>}
                <span className={`rounded-full px-3 py-1 ${c.emailed ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>{c.emailed ? "Emailed" : "Not emailed"}</span>
                <span>{new Date(c.createdAt).toLocaleString()}</span>
              </div>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed">{c.message}</p>
            <div className="mt-4 flex items-center justify-between gap-4 border-t border-border pt-4 text-xs text-muted-foreground">
              <span>Sent from {c.page || "/"}</span>
              <div className="flex items-center gap-1">
                <a href={`mailto:${c.email}?subject=${encodeURIComponent("Re: your enquiry to Plural Dynamics")}`} aria-label="Reply" title="Reply" className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted hover:text-primary"><Mail className="h-4 w-4" /></a>
                <IconBtn label="Delete" disabled={busy} danger onClick={() => remove(c)}><Trash2 className="h-4 w-4" /></IconBtn>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

// ---------------- shared form bits ----------------

function FormFrame({ title, children, busy, onCancel, onSave, onSaveView }: { title: string; children: ReactNode; busy: boolean; onCancel: () => void; onSave: () => void; onSaveView: () => void }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave();
      }}
      className="mx-auto max-w-4xl"
    >
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="min-w-0 truncate text-3xl font-bold">{title}</h1>
        <button type="button" onClick={onCancel} className={btnGhost}><X className="h-4 w-4" />Cancel</button>
      </div>
      <div className="space-y-6">{children}</div>
      <div className="sticky bottom-0 mt-8 flex flex-wrap justify-end gap-3 border-t border-border bg-secondary/90 py-4 backdrop-blur">
        <button type="button" disabled={busy} onClick={onSaveView} className={btnGhost}><ExternalLink className="h-4 w-4" />Save & view live</button>
        <button type="submit" disabled={busy} className={btnPrimary}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}Save</button>
      </div>
    </form>
  );
}

function Card({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-card">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-semibold">{label}</span>
      {children}
      {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

function IconBtn({ label, children, onClick, disabled, danger }: { label: string; children: ReactNode; onClick: () => void; disabled?: boolean; danger?: boolean }) {
  return (
    <button type="button" aria-label={label} title={label} disabled={disabled} onClick={onClick} className={`grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40 ${danger ? "hover:text-destructive" : "hover:text-primary"}`}>
      {children}
    </button>
  );
}

function ListField({ label, items, onChange, multiline, addLabel }: { label: string; items: string[]; onChange: (x: string[]) => void; multiline?: boolean; addLabel: string }) {
  const upd = (i: number, val: string) => onChange(items.map((x, k) => (k === i ? val : x)));
  return (
    <div className="space-y-2">
      <span className="text-sm font-semibold">{label}</span>
      {items.map((it, i) => (
        <div key={i} className="flex items-start gap-2">
          {multiline ? <textarea rows={3} className={input} value={it} onChange={(e) => upd(i, e.target.value)} /> : <input className={input} value={it} onChange={(e) => upd(i, e.target.value)} />}
          <IconBtn label="Remove" danger onClick={() => onChange(items.filter((_, k) => k !== i))}><X className="h-4 w-4" /></IconBtn>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, ""])} className="inline-flex items-center gap-1.5 text-sm font-bold text-primary"><Plus className="h-4 w-4" />{addLabel}</button>
    </div>
  );
}

function ImageField({ value, onChange, hint }: { value: string; onChange: (v: string) => void; hint: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const pickFile = async (f: File | undefined) => {
    if (!f) return;
    setBusy(true);
    try {
      const data = await new Promise<string>((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(String(r.result).split(",")[1] ?? "");
        r.onerror = () => rej(new Error("Couldn't read the file"));
        r.readAsDataURL(f);
      });
      const { url } = await uploadImage({ data: { type: f.type, data } });
      onChange(url);
      toast.success("Image uploaded");
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  };
  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <div className="grid aspect-video w-full shrink-0 place-items-center overflow-hidden rounded-2xl border border-dashed border-border bg-muted sm:w-56">
        {value ? <img src={value} alt="Preview" className="h-full w-full object-contain" /> : <ImagePlus className="h-8 w-8 text-muted-foreground" />}
      </div>
      <div className="flex-1 space-y-3">
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={busy} onClick={() => ref.current?.click()} className={btnGhost}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}Upload image</button>
          {value && <button type="button" onClick={() => onChange("")} className={btnGhost}><Trash2 className="h-4 w-4" />Remove</button>}
        </div>
        <input ref={ref} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={(e) => pickFile(e.target.files?.[0])} />
        <input className={input} value={value} onChange={(e) => onChange(e.target.value)} placeholder="…or paste an image URL" />
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
    </div>
  );
}
