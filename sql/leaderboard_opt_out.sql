-- Member leaderboard visibility (default: enabled)
alter table public.club_members
  add column if not exists leaderboard_opt_out boolean not null default false;

create index if not exists club_members_leaderboard_opt_out_idx
  on public.club_members (club_id, leaderboard_opt_out);
