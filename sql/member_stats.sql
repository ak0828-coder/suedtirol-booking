-- Member stats for gamification (per club)
create table if not exists public.member_stats (
  id uuid primary key default gen_random_uuid(),
  club_id uuid references public.clubs(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  matches_played integer not null default 0,
  wins integer not null default 0,
  losses integer not null default 0,
  win_streak integer not null default 0,
  best_streak integer not null default 0,
  last_match_at timestamptz,
  last_win_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (club_id, user_id)
);

create index if not exists member_stats_club_user_idx
  on public.member_stats (club_id, user_id);

alter table public.member_stats enable row level security;

create policy "member_stats_self_read"
  on public.member_stats
  for select
  using (user_id = auth.uid());
