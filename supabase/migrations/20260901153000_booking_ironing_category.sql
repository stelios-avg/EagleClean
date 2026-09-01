alter table public.bookings drop constraint if exists bookings_category_check;

alter table public.bookings
  add constraint bookings_category_check
  check (category = any (array['my-home'::text, 'cleaning-crew'::text, 'ironing'::text]));
