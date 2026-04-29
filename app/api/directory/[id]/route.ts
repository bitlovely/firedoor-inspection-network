import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const supabase = createAdminClient();
  const baseSelect =
    "id,status,full_name,company_name,postcode,email,phone,created_at,profile_photo_path,bio,services,areas_covered,years_experience,verified_insurance,verified_certification,identity_checked,review_count,review_rating,sample_report_paths";
  const planSelect = `${baseSelect},plan_type,subscription_status`;

  let data: any | null = null;
  let error: { message: string } | null = null;

  {
    const r = await supabase
      .from("affiliate_applications")
      .select(planSelect)
      .eq("id", id)
      .in("status", ["approved", "verified"])
      .maybeSingle();
    data = r.data ?? null;
    error = r.error ? { message: r.error.message } : null;
  }

  if (error && /plan_type|subscription_status/i.test(error.message)) {
    const r = await supabase
      .from("affiliate_applications")
      .select(baseSelect)
      .eq("id", id)
      .in("status", ["approved", "verified"])
      .maybeSingle();
    data = r.data
      ? { ...(r.data as Record<string, unknown>), plan_type: "basic", subscription_status: "inactive" }
      : null;
    error = r.error ? { message: r.error.message } : null;
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const contact_enabled = data.plan_type === "advanced" && data.subscription_status === "active";
  const affiliate = {
    ...data,
    contact_enabled,
    email: contact_enabled ? data.email : null,
    phone: contact_enabled ? data.phone : null,
  };

  return NextResponse.json({ affiliate }, { status: 200 });
}

