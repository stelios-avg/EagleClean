create or replace function public.bookings_guard_admin_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not private.is_admin() then
    if tg_op = 'INSERT' then
      new.arrival_time := null;
    elsif tg_op = 'UPDATE' then
      new.arrival_time := old.arrival_time;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists bookings_guard_admin_fields on public.bookings;
create trigger bookings_guard_admin_fields
before insert or update on public.bookings
for each row execute function public.bookings_guard_admin_fields();
