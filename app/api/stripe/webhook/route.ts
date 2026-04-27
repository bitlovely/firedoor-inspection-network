import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/server";
import Stripe from "stripe";

export const runtime = "nodejs";

function toPlan(sub: Stripe.Subscription) {
  const activeLike = ["active", "trialing", "past_due"];
  const isActive = activeLike.includes(sub.status);
  const itemPeriodEnds = sub.items?.data
    ?.map((i) => i.current_period_end)
    .filter((v): v is number => typeof v === "number");
  const maxEnd =
    itemPeriodEnds && itemPeriodEnds.length > 0 ? Math.max(...itemPeriodEnds) : null;
  return {
    plan_type: isActive ? "advanced" : "basic",
    subscription_status: isActive ? "active" : "inactive",
    stripe_subscription_id: sub.id,
    subscription_current_period_end: maxEnd ? new Date(maxEnd * 1000).toISOString() : null,
  } as const;
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Missing STRIPE_WEBHOOK_SECRET" }, { status: 500 });
  }

  const stripe = getStripe();
  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  const body = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Invalid signature" },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = typeof session.customer === "string" ? session.customer : "";
        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : "";
        if (!customerId || !subscriptionId) break;

        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        const patch = { ...toPlan(sub), stripe_customer_id: customerId, updated_at: new Date().toISOString() };

        const { error } = await admin
          .from("affiliate_applications")
          .update(patch)
          .eq("stripe_customer_id", customerId);
        if (error) throw new Error(error.message);
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === "string" ? sub.customer : "";
        if (!customerId) break;
        const patch = { ...toPlan(sub), stripe_customer_id: customerId, updated_at: new Date().toISOString() };

        const { error } = await admin
          .from("affiliate_applications")
          .update(patch)
          .eq("stripe_customer_id", customerId);
        if (error) throw new Error(error.message);
        break;
      }
      default:
        break;
    }
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Webhook handler failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

