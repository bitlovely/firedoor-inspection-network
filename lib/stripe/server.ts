import Stripe from "stripe";

let stripe: Stripe | null = null;

export function getStripe() {
  if (stripe) return stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY");
  stripe = new Stripe(key, {
    apiVersion: "2026-04-22.dahlia",
    typescript: true,
  });
  return stripe;
}

