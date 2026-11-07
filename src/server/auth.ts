// Admin session: one password from ADMIN_PASSWORD, kept in a signed HttpOnly cookie
// ("<expiry>.<hmac>"). The site and the dashboard share one domain. Server-only.
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { deleteCookie, getCookie, getRequest, getRequestHeader, setCookie } from "@tanstack/react-start/server";
import "./env";

const COOKIE = "pd_admin";
const TTL_MS = 1000 * 60 * 60 * 12;

// Tolerates how .env files get edited on Windows: stray spaces, a trailing \r, or quotes.
const unwrap = (v: string) => v.trim().replace(/^(["'])(.*)\1$/, "$2");
const password = () => unwrap(process.env["ADMIN_PASSWORD"] ?? "");
const secret = () => process.env["ADMIN_SESSION_SECRET"] || createHash("sha256").update(`pd-admin:${password()}`).digest("hex");
const sign = (v: string) => createHmac("sha256", secret()).update(v).digest("hex");
const sha = (v: string) => createHash("sha256").update(v).digest();

export const adminConfigured = () => password().length >= 8;
const flag = (k: string) => (process.env[k] ?? "").trim().toLowerCase();
/** The /admin dashboard is on unless ADMIN_DASHBOARD=off. */
export const dashboardEnabled = () => flag("ADMIN_DASHBOARD") !== "off";

export function isAdmin() {
  if (!dashboardEnabled() || !adminConfigured()) return false;
  const raw = getCookie(COOKIE);
  if (!raw) return false;
  const [exp, mac] = raw.split(".");
  if (!exp || !mac || !/^\d+$/.test(exp) || Number(exp) < Date.now()) return false;
  const good = Buffer.from(sign(exp), "hex");
  const got = Buffer.from(mac, "hex");
  return good.length === got.length && timingSafeEqual(good, got);
}

export function requireAdmin() {
  if (!isAdmin()) throw new Error("Not signed in");
}

export const clientIp = () => getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() || "local";

/** True when the visitor reached the site over HTTPS (directly, or via a proxy such as IIS or Nginx). */
function viaHttps() {
  const forwarded = getRequestHeader("x-forwarded-proto")?.split(",")[0]?.trim().toLowerCase();
  if (forwarded) return forwarded === "https";
  try {
    return new URL(getRequest().url).protocol === "https:";
  } catch {
    return false;
  }
}

// Basic brute-force brake: 5 failures per client per 10 minutes.
const failures = new Map<string, { n: number; until: number }>();

export function login(attempt: string) {
  if (!dashboardEnabled()) throw new Error("Not found");
  if (!adminConfigured()) throw new Error("Admin login is disabled: set ADMIN_PASSWORD (8+ characters) in .env");
  const ip = clientIp();
  const f = failures.get(ip);
  if (f && f.n >= 5 && f.until > Date.now()) throw new Error("Too many attempts. Try again in a few minutes.");
  if (!timingSafeEqual(sha(attempt.trim()), sha(password()))) {
    failures.set(ip, { n: (f && f.until > Date.now() ? f.n : 0) + 1, until: Date.now() + 10 * 60 * 1000 });
    throw new Error("Wrong password");
  }
  failures.delete(ip);
  const exp = String(Date.now() + TTL_MS);
  setCookie(COOKIE, `${exp}.${sign(exp)}`, {
    httpOnly: true,
    sameSite: "lax",
    // Secure (HTTPS-only) whenever the site is served over HTTPS; plain-HTTP staging still works.
    secure: viaHttps(),
    path: "/",
    maxAge: TTL_MS / 1000,
  });
}

export function logout() {
  deleteCookie(COOKIE, { path: "/" });
}
