create table if not exists public.booking_reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  want_same_cleaner boolean not null default true,
  tip_cents integer not null default 0 check (tip_cents >= 0 and tip_cents <= 100000),
  created_at timestamptz not null default now()
);

create index if not exists booking_reviews_user_id_idx
  on public.booking_reviews (user_id);

comment on table public.booking_reviews is
  'Customer rating, optional comment, same-cleaner preference and tip after a completed visit.';

alter table public.booking_reviews enable row level security;

create policy "Customers and admins can read reviews"
on public.booking_reviews
for select
to authenticated
using (
  user_id = (select auth.uid())
  or (select private.is_admin())
);

create policy "Customers insert own review for completed booking"
on public.booking_reviews
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.bookings b
    where b.id = booking_id
      and b.user_id = (select auth.uid())
      and b.status = 'completed'
  )
);

grant select, insert on table public.booking_reviews to authenticated;
