-- Fire Door Network — unique FDIN membership PIN per inspector application

alter table public.affiliate_applications
  add column if not exists fdin_pin text;

create unique index if not exists affiliate_applications_fdin_pin_key
  on public.affiliate_applications (fdin_pin)
  where fdin_pin is not null;

comment on column public.affiliate_applications.fdin_pin is
  'Unique FDIN membership number shown to inspectors and support (e.g. FDIN-284719).';

-- Backfill existing applications
create or replace function public.generate_fdin_pin()
returns text
language plpgsql
as $$
declare
  candidate text;
  tries int := 0;
begin
  loop
    candidate := 'FDIN-' || lpad((floor(random() * 900000) + 100000)::text, 6, '0');
    if not exists (
      select 1 from public.affiliate_applications where fdin_pin = candidate
    ) then
      return candidate;
    end if;
    tries := tries + 1;
    exit when tries > 50;
  end loop;
  return 'FDIN-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
end;
$$;

update public.affiliate_applications
set fdin_pin = public.generate_fdin_pin()
where fdin_pin is null;

drop function if exists public.generate_fdin_pin();
