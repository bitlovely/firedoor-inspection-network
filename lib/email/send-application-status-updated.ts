import { Resend } from "resend";

type Params = {
  to: string;
  applicantName: string;
  companyName: string;
  status: string;
};

function dashboardUrl() {
  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "").trim() ?? "";
  return site ? `${site}/dashboard` : null;
}

function statusCopy(status: string) {
  switch (status) {
    case "approved":
      return {
        subject: "Application approved — FireDoor Inspection Network",
        heading: "Your application has been approved",
        lines: [
          "Good news — your application has been approved.",
          "If we need anything else, we’ll reach out.",
        ],
      };
    case "verified":
      return {
        subject: "Application verified — FireDoor Inspection Network",
        heading: "You’re now verified",
        lines: [
          "Great news — your documents have been verified and your affiliate status is now verified.",
          "You should now be visible in the public directory (or will be shortly).",
        ],
      };
    case "rejected":
      return {
        subject: "Application update — FireDoor Inspection Network",
        heading: "Your application needs attention",
        lines: [
          "We weren’t able to approve your application at this time.",
          "If you believe this is a mistake, reply to this email and we’ll help.",
        ],
      };
    default:
      return {
        subject: "Application update — FireDoor Inspection Network",
        heading: "Your application status has been updated",
        lines: [`Your application status is now: ${status}.`],
      };
  }
}

/**
 * Sends an “application status updated” email via Resend.
 * No-ops when RESEND_API_KEY or RESEND_FROM_EMAIL is unset.
 */
export async function sendApplicationStatusUpdatedEmail(params: Params): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  if (!apiKey || !from) {
    return;
  }

  const url = dashboardUrl();
  const status = statusCopy(params.status);
  const statusLine = url
    ? `You can view your application status here: ${url}`
    : "You can view your application status by signing in to your dashboard on our website.";

  const text = [
    `Hi ${params.applicantName},`,
    "",
    `${status.heading}.`,
    "",
    ...status.lines,
    "",
    `Company: ${params.companyName}`,
    "",
    statusLine,
    "",
    "— FireDoor Inspection Network",
  ].join("\n");

  const dashboardBlock = url
    ? `<p><a href="${escapeHtml(url)}">View your application status</a></p>`
    : "<p>You can view your application status by signing in to your dashboard on our website.</p>";

  const html = `
<!DOCTYPE html>
<html>
<body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #111;">
  <p>Hi ${escapeHtml(params.applicantName)},</p>
  <h2 style="margin: 0.25rem 0 0.75rem; font-size: 18px;">${escapeHtml(status.heading)}</h2>
  ${status.lines.map((l) => `<p>${escapeHtml(l)}</p>`).join("\n")}
  <p><strong>Company:</strong> ${escapeHtml(params.companyName)}</p>
  ${dashboardBlock}
  <p style="margin-top: 2rem; color: #666; font-size: 14px;">— FireDoor Inspection Network</p>
</body>
</html>`;

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: [params.to],
    subject: status.subject,
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

