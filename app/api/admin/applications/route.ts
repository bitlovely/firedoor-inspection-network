import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminCookieName, verifyAdminSession } from "@/lib/admin/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { BUCKET } from "@/lib/affiliate-application";
import { isAdminBearer } from "@/lib/admin/bearer-auth";

export const runtime = "nodejs";

async function assertAdmin(request: Request) {
  // cookie-based (web)
  const jar = await cookies();
  const cookieToken = jar.get(adminCookieName())?.value ?? "";
  const cookieSession = cookieToken ? verifyAdminSession(cookieToken) : null;
  if (cookieSession?.role === "admin") return cookieSession;
  // bearer-based: custom admin JWT (mobile)
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const bearerSession = verifyAdminSession(authHeader.slice(7));
    if (bearerSession?.role === "admin") return bearerSession;
  }
  // bearer-based: Supabase JWT (mobile — legacy)
  if (await isAdminBearer(authHeader)) return { role: "admin" };
  return null;
}

export async function GET(request: Request) {
  if (!(await assertAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("affiliate_applications")
    .select(
      "id,created_at,status,full_name,company_name,email,phone,postcode,years_experience,areas_covered,certification_paths,insurance_path,dbs_path,internal_notes,profile_photo_path,bio,services,review_count,review_rating",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as Array<Record<string, unknown>>;
  const withPhotoUrl = await Promise.all(
    rows.map(async (row) => {
      const path = typeof row.profile_photo_path === "string" ? row.profile_photo_path : "";
      if (!path) return { ...row, profile_photo_url: null };
      const r = await supabase.storage.from(BUCKET).createSignedUrl(path, 60);
      if (r.error) return { ...row, profile_photo_url: null };
      return { ...row, profile_photo_url: r.data.signedUrl };
    }),
  );

  return NextResponse.json({ applications: withPhotoUrl }, { status: 200 });
}

