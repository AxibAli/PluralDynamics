// Formats and sends one lead as an email through Strapi's email plugin (nodemailer / SMTP).
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

async function sendLeadEmail(strapi, lead) {
  const to = process.env.CONTACT_TO;
  if (!to) throw new Error('CONTACT_TO is not set');
  const name = `${lead.firstName ?? ''} ${lead.lastName ?? ''}`.trim();
  const rows = [
    ['Name', name],
    ['Email', lead.email],
    ['Phone', lead.phone],
    ['Country', lead.country],
    ['Project type', lead.projectType],
    ['Sent from', lead.page],
  ];
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px">
      <h2 style="color:#e11d2a;margin:0 0 16px">New enquiry from the website</h2>
      <table style="border-collapse:collapse;width:100%">
        ${rows.map(([k, v]) => `<tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;width:140px">${k}</td><td style="padding:8px;border-bottom:1px solid #eee"><b>${esc(v || '-')}</b></td></tr>`).join('')}
      </table>
      <h3 style="margin:24px 0 8px">Message</h3>
      <p style="white-space:pre-wrap;line-height:1.6;background:#f7f7f7;padding:16px;border-radius:8px">${esc(lead.message)}</p>
      <p style="color:#999;font-size:12px">Reply to this email to answer ${esc(name)} directly. All leads are in Strapi under Content Manager &gt; Lead.</p>
    </div>`;
  const text = `${rows.map(([k, v]) => `${k}: ${v || '-'}`).join('\n')}\n\nMessage:\n${lead.message}`;
  await strapi.plugin('email').service('email').send({
    to,
    replyTo: lead.email,
    subject: `New enquiry: ${name}${lead.projectType ? ` (${lead.projectType})` : ''}`,
    text,
    html,
  });
}

module.exports = { sendLeadEmail };
