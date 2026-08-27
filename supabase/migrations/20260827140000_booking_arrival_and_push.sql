alter table public.bookings
  add column if not exists arrival_time text,
  add column if not exists push_token text;

alter table public.profiles
  add column if not exists push_token text;

comment on column public.bookings.arrival_time is 'Admin-chosen arrival clock time (HH:MM) on the service_date.';
comment on column public.bookings.push_token is 'Expo push token of the device that created the booking.';
comment on column public.profiles.push_token is 'Latest Expo push token for the signed-in customer.';

create or replace function public.bookings_guard_admin_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and not private.is_admin() then
    new.arrival_time := old.arrival_time;
  end if;
  return new;
end;
$$;

drop trigger if exists bookings_guard_admin_fields on public.bookings;
create trigger bookings_guard_admin_fields
before update on public.bookings
for each row execute function public.bookings_guard_admin_fields();
