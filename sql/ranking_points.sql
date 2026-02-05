-- Ranking points per club (eTennis-style)
create table if not exists public.ranking_points (
  id uuid primary key default gen_random_uuid(),
  club_id uuid references public.clubs(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  points integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (club_id, user_id)
);

create index if not exists ranking_points_club_points_idx
  on public.ranking_points (club_id, points desc);

alter table public.ranking_points enable row level security;

create policy "ranking_points_member_read"
  on public.ranking_points
  for select
  using (user_id = auth.uid());
