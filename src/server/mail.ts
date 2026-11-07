// Sends contact-form submissions by email over SMTP. Server-only.
import nodemailer, { type Transporter } from "nodemailer";
import type { Contact } from "@/lib/cms-types";
import { env } from "./env";

export const mailConfigured = () => env("SMTP_HOST") !== "" && env("SMTP_USER") !== "" && env("SMTP_PASS") !== "";
export const recipient = () => env("CONTACT_TO") || env("SMTP_USER");

let transport: Transporter | null = null;
function getTransport() {
  const port = Number(env("SMTP_PORT") || 465);
  // Shared mail hosts often present a certificate for their own server name rather than
  // smtp.<your-domain>. SMTP_TLS_SERVERNAME names the certificate to expect;
  // SMTP_TLS_REJECT_UNAUTHORIZED=false skips the check entirely (last resort).
  const tls: { rejectUnauthorized: boolean; servername?: string } = { rejectUnauthorized: env("SMTP_TLS_REJECT_UNAUTHORIZED") !== "false" };
  if (env("SMTP_TLS_SERVERNAME")) tls.servername = env("SMTP_TLS_SERVERNAME");
  transport ??= nodemailer.createTransport({
    host: env("SMTP_HOST"),
    port,
    secure: env("SMTP_SECURE") ? env("SMTP_SECURE") === "true" : port === 465,
    auth: { user: env("SMTP_USER"), pass: env("SMTP_PASS") },
    tls,
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
  });
  return transport;
}

/** Plain-language reason for an SMTP failure (never includes the password). */
export function describeMailError(e: unknown): string {
  const err = e as { code?: string; message?: string; responseCode?: number };
  const msg = err?.message ?? String(e);
  const where = `${env("SMTP_HOST")}:${env("SMTP_PORT") || 465}`;
  if (err?.code === "EAUTH" || err?.responseCode === 535) return `The mail server rejected the login. Check SMTP_USER and SMTP_PASS. (${msg})`;
  if (/certificate|altname|self[- ]signed|unable to verify/i.test(msg))
    return `The mail server's SSL certificate doesn't match ${env("SMTP_HOST")}. Set SMTP_TLS_SERVERNAME to the name on its certificate, or SMTP_TLS_REJECT_UNAUTHORIZED=false. (${msg})`;
  if (["ETIMEDOUT", "ECONNREFUSED", "ECONNECTION", "ESOCKET", "EDNS"].includes(err?.code ?? "") || /timeout|ECONNREFUSED|ENOTFOUND/i.test(msg))
    return `Couldn't connect to ${where}. The port may be blocked by a firewall, or the host/port is wrong (try SMTP_PORT=587). (${msg})`;
  if (err?.code === "EENVELOPE") return `The mail server refused the sender or recipient address. Check MAIL_FROM and CONTACT_TO. (${msg})`;
  return msg;
}

/** Sends a short test message to CONTACT_TO, so the dashboard can show whether email works. */
export async function sendTestEmail() {
  const t = getTransport();
  await t.verify();
  await t.sendMail({
    from: { name: "Plural Dynamics Website", address: env("MAIL_FROM") || env("SMTP_USER") },
    to: recipient(),
    subject: "Test email from the Plural Dynamics website",
    text: "This is a test from the website dashboard. If you can read this, contact-form emails will arrive here.",
  });
  return recipient();
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export async function sendContactEmail(c: Contact) {
  const name = `${c.firstName} ${c.lastName}`.trim();
  const rows: [string, string][] = [
    ["Name", name],
    ["Email", c.email],
    ["Phone", c.phone],
    ["Country", c.country],
    ["Project type", c.projectType],
    ["Sent from", c.page],
  ];
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px">
      <h2 style="color:#e11d2a;margin:0 0 16px">New enquiry from the website</h2>
      <table style="border-collapse:collapse;width:100%">
        ${rows.map(([k, v]) => `<tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;width:140px">${k}</td><td style="padding:8px;border-bottom:1px solid #eee"><b>${esc(v || "-")}</b></td></tr>`).join("")}
      </table>
      <h3 style="margin:24px 0 8px">Message</h3>
      <p style="white-space:pre-wrap;line-height:1.6;background:#f7f7f7;padding:16px;border-radius:8px">${esc(c.message)}</p>
      <p style="color:#999;font-size:12px">Reply to this email to answer ${esc(name)} directly.</p>
    </div>`;
  const text = `${rows.map(([k, v]) => `${k}: ${v || "-"}`).join("\n")}\n\nMessage:\n${c.message}`;
  await getTransport().sendMail({
    from: { name: "Plural Dynamics Website", address: env("MAIL_FROM") || env("SMTP_USER") },
    to: recipient(),
    replyTo: { name, address: c.email },
    subject: `New enquiry: ${name}${c.projectType ? ` (${c.projectType})` : ""}`,
    text,
    html,
  });
}
