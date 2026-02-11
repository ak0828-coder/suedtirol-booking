-- Ensure one membership per club/user
create unique index if not exists club_members_unique
  on public.club_members (club_id, user_id);
