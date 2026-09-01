create table if not exists public.closed_slots (
  id uuid primary key default gen_random_uuid(),
  service_date date not null,
  start_hour smallint not null check (start_hour >= 0 and start_hour <= 23),
  end_hour smallint not null check (end_hour > start_hour and end_hour <= 24),
  created_at timestamptz not null default now()
);

create unique index if not exists closed_slots_day_range_idx
  on public.closed_slots (service_date, start_hour, end_hour);

comment on table public.closed_slots is 'Admin-closed visit windows. Slots stay open until an admin closes them or the start time passes.';

alter table public.closed_slots enable row level security;

create policy "Anyone can view closed slots"
on public.closed_slots
for select
using (true);

create policy "Admins can insert closed slots"
on public.closed_slots
for insert
with check ((select private.is_admin()));

create policy "Admins can delete closed slots"
on public.closed_slots
for delete
using ((select private.is_admin()));

grant select on table public.closed_slots to anon, authenticated;
grant insert, delete on table public.closed_slots to authenticated;

do $$
begin
  alter publication supabase_realtime add table public.closed_slots;
exception
  when duplicate_object then null;
end
$$;
