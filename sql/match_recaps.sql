-- Booking: store guest email + user id
alter table public.bookings
  add column if not exists guest_email text,
  add column if not exists user_id uuid references auth.users(id);

create index if not exists bookings_user_id_idx on public.bookings(user_id);

-- Match recap tokens + results
create table if not exists public.match_recaps (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid unique references public.bookings(id) on delete cascade,
  club_id uuid references public.clubs(id) on delete cascade,
  token text unique not null,
  guest_name text,
  guest_email text,
  player_user_id uuid references auth.users(id),
  opponent_user_id uuid references auth.users(id),
  opponent_name text,
  result_text text,
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  completed_at timestamptz
);

alter table public.match_recaps enable row level security;

-- Members can view their own recaps
create policy "match_recaps_member_select"
  on public.match_recaps
  for select
  using (player_user_id = auth.uid());
