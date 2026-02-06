-- Membership fee configuration per club
alter table public.clubs
  add column if not exists membership_fee numeric default 0,
  add column if not exists membership_fee_currency text default 'EUR',
  add column if not exists membership_fee_enabled boolean default false,
  add column if not exists membership_allow_subscription boolean default true;

-- Member contract signature tracking
alter table public.club_members
  add column if not exists contract_signed_at timestamptz,
  add column if not exists contract_version integer;
