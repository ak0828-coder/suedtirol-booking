alter table clubs
add column if not exists has_ai_check boolean default false,
add column if not exists has_contract_signing boolean default false,
add column if not exists has_gamification boolean default false,
add column if not exists has_vouchers boolean default true;
