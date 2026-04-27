import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function outwardCode(postcode: string) {
  // UK-ish: take everything before the first space, uppercased.
  // e.g. "SW1A 1AA" -> "SW1A"
  const v = postcode.trim().toUpperCase().replace(/\s+/g, " ");
  const [outward] = v.split(" ");
  return outward ?? "";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  const company = (searchParams.get("company") ?? "").trim();
  const name = (searchParams.get("name") ?? "").trim();
  const postcode = (searchParams.get("postcode") ?? "").trim();
  const radius = Number(searchParams.get("radius") ?? "");

  const supabase = createAdminClient();
  const baseSelect =
    "id,status,full_name,company_name,postcode,email,phone,created_at,profile_photo_path,bio,services,areas_covered,years_experience,verified_insurance,verified_certification,identity_checked,review_count,review_rating,sample_report_paths";
  const planSelect = `${baseSelect},plan_type,subscription_status`;

  let query = supabase
    .from("affiliate_applications")
    .select(planSelect)
    .in("status", ["approved", "verified"])
    .order("created_at", { ascending: false })
    .limit(200);

  const combined = q.length > 0 ? q : "";
  const nameQ = name.length > 0 ? name : "";
  const companyQ = company.length > 0 ? company : "";

  // Basic text filters
  if (combined) {
    const esc = combined.replaceAll("%", "\\%").replaceAll("_", "\\_");
    query = query.or(`full_name.ilike.%${esc}%,company_name.ilike.%${esc}%`);
  }
  if (nameQ) {
    const esc = nameQ.replaceAll("%", "\\%").replaceAll("_", "\\_");
    query = query.ilike("full_name", `%${esc}%`);
  }
  if (companyQ) {
    const esc = companyQ.replaceAll("%", "\\%").replaceAll("_", "\\_");
    query = query.ilike("company_name", `%${esc}%`);
  }

  // Postcode radius (simple, no geo): match outward code.
  // Radius is accepted but used only as a toggle so UI feels familiar.
  if (postcode.length > 0 && Number.isFinite(radius) && radius > 0) {
    const out = outwardCode(postcode);
    if (out) {
      query = query.ilike("postcode", `${out}%`);
    }
  } else if (postcode.length > 0) {
    const esc = postcode.toUpperCase().replaceAll("%", "\\%").replaceAll("_", "\\_");
    query = query.ilike("postcode", `%${esc}%`);
  }

  let data: any[] | null = null;
  let error: { message: string } | null = null;

  {
    const r = await query;
    data = (r.data as any[] | null) ?? null;
    error = r.error ? { message: r.error.message } : null;
  }

  if (error && /plan_type|subscription_status/i.test(error.message)) {
    // Backwards-compatible: if subscription columns don't exist yet, rerun without them.
    let q2 = supabase
      .from("affiliate_applications")
      .select(baseSelect)
      .in("status", ["approved", "verified"])
      .order("created_at", { ascending: false })
      .limit(200);

    if (combined) {
      const esc = combined.replaceAll("%", "\\%").replaceAll("_", "\\_");
      q2 = q2.or(`full_name.ilike.%${esc}%,company_name.ilike.%${esc}%`);
    }
    if (nameQ) {
      const esc = nameQ.replaceAll("%", "\\%").replaceAll("_", "\\_");
      q2 = q2.ilike("full_name", `%${esc}%`);
    }
    if (companyQ) {
      const esc = companyQ.replaceAll("%", "\\%").replaceAll("_", "\\_");
      q2 = q2.ilike("company_name", `%${esc}%`);
    }
    if (postcode.length > 0 && Number.isFinite(radius) && radius > 0) {
      const out = outwardCode(postcode);
      if (out) q2 = q2.ilike("postcode", `${out}%`);
    } else if (postcode.length > 0) {
      const esc = postcode.toUpperCase().replaceAll("%", "\\%").replaceAll("_", "\\_");
      q2 = q2.ilike("postcode", `%${esc}%`);
    }

    const r2 = await q2;
    data = (r2.data as any[] | null) ?? null;
    error = r2.error ? { message: r2.error.message } : null;
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const affiliates = (data ?? []).map((a) => {
    const contact_enabled = a.plan_type === "advanced" && a.subscription_status === "active";
    return {
      ...a,
      contact_enabled,
      email: contact_enabled ? a.email : null,
      phone: contact_enabled ? a.phone : null,
    };
  });

  return NextResponse.json({ affiliates }, { status: 200 });
}

