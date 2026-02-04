-- Match results stored for member statistics
create table if not exists public.match_results (
  id uuid primary key default gen_random_uuid(),
  club_id uuid references public.clubs(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete cascade,
  player_user_id uuid references auth.users(id),
  opponent_user_id uuid references auth.users(id),
  player_name text,
  opponent_name text,
  result_text text,
  created_at timestamptz not null default now()
);

alter table public.match_results enable row level security;

create policy "match_results_member_read"
  on public.match_results
  for select
  using (player_user_id = auth.uid() or opponent_user_id = auth.uid());
