// Admin session: one password from ADMIN_PASSWORD; login returns a signed bearer token
// ("<expiry>.<hmac>") that the dashboard sends in the Authorization header. A token, not a
// cookie, because the site and the API live on different domains. Server-only.
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import "./env";

const TTL_MS = 1000 * 60 * 60 * 12;

const password = () => process.env["ADMIN_PASSWORD"] ?? "";
const secret = () => process.env["ADMIN_SESSION_SECRET"] || createHash("sha256").update(`pd-admin:${password()}`).digest("hex");
const sign = (v: string) => createHmac("sha256", secret()).update(v).digest("hex");
const sha = (v: string) => createHash("sha256").update(v).digest();

export const adminConfigured = () => password().length >= 8;
const flag = (k: string) => (process.env[k] ?? "").trim().toLowerCase();
/** The /admin dashboard is on unless ADMIN_DASHBOARD=off. */
export const dashboardEnabled = () => flag("ADMIN_DASHBOARD") !== "off";
/** The dashboard's Messages inbox is hidden unless ADMIN_MESSAGES=on. */
export const messagesEnabled = () => flag("ADMIN_MESSAGES") === "on";

/** True when the Authorization header carries an unexpired token signed with the current secret. */
export function isAdmin(authorization: string | undefined) {
  if (!dashboardEnabled() || !adminConfigured()) return false;
  const raw = /^Bearer\s+(.+)$/i.exec(authorization ?? "")?.[1]?.trim();
  if (!raw) return false;
  const [exp, mac] = raw.split(".");
  if (!exp || !mac || !/^\d+$/.test(exp) || Number(exp) < Date.now()) return false;
  const good = Buffer.from(sign(exp), "hex");
  const got = Buffer.from(mac, "hex");
  return good.length === got.length && timingSafeEqual(good, got);
}

// Basic brute-force brake: 5 failures per client per 10 minutes.
const failures = new Map<string, { n: number; until: number }>();

/** Checks the password and returns a new session token. */
export function login(attempt: string, ip: string): string {
  if (!dashboardEnabled()) throw new Error("Not found");
  if (!adminConfigured()) throw new Error("Admin login is disabled: set ADMIN_PASSWORD (8+ characters) on the server");
  const f = failures.get(ip);
  if (f && f.n >= 5 && f.until > Date.now()) throw new Error("Too many attempts. Try again in a few minutes.");
  if (!timingSafeEqual(sha(attempt), sha(password()))) {
    failures.set(ip, { n: (f && f.until > Date.now() ? f.n : 0) + 1, until: Date.now() + 10 * 60 * 1000 });
    throw new Error("Wrong password");
  }
  failures.delete(ip);
  const exp = String(Date.now() + TTL_MS);
  return `${exp}.${sign(exp)}`;
}
