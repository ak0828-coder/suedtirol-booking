-- Trainer availability + decision tokens
-- Run in Supabase SQL editor

-- Trainer weekly availability (JSON array of {day,start,end})
alter table public.trainers
  add column if not exists availability jsonb default '[]'::jsonb;

-- Trainer booking decision tokens
alter table public.bookings
  add column if not exists trainer_action_token text,
  add column if not exists trainer_action_expires_at timestamptz;

create index if not exists bookings_trainer_action_token_idx
  on public.bookings(trainer_action_token);

-- Optional storage bucket for trainer photos
insert into storage.buckets (id, name, public)
values ('trainer-photos', 'trainer-photos', true)
on conflict (id) do nothing;
