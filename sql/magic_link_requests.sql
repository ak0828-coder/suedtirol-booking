create table if not exists public.magic_link_requests (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  email text not null,
  last_sent_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists magic_link_requests_session_email_unique
  on public.magic_link_requests (session_id, email);

create index if not exists magic_link_requests_last_sent_idx
  on public.magic_link_requests (last_sent_at);
