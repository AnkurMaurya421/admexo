import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type Lead = {
  id: string;
  name: string;
  requirement: string;
};

export async function sendLeadEmail(lead: Lead, toEmail: string) {
  const base = process.env.NEXT_PUBLIC_BASE_URL!;
  const learnMoreUrl = process.env.LEARN_MORE_URL || "https://admexo.com";

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
      <p>Regards,<br/>Team</p>
      <img src="${pixelUrl}" width="1" height="1" style="display:none" alt="" />
    </div>
  `;

  const result = await resend.emails.send({
    from: process.env.FROM_EMAIL!,
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
