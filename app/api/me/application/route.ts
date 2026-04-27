import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    return NextResponse.json(
      { error: "Missing Supabase public env vars" },
      { status: 500 },
    );
  }

  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7).trim()
    : "";
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const publicClient = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: userData, error: userErr } = await publicClient.auth.getUser();
  if (userErr || !userData.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const baseSelect =
    "id,status,full_name,company_name,email,phone,postcode,years_experience,areas_covered,created_at,certification_paths,insurance_path,dbs_path,profile_photo_path,verified_insurance,verified_certification,identity_checked";
  const planSelect = `${baseSelect},plan_type,subscription_status,subscription_current_period_end`;

  let data: unknown = null;
  let error: { message: string } | null = null;

  // Backwards-compatible: if the subscription columns haven't been migrated yet,
  // retry without them and default to Basic in the UI.
  {
    const r = await admin
      .from("affiliate_applications")
      .select(planSelect)
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    data = r.data;
    error = r.error ? { message: r.error.message } : null;
  }

  if (error && /plan_type|subscription_status|subscription_current_period_end/i.test(error.message)) {
    const r = await admin
      .from("affiliate_applications")
      .select(baseSelect)
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    data = r.data
      ? {
          ...(r.data as Record<string, unknown>),
          plan_type: "basic",
          subscription_status: "inactive",
          subscription_current_period_end: null,
        }
      : r.data;
    error = r.error ? { message: r.error.message } : null;
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ application: null }, { status: 200 });
  }

  return NextResponse.json({ application: data }, { status: 200 });
}

