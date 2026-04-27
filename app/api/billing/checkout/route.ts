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

  const priceId = process.env.STRIPE_PRICE_ID_ADVANCED_MONTHLY;
  if (!priceId) {
    return NextResponse.json(
      { error: "Missing STRIPE_PRICE_ID_ADVANCED_MONTHLY" },
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
    .select(
      "id,status,email,full_name,company_name,plan_type,subscription_status,stripe_customer_id",
    )
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
      { error: "Only approved affiliates can upgrade." },
      { status: 403 },
    );
  }

  const stripe = getStripe();
  const origin = getOrigin(request);
  if (!origin) {
    return NextResponse.json({ error: "Missing site origin" }, { status: 500 });
  }

  let customerId = app.stripe_customer_id ?? "";
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: app.email,
      name: app.full_name,
      metadata: {
        application_id: app.id,
        user_id: userData.user.id,
      },
    });
    customerId = customer.id;
    const { error: saveErr } = await admin
      .from("affiliate_applications")
      .update({ stripe_customer_id: customerId, updated_at: new Date().toISOString() })
      .eq("id", app.id);
    if (saveErr) {
      return NextResponse.json({ error: saveErr.message }, { status: 500 });
    }
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${origin}/dashboard?tab=subscription&success=1`,
    cancel_url: `${origin}/dashboard?tab=subscription&canceled=1`,
    metadata: {
      application_id: app.id,
      user_id: userData.user.id,
    },
  });

  return NextResponse.json({ url: session.url }, { status: 200 });
}

