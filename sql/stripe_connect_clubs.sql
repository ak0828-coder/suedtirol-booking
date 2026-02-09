-- Stripe Connect fields for clubs
-- Run in Supabase SQL editor

alter table public.clubs
  add column if not exists stripe_account_id text;

alter table public.clubs
  add column if not exists stripe_details_submitted boolean default false;
