-- Stripe subscription fields for affiliate plans.
-- Basic (default): limited visibility (no direct contact details).
-- Advanced (paid): full visibility + contact access.

alter table public.affiliate_applications
  add column if not exists plan_type text not null default 'basic'
    check (plan_type in ('basic', 'advanced')),
  add column if not exists subscription_status text not null default 'inactive'
    check (subscription_status in ('active', 'inactive')),
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists subscription_current_period_end timestamptz;

create index if not exists affiliate_applications_stripe_customer_id_idx
  on public.affiliate_applications (stripe_customer_id);

create index if not exists affiliate_applications_stripe_subscription_id_idx
  on public.affiliate_applications (stripe_subscription_id);

comment on column public.affiliate_applications.plan_type is 'basic|advanced plan for directory visibility.';
comment on column public.affiliate_applications.subscription_status is 'active|inactive Stripe subscription state for Advanced plan.';
comment on column public.affiliate_applications.stripe_customer_id is 'Stripe customer id for billing.';
comment on column public.affiliate_applications.stripe_subscription_id is 'Stripe subscription id for billing.';
comment on column public.affiliate_applications.subscription_current_period_end is 'Current period end timestamp from Stripe.';

