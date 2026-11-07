import { Loader2 } from "lucide-react";
import { useI18n } from "@/i18n";

/** Shown while dashboard data loads. */
export function Loading() {
  const { t } = useI18n();
  return (
    <div className="grid min-h-[40vh] place-items-center py-24 text-muted-foreground" role="status">
      <Loader2 className="h-7 w-7 animate-spin text-primary" />
      <span className="sr-only">{t("Loading…")}</span>
    </div>
  );
}

export function LoadError() {
  const { t } = useI18n();
  return (
    <div className="mx-auto max-w-xl px-5 py-24 text-center text-muted-foreground">
      <p>{t("This content couldn't load right now. Please refresh the page in a moment.")}</p>
    </div>
  );
}
