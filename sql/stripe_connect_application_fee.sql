-- Application fee per booking (in cents) for Stripe Connect
-- Run in Supabase SQL editor

alter table public.clubs
  add column if not exists application_fee_cents integer default 0;
