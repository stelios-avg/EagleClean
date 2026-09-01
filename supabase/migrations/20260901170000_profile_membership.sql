-- Monthly €14.99 membership. Billing fields are written by the Edge Function
-- (service role) or an admin — never by the customer client.

alter table public.profiles
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists membership_status text not null default 'none',
  add column if not exists membership_renews_at timestamptz;

alter table public.profiles
  drop constraint if exists profiles_membership_status_check;

alter table public.profiles
  add constraint profiles_membership_status_check
  check (membership_status in ('none', 'incomplete', 'active', 'past_due', 'canceled'));

comment on column public.profiles.membership_status is 'Stripe subscription status for the €14.99 membership.';

create or replace function private.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Service role (Edge Functions) may update billing fields.
  if coalesce(auth.role(), '') = 'service_role' then
    return new;
  end if;

  if new.role is distinct from old.role and not private.is_admin() then
    new.role := old.role;
  end if;

  if not private.is_admin() then
    new.stripe_customer_id := old.stripe_customer_id;
    new.stripe_subscription_id := old.stripe_subscription_id;
    new.membership_status := old.membership_status;
    new.membership_renews_at := old.membership_renews_at;
  end if;

  return new;
end;
$$;
