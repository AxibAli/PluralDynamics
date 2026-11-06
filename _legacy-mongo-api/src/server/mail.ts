// Sends contact-form submissions by email over SMTP. Server-only.
import nodemailer, { type Transporter } from "nodemailer";
import type { Contact } from "@/lib/cms-types";
import { env } from "./env";

export const mailConfigured = () => env("SMTP_HOST") !== "" && env("SMTP_USER") !== "" && env("SMTP_PASS") !== "";
const recipient = () => env("CONTACT_TO") || "qaziwaqas144@gmail.com";

let transport: Transporter | null = null;
function getTransport() {
  const port = Number(env("SMTP_PORT") || 465);
  transport ??= nodemailer.createTransport({
    host: env("SMTP_HOST"),
    port,
    secure: env("SMTP_SECURE") ? env("SMTP_SECURE") === "true" : port === 465,
    auth: { user: env("SMTP_USER"), pass: env("SMTP_PASS") },
  });
  return transport;
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
