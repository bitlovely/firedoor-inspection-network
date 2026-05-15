-- Fire Door Network — affiliate applications + private document storage
-- Run in Supabase SQL Editor (or `supabase db push`) after creating a project.

create table if not exists public.affiliate_applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'verified')),
  full_name text not null,
  company_name text not null,
  email text not null,
  phone text not null,
  postcode text not null,
  years_experience smallint not null check (years_experience >= 0 and years_experience <= 80),
  areas_covered text not null,
  certification_paths jsonb not null default '[]'::jsonb,
  insurance_path text not null,
  dbs_path text,
  internal_notes text,
  reviewed_at timestamptz,
  reviewed_by uuid
);

create index if not exists affiliate_applications_created_at_idx
  on public.affiliate_applications (created_at desc);

create index if not exists affiliate_applications_status_idx
  on public.affiliate_applications (status);

create index if not exists affiliate_applications_postcode_idx
  on public.affiliate_applications (postcode);

comment on table public.affiliate_applications is 'Affiliate signup pipeline — core asset for directory and verification.';

alter table public.affiliate_applications enable row level security;

-- No policies: only the service role (server) can access this table.

insert into storage.buckets (id, name, public)
values ('application-documents', 'application-documents', false)
on conflict (id) do nothing;
