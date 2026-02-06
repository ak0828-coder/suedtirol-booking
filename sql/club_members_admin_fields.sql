-- Admin-Override Felder für Beiträge & Status
alter table public.club_members
  add column if not exists payment_status text default 'unpaid',
  add column if not exists next_payment_at timestamptz;
