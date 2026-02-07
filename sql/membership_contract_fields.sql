alter table clubs
add column if not exists membership_contract_fields jsonb default '[]'::jsonb;

alter table club_members
add column if not exists extra_fields jsonb default '{}'::jsonb;
