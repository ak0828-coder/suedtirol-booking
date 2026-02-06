-- Switch-Kit: Import/Invite Felder
alter table public.club_members
  add column if not exists invite_status text default 'none',
  add column if not exists imported_at timestamptz,
  add column if not exists invited_at timestamptz,
  add column if not exists import_email text,
  add column if not exists credit_balance numeric default 0;

-- Optional: Index für schnelle Filter (importierte Mitglieder)
create index if not exists club_members_invite_status_idx
  on public.club_members (club_id, invite_status);
