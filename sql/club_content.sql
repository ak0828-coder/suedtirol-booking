-- Club Content CMS Table
create table if not exists public.club_content (
  club_id uuid primary key references public.clubs(id) on delete cascade,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Public read for club pages
alter table public.club_content enable row level security;

create policy "club_content_public_read"
  on public.club_content
  for select
  using (true);

-- Admin write (owner or super admin) is handled by service role in server actions.
