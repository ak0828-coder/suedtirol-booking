-- Prevent double bookings at the same court/time slot
create unique index if not exists bookings_court_start_unique
  on public.bookings (court_id, start_time);
