import nodemailer from "nodemailer";

// Gmail SMTP via Nodemailer: sends to ANY recipient immediately, no domain
// verification or DNS wait required — unlike Resend's resend.dev sandbox,
// which only delivers to the account owner's own email until a domain is
// verified. Requires a Gmail account with 2-Step Verification + an App
// Password (see README for setup).

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

type Lead = {
  id: string;
  name: string;
  requirement: string;
};

export async function sendLeadEmail(lead: Lead, toEmail: string) {
  const base = process.env.NEXT_PUBLIC_BASE_URL!;
  const learnMoreUrl = process.env.LEARN_MORE_URL || "https://admexo.com";
  const fromName = process.env.FROM_NAME || "Team";

  // Tracking pixel: a 1x1 image request to our own API logs the "open"
  const pixelUrl = `${base}/api/track/open/${lead.id}`;

  // Tracked link: clicking goes through our redirect endpoint first,
  // which logs the click, then forwards to the real destination
  const trackedLink = `${base}/api/track/click/${lead.id}?url=${encodeURIComponent(
    learnMoreUrl
  )}`;

  const html = `
    <div style="font-family: Arial, sans-serif; font-size: 15px; color: #222; line-height: 1.6;">
      <p>Hi ${escapeHtml(lead.name)},</p>
      <p>Thank you for reaching out.</p>
      <p>We received your requirement: "${escapeHtml(lead.requirement)}"</p>
      <p><a href="${trackedLink}" target="_blank">Learn more</a></p>
      <p>Regards,<br/>${escapeHtml(fromName)}</p>
      <img src="${pixelUrl}" width="1" height="1" style="display:none" alt="" />
    </div>
  `;

  const result = await transporter.sendMail({
    from: `"${fromName}" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: "Thanks for reaching out!",
    html,
  });

  return result;
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
