alter table clubs
add column if not exists feature_flags jsonb default '{}'::jsonb;
