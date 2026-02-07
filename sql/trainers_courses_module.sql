-- Trainers & Courses module (core schema)
-- Run in Supabase SQL editor

-- Trainers
create table if not exists public.trainers (
  id uuid default gen_random_uuid() primary key,
  club_id uuid references public.clubs(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  bio text,
  image_url text,
  hourly_rate numeric not null default 0,
  salary_type text not null default 'hourly', -- hourly | commission | free
  default_rate numeric not null default 0, -- hourly amount or commission %
  payout_method text not null default 'manual', -- manual | iban | stripe_connect | cash
  iban text,
  stripe_account_id text,
  include_court_fee boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz default now()
);

create index if not exists trainers_club_id_idx on public.trainers(club_id);

-- Courses
create table if not exists public.courses (
  id uuid default gen_random_uuid() primary key,
  club_id uuid references public.clubs(id) on delete cascade,
  trainer_id uuid references public.trainers(id) on delete set null,
  title text not null,
  description text,
  price numeric not null default 0,
  max_participants integer not null default 8,
  start_date date,
  end_date date,
  is_published boolean not null default false,
  created_at timestamptz default now()
);

create index if not exists courses_club_id_idx on public.courses(club_id);

-- Course sessions
create table if not exists public.course_sessions (
  id uuid default gen_random_uuid() primary key,
  course_id uuid references public.courses(id) on delete cascade,
  court_id uuid references public.courts(id) on delete set null,
  start_time timestamptz not null,
  end_time timestamptz not null
);

create index if not exists course_sessions_course_id_idx on public.course_sessions(course_id);

-- Course participants
create table if not exists public.course_participants (
  id uuid default gen_random_uuid() primary key,
  course_id uuid references public.courses(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  status text not null default 'confirmed', -- confirmed | cancelled | waitlist
  payment_status text not null default 'unpaid', -- unpaid | paid_stripe | paid_cash
  joined_at timestamptz default now(),
  unique(course_id, user_id)
);

create index if not exists course_participants_course_id_idx on public.course_participants(course_id);

-- Trainer payouts ledger
create table if not exists public.trainer_payouts (
  id uuid default gen_random_uuid() primary key,
  trainer_id uuid references public.trainers(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete set null,
  course_id uuid references public.courses(id) on delete set null,
  amount numeric not null,
  status text not null default 'pending', -- pending | paid
  payout_date timestamptz,
  created_at timestamptz default now()
);

create index if not exists trainer_payouts_trainer_id_idx on public.trainer_payouts(trainer_id);

-- Extend bookings
alter table public.bookings
  add column if not exists trainer_id uuid references public.trainers(id) on delete set null,
  add column if not exists course_session_id uuid references public.course_sessions(id) on delete set null,
  add column if not exists booking_type text default 'court'; -- court | trainer | course

-- Expand payment_status constraint for internal blocks
alter table public.bookings
  drop constraint if exists bookings_payment_status_check;
alter table public.bookings
  add constraint bookings_payment_status_check
  check (payment_status in ('unpaid','paid_stripe','paid_cash','paid_member','internal'));

-- Optional: ensure no double booking on trainer/time
create index if not exists bookings_trainer_time_idx on public.bookings(trainer_id, start_time, end_time);
