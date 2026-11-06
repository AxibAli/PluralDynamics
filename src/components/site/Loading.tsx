import { Loader2 } from "lucide-react";

/** Shown while content loads from the API (the free Render server can take ~30s to wake up). */
export function Loading() {
  return (
    <div className="grid min-h-[40vh] place-items-center py-24 text-muted-foreground" role="status">
      <Loader2 className="h-7 w-7 animate-spin text-primary" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export function LoadError() {
  return (
    <div className="mx-auto max-w-xl px-5 py-24 text-center text-muted-foreground">
      <p>This content couldn't load right now. Please refresh the page in a moment.</p>
    </div>
  );
}
