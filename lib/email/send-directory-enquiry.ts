import { Resend } from "resend";

type Inspector = {
  id: string;
  full_name: string;
  company_name: string;
  postcode: string;
  fdin_pin?: string | null;
};

type Enquiry = {
  name: string;
  email: string;
  phone: string;
  postcode: string;
  message: string;
};

/**
 * Notifies the admin of a new directory inspection enquiry.
 * No-ops when RESEND_API_KEY or RESEND_FROM_EMAIL is unset.
 */
export async function sendDirectoryEnquiryEmail(
  inspector: Inspector,
  enquiry: Enquiry,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  const adminTo = process.env.ADMIN_EMAIL?.trim();
  if (!apiKey || !from || !adminTo) {
    return;
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "").trim() ?? "";
  const adminUrl = site ? `${site}/admin/dashboard/${inspector.id}` : null;
  const directoryUrl = site
    ? `${site}/directory?profile=${encodeURIComponent(inspector.id)}`
    : null;

  const inspectorLine = [
    inspector.full_name,
    inspector.company_name,
    inspector.postcode,
    inspector.fdin_pin ? `FDIN ${inspector.fdin_pin}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const subject = `Inspection enquiry — ${enquiry.name} → ${inspector.full_name}`;

  const text = [
    "New inspection enquiry from the public directory.",
    "",
    "Inspector",
    inspectorLine,
    `Application ID: ${inspector.id}`,
    "",
    "Enquirer",
    `Name: ${enquiry.name}`,
    `Email: ${enquiry.email}`,
    `Phone: ${enquiry.phone}`,
    `Postcode: ${enquiry.postcode}`,
    "",
    "Message",
    enquiry.message,
    "",
    ...(adminUrl ? [`View application: ${adminUrl}`] : []),
    ...(directoryUrl ? [`Directory profile: ${directoryUrl}`] : []),
    "",
    "— Fire Door Network",
  ].join("\n");

  const html = `
<!DOCTYPE html>
<html>
<body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #111;">
  <p><strong>New inspection enquiry</strong> from the public directory.</p>
  <h3 style="margin: 1.5rem 0 0.5rem; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #666;">Inspector</h3>
  <p>${escapeHtml(inspectorLine)}</p>
  <p style="font-size: 14px; color: #666;">Application ID: ${escapeHtml(inspector.id)}</p>
  ${
    adminUrl
      ? `<p><a href="${escapeHtml(adminUrl)}">View application in admin</a></p>`
      : ""
  }
  <h3 style="margin: 1.5rem 0 0.5rem; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #666;">Enquirer</h3>
  <ul style="padding-left: 1.25rem;">
    <li><strong>Name:</strong> ${escapeHtml(enquiry.name)}</li>
    <li><strong>Email:</strong> <a href="mailto:${escapeHtml(enquiry.email)}">${escapeHtml(enquiry.email)}</a></li>
    <li><strong>Phone:</strong> ${escapeHtml(enquiry.phone)}</li>
    <li><strong>Postcode:</strong> ${escapeHtml(enquiry.postcode)}</li>
  </ul>
  <h3 style="margin: 1.5rem 0 0.5rem; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #666;">Message</h3>
  <p style="white-space: pre-wrap;">${escapeHtml(enquiry.message)}</p>
  <p style="margin-top: 2rem; color: #666; font-size: 14px;">— Fire Door Network</p>
</body>
</html>`;

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: [adminTo],
    replyTo: enquiry.email,
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
