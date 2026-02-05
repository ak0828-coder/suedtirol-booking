-- Member document storage and review flow
create table if not exists public.member_documents (
  id uuid primary key default gen_random_uuid(),
  club_id uuid references public.clubs(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  doc_type text not null,
  file_path text not null,
  file_name text not null,
  file_size integer,
  mime_type text,
  ai_status text not null default 'pending', -- pending | ok | reject | error
  ai_confidence numeric,
  ai_reason text,
  review_status text not null default 'pending', -- pending | approved | rejected
  temp_valid_until timestamptz,
  valid_until timestamptz,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists member_documents_club_user_idx
  on public.member_documents (club_id, user_id);

create index if not exists member_documents_club_status_idx
  on public.member_documents (club_id, review_status, ai_status);

alter table public.member_documents enable row level security;

create policy "member_documents_self_read"
  on public.member_documents
  for select
  using (user_id = auth.uid());
