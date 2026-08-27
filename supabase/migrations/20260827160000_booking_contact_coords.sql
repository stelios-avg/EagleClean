alter table public.bookings
  add column if not exists contact_lat double precision,
  add column if not exists contact_lng double precision;

alter table public.profiles
  add column if not exists address_lat double precision,
  add column if not exists address_lng double precision;

comment on column public.bookings.contact_lat is 'Customer pin latitude from device GPS or geocoded address.';
comment on column public.bookings.contact_lng is 'Customer pin longitude from device GPS or geocoded address.';
comment on column public.profiles.address_lat is 'Saved home pin latitude for returning customers.';
comment on column public.profiles.address_lng is 'Saved home pin longitude for returning customers.';
