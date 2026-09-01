-- The previous UPDATE policy compared NEW.role to a subquery on public.profiles.
-- That subquery re-enters RLS on the same table and raises:
--   infinite recursion detected in policy for relation "profiles"
-- Keep role immutable for customers with a SECURITY DEFINER trigger instead.

drop policy if exists "Users can update own profile (not role)" on public.profiles;

create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create or replace function private.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not private.is_admin() then
    new.role := old.role;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_role on public.profiles;
create trigger profiles_protect_role
before update on public.profiles
for each row
execute function private.protect_profile_role();

revoke all on function private.protect_profile_role() from public;
