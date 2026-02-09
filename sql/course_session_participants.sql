-- Course session participants (per-session enrollments)
-- Run in Supabase SQL editor

create table if not exists public.course_session_participants (
  id uuid default gen_random_uuid() primary key,
  course_session_id uuid references public.course_sessions(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  status text not null default 'confirmed', -- confirmed | cancelled | waitlist
  payment_status text not null default 'unpaid', -- unpaid | paid_stripe | paid_cash
  joined_at timestamptz default now(),
  unique(course_session_id, user_id)
);

create index if not exists course_session_participants_session_id_idx
  on public.course_session_participants(course_session_id);
