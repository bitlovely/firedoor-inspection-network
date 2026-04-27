import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminCookieName, verifyAdminSession } from "@/lib/admin/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { BUCKET } from "@/lib/affiliate-application";

export const runtime = "nodejs";

async function isAdmin() {
  const jar = await cookies();
  const token = jar.get(adminCookieName())?.value ?? "";
  const session = token ? verifyAdminSession(token) : null;
  return Boolean(session && session.role === "admin");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("affiliate_applications")
    .select(
      "id,created_at,status,full_name,company_name,email,phone,postcode,years_experience,areas_covered,certification_paths,insurance_path,dbs_path,internal_notes,reviewed_at,reviewed_by,updated_at,verified_insurance,verified_certification,identity_checked",
    )
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ application: data }, { status: 200 });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) {
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
      "id,status,internal_notes,reviewed_at,updated_at,full_name,company_name,email,phone,postcode,years_experience,areas_covered,certification_paths,insurance_path,dbs_path,created_at,verified_insurance,verified_certification,identity_checked",
    )
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ application: data }, { status: 200 });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // Create signed download URLs for stored docs.
  if (!(await isAdmin())) {
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

