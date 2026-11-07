// Site translations. English text is its own key: t("Get In Touch") returns the translation
// for the current language, or the English text when a translation is missing. Translations
// live in ./locales/<lang>.json (English key -> translated text). The chosen language is kept
// in the "pd-lang" cookie so the server renders the right language on the first request.
import { createContext, useContext, useMemo, type ReactNode } from "react";
import { createIsomorphicFn } from "@tanstack/react-start";

export const LANGS = [
  { code: "en", native: "English", dir: "ltr" },
  { code: "de", native: "Deutsch", dir: "ltr" },
  { code: "it", native: "Italiano", dir: "ltr" },
  { code: "fr", native: "Français", dir: "ltr" },
  { code: "es", native: "Español", dir: "ltr" },
  { code: "ar", native: "العربية", dir: "rtl" },
] as const;

export type Lang = (typeof LANGS)[number]["code"];
export type Dict = Record<string, string>;
export const LANG_COOKIE = "pd-lang";

export const isLang = (v: unknown): v is Lang => LANGS.some((l) => l.code === v);
export const dirOf = (lang: Lang) => LANGS.find((l) => l.code === lang)?.dir ?? "ltr";

/** The visitor's chosen language: the cookie on the server, document.cookie in the browser. */
export const readLang = createIsomorphicFn()
  .server(async (): Promise<Lang> => {
    const { langCookie } = await import("@/server/lang");
    const v = langCookie(LANG_COOKIE);
    return isLang(v) ? v : "en";
  })
  .client(async (): Promise<Lang> => {
    const v = document.cookie.match(new RegExp(`(?:^|; )${LANG_COOKIE}=([^;]+)`))?.[1];
    return isLang(v) ? v : "en";
  });

// Each language is its own chunk, so visitors only download the one they use.
const loaders: Record<Exclude<Lang, "en">, () => Promise<{ default: Dict }>> = {
  de: () => import("./locales/de.json"),
  it: () => import("./locales/it.json"),
  fr: () => import("./locales/fr.json"),
  es: () => import("./locales/es.json"),
  ar: () => import("./locales/ar.json"),
};

export async function loadDict(lang: Lang): Promise<Dict> {
  return lang === "en" ? {} : (await loaders[lang]()).default;
}

/** Saves the choice for a year; the caller then reloads route data (router.invalidate()). */
export function saveLang(lang: Lang) {
  document.cookie = `${LANG_COOKIE}=${lang}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

type Vars = Record<string, string | number>;
export const translate = (dict: Dict, key: string, vars?: Vars) => {
  const s = dict[key] || key;
  return vars ? s.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m)) : s;
};

type Ctx = { lang: Lang; dir: "ltr" | "rtl"; t: (key: string, vars?: Vars) => string };
const I18nContext = createContext<Ctx>({ lang: "en", dir: "ltr", t: (k, v) => translate({}, k, v) });

export function I18nProvider({ lang, dict, children }: { lang: Lang; dict: Dict; children: ReactNode }) {
  const value = useMemo<Ctx>(() => ({ lang, dir: dirOf(lang), t: (k, v) => translate(dict, k, v) }), [lang, dict]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
