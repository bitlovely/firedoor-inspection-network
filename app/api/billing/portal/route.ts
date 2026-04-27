import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/server";

export const runtime = "nodejs";

function getOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (origin) return origin;
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  if (site) return site.replace(/\/$/, "");
  return "";
}

export async function POST(request: Request) {
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
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const publicClient = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: userData, error: userErr } = await publicClient.auth.getUser();
  if (userErr || !userData.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: app, error: appErr } = await admin
    .from("affiliate_applications")
    .select("id,status,stripe_customer_id")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (appErr) {
    return NextResponse.json({ error: appErr.message }, { status: 500 });
  }
  if (!app?.id) {
    return NextResponse.json({ error: "No application found" }, { status: 404 });
  }
  if (!(app.status === "approved" || app.status === "verified")) {
    return NextResponse.json(
      { error: "Only approved affiliates can manage subscriptions." },
      { status: 403 },
    );
  }
  if (!app.stripe_customer_id) {
    return NextResponse.json(
      { error: "No billing customer found. Upgrade first." },
      { status: 400 },
    );
  }

  const origin = getOrigin(request);
  if (!origin) {
    return NextResponse.json({ error: "Missing site origin" }, { status: 500 });
  }

  const stripe = getStripe();
  const portal = await stripe.billingPortal.sessions.create({
    customer: app.stripe_customer_id,
    return_url: `${origin}/dashboard?tab=subscription`,
  });

  return NextResponse.json({ url: portal.url }, { status: 200 });
}

