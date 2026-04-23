-- Link affiliate applications to Supabase Auth users.
-- This enables sign-in after applying, and per-user dashboards.

alter table public.affiliate_applications
add column if not exists user_id uuid;

create index if not exists affiliate_applications_user_id_idx
  on public.affiliate_applications (user_id);

-- Enforce 1 application per auth user (optional but useful).
create unique index if not exists affiliate_applications_user_id_unique_idx
  on public.affiliate_applications (user_id)
  where user_id is not null;

