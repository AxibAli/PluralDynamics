// One shared MongoDB connection for the server. Server-only.
import dns from "node:dns";
import { MongoClient, type Db } from "mongodb";
import { env } from "./env";

export const dbConfigured = () => env("MONGODB_URI") !== "";

/** Accepts a password typed raw into the URI (e.g. containing "@") by percent-encoding the credentials. */
export function normalizeUri(raw: string) {
  const m = /^(mongodb(?:\+srv)?:\/\/)([^:@/]+):(.*)@([^@/]+(?:\/.*)?)$/.exec(raw);
  if (!m) return raw;
  const enc = (s: string) => encodeURIComponent(safeDecode(s));
  return `${m[1]}${enc(m[2]!)}:${enc(m[3]!)}@${m[4]}`;
}
const safeDecode = (s: string) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};

// mongodb+srv needs a DNS SRV lookup. Some Windows setups hand Node only a loopback DNS
// proxy that refuses SRV queries (querySrv ECONNREFUSED); add public resolvers after it.
// Only affects dns.resolve* calls, not normal hostname lookups.
function ensureSrvDns(uri: string) {
  if (!uri.startsWith("mongodb+srv://")) return;
  const servers = dns.getServers();
  if (servers.length && servers.every((s) => s.startsWith("127.") || s === "::1")) dns.setServers([...servers, "1.1.1.1", "8.8.8.8"]);
}

// Kept on globalThis so Vite's hot reload in dev doesn't open a new pool per edit.
const g = globalThis as unknown as { __pdMongo?: Promise<MongoClient> | undefined };

export async function getDb(): Promise<Db> {
  if (!dbConfigured()) throw new Error("Database not connected: set MONGODB_URI in .env");
  const uri = normalizeUri(env("MONGODB_URI"));
  ensureSrvDns(uri);
  g.__pdMongo ??= Promise.resolve()
    .then(() => new MongoClient(uri, { serverSelectionTimeoutMS: 8000 }).connect())
    .catch((e: unknown) => {
      g.__pdMongo = undefined; // let the next request retry instead of caching the failure
      throw e;
    });
  const client = await g.__pdMongo;
  return client.db(env("MONGODB_DB") || "pluraldynamics");
}
