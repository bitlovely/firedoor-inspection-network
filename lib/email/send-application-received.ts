import { Resend } from "resend";

type Params = {
  to: string;
  applicantName: string;
  companyName: string;
};

/**
 * Sends a basic “application received” confirmation via Resend.
 * No-ops when RESEND_API_KEY or RESEND_FROM_EMAIL is unset (local dev without mail).
 */
export async function sendApplicationReceivedEmail(params: Params): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  if (!apiKey || !from) {
    return;
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "").trim() ?? "";
  const dashboardUrl = site ? `${site}/dashboard` : null;

  const subject = "Application received — Fire Door Inspection Network";

  const statusLine = dashboardUrl
    ? `You can check your application status anytime: ${dashboardUrl}`
    : "You can check your application status anytime by signing in to your dashboard on our website.";

  const text = [
    `Hi ${params.applicantName},`,
    "",
    "Thanks for applying to Fire Door Inspection Network as an inspector.",
    "",
    `We’ve received your application for ${params.companyName}. Our team will review your details and uploaded documents. We’ll email you when there’s an update.`,
    "",
    statusLine,
    "",
    "— Fire Door Inspection Network",
  ].join("\n");

  const dashboardBlock = dashboardUrl
    ? `<p><a href="${escapeHtml(dashboardUrl)}">View your application status</a></p>`
    : "<p>You can check your application status anytime by signing in to your dashboard on our website.</p>";

  const html = `
<!DOCTYPE html>
<html>
<body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #111;">
  <p>Hi ${escapeHtml(params.applicantName)},</p>
  <p>Thanks for applying to <strong>Fire Door Inspection Network</strong> as an inspector.</p>
  <p>We’ve received your application for <strong>${escapeHtml(params.companyName)}</strong>. Our team will review your details and uploaded documents. We’ll email you when there’s an update.</p>
  ${dashboardBlock}
  <p style="margin-top: 2rem; color: #666; font-size: 14px;">— Fire Door Inspection Network</p>
</body>
</html>`;

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: [params.to],
    subject,
    text,
    html,
  });

  if (error) {
    throw new Error(error.message);
  }
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
