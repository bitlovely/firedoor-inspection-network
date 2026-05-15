import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminCookieName, verifyAdminSession } from "@/lib/admin/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { BUCKET } from "@/lib/affiliate-application";
import { ensureApplicationFdinPin } from "@/lib/fdin-pin";
import { sendApplicationStatusUpdatedEmail } from "@/lib/email/send-application-status-updated";
import { isAdminBearer } from "@/lib/admin/bearer-auth";

export const runtime = "nodejs";

async function isAdmin(request: Request): Promise<boolean> {
  const jar = await cookies();
  const cookieToken = jar.get(adminCookieName())?.value ?? "";
  const cookieSession = cookieToken ? verifyAdminSession(cookieToken) : null;
  if (cookieSession?.role === "admin") return true;
  // bearer-based: custom admin JWT (mobile)
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const bearerSession = verifyAdminSession(authHeader.slice(7));
    if (bearerSession?.role === "admin") return true;
  }
  // bearer-based: Supabase JWT (mobile — legacy)
  return isAdminBearer(authHeader);
}

function buildDocuments(row: Record<string, unknown>) {
  const toFiles = (paths: unknown): { name: string; path: string }[] =>
    Array.isArray(paths)
      ? paths.map((p: string) => ({ name: p.split("/").pop() ?? p, path: p }))
      : [];
  const toFile = (path: unknown) =>
    typeof path === "string" && path
      ? { name: path.split("/").pop() ?? path, path }
      : null;
  return {
    certifications: toFiles(row.certification_paths),
    insurance: toFiles(row.insurance_path ? [row.insurance_path] : []),
    dbs: toFiles(row.dbs_path ? [row.dbs_path] : []),
    sample_reports: toFiles(row.sample_report_paths),
    profile_photo: toFile(row.profile_photo_path),
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("affiliate_applications")
    .select(
      "id,fdin_pin,created_at,status,full_name,company_name,email,phone,postcode,years_experience,areas_covered,certification_paths,insurance_path,dbs_path,internal_notes,reviewed_at,reviewed_by,updated_at,verified_insurance,verified_certification,identity_checked,bio,services,review_count,review_rating",
    )
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(
    { application: { ...data, documents: buildDocuments(data as Record<string, unknown>) } },
    { status: 200 },
  );

  let application = data as Record<string, unknown> & { id: string };
  if (!application.fdin_pin) {
    try {
      const pin = await ensureApplicationFdinPin(supabase, application.id);
      if (pin) application = { ...application, fdin_pin: pin };
    } catch {
      // ignore if column missing
    }
  }

  return NextResponse.json({ application }, { status: 200 });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as
    | {
        status?: string;
        internal_notes?: string;
        verified_insurance?: boolean;
        verified_certification?: boolean;
        identity_checked?: boolean;
      }
    | null;

  const status = body?.status;
  const internal_notes = body?.internal_notes;
  const verified_insurance = body?.verified_insurance;
  const verified_certification = body?.verified_certification;
  const identity_checked = body?.identity_checked;

  if (
    typeof status !== "string" &&
    typeof internal_notes !== "string" &&
    typeof verified_insurance !== "boolean" &&
    typeof verified_certification !== "boolean" &&
    typeof identity_checked !== "boolean"
  ) {
    return NextResponse.json({ error: "No changes" }, { status: 400 });
  }

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (typeof status === "string") patch.status = status;
  if (typeof internal_notes === "string") patch.internal_notes = internal_notes;
  const isDocVerificationPatch =
    typeof verified_insurance === "boolean" ||
    typeof verified_certification === "boolean" ||
    typeof identity_checked === "boolean";

  if (status === "approved" || status === "rejected" || status === "verified") {
    patch.reviewed_at = new Date().toISOString();
  }

  const supabase = createAdminClient();
  const { data: before, error: beforeErr } = await supabase
    .from("affiliate_applications")
    .select("status,email,full_name,company_name")
    .eq("id", id)
    .single();
  if (beforeErr) {
    return NextResponse.json({ error: beforeErr.message }, { status: 500 });
  }

  // Approving when every required doc check is already true → verified (same rule as doc toggles).
  if (status === "approved") {
    const { data: row, error: rowErr } = await supabase
      .from("affiliate_applications")
      .select("dbs_path,verified_insurance,verified_certification,identity_checked")
      .eq("id", id)
      .single();
    if (!rowErr && row) {
      const identityRequired = Boolean(row.dbs_path);
      const allVerified = identityRequired
        ? Boolean(row.verified_insurance && row.verified_certification && row.identity_checked)
        : Boolean(row.verified_insurance && row.verified_certification);
      if (allVerified) {
        patch.status = "verified";
      }
    }
  }

  if (isDocVerificationPatch) {
    const { data: current, error: currentErr } = await supabase
      .from("affiliate_applications")
      .select("status,dbs_path,verified_insurance,verified_certification,identity_checked")
      .eq("id", id)
      .single();
    if (currentErr) {
      return NextResponse.json({ error: currentErr.message }, { status: 500 });
    }

    // Only allow verifying documents after approval.
    if (!(current.status === "approved" || current.status === "verified")) {
      return NextResponse.json(
        { error: "You can only verify documents after approving the application." },
        { status: 403 },
      );
    }

    const nextVerifiedInsurance =
      typeof verified_insurance === "boolean"
        ? verified_insurance
        : Boolean(current.verified_insurance);
    const nextVerifiedCertification =
      typeof verified_certification === "boolean"
        ? verified_certification
        : Boolean(current.verified_certification);
    const nextIdentityChecked =
      typeof identity_checked === "boolean" ? identity_checked : Boolean(current.identity_checked);

    if (typeof verified_insurance === "boolean") patch.verified_insurance = verified_insurance;
    if (typeof verified_certification === "boolean")
      patch.verified_certification = verified_certification;
    if (typeof identity_checked === "boolean") patch.identity_checked = identity_checked;

    const identityRequired = Boolean(current.dbs_path);
    const allVerified = identityRequired
      ? nextVerifiedInsurance && nextVerifiedCertification && nextIdentityChecked
      : nextVerifiedInsurance && nextVerifiedCertification;

    // Auto-promote to verified when all checks are complete.
    if (allVerified) {
      patch.status = "verified";
      patch.reviewed_at = new Date().toISOString();
    } else if (current.status === "verified") {
      // If any verification is removed, fall back to approved.
      patch.status = "approved";
      patch.reviewed_at = new Date().toISOString();
    }
  }

  const { data, error } = await supabase
    .from("affiliate_applications")
    .update(patch)
    .eq("id", id)
    .select(
      "id,status,internal_notes,reviewed_at,updated_at,full_name,company_name,email,phone,postcode,years_experience,areas_covered,certification_paths,insurance_path,dbs_path,created_at,verified_insurance,verified_certification,identity_checked,bio,services,review_count,review_rating",
    )
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Status change email (best-effort).
  try {
    const prevStatus = typeof before?.status === "string" ? before.status : "";
    const nextStatus = typeof data?.status === "string" ? data.status : "";
    if (prevStatus && nextStatus && prevStatus !== nextStatus) {
      const to = typeof before?.email === "string" ? before.email : "";
      const applicantName = typeof before?.full_name === "string" ? before.full_name : "";
      const companyName = typeof before?.company_name === "string" ? before.company_name : "";
      if (to && applicantName) {
        await sendApplicationStatusUpdatedEmail({
          to,
          applicantName,
          companyName,
          status: nextStatus,
        });
      }
    }
  } catch (emailErr) {
    console.error("[admin/applications] status email failed:", emailErr);
  }

  return NextResponse.json(
    { application: { ...data, documents: buildDocuments(data as Record<string, unknown>) } },
    { status: 200 },
  );
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // Create signed download URLs for stored docs.
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as
    | { path?: string }
    | null;
  const path = body?.path;
  if (typeof path !== "string" || path.length === 0) {
    return NextResponse.json({ error: "Missing path" }, { status: 400 });
  }
  if (!path.startsWith(`${id}/`)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ url: data.signedUrl }, { status: 200 });
}

