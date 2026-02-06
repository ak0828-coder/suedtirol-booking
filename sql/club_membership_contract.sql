-- Membership contract template per club
alter table public.clubs
  add column if not exists membership_contract_title text,
  add column if not exists membership_contract_body text,
  add column if not exists membership_contract_version integer default 1,
  add column if not exists membership_contract_updated_at timestamptz;
