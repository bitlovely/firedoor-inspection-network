-- Public directory inspection enquiries (MVP: store + admin notification)

create table if not exists public.directory_enquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  affiliate_application_id uuid not null
    references public.affiliate_applications (id) on delete cascade,
  enquirer_name text not null,
  enquirer_email text not null,
  enquirer_phone text not null,
  enquirer_postcode text not null,
  message text not null
);

create index if not exists directory_enquiries_created_at_idx
  on public.directory_enquiries (created_at desc);

create index if not exists directory_enquiries_affiliate_idx
  on public.directory_enquiries (affiliate_application_id);

comment on table public.directory_enquiries is 'Request Inspection submissions from public directory profiles.';

alter table public.directory_enquiries enable row level security;

-- No policies: only the service role (server) can access this table.
