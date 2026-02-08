-- Course pricing mode
-- Run in Supabase SQL editor

alter table public.courses
  add column if not exists pricing_mode text default 'full_course';

-- Optional constraint to keep values consistent
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'courses_pricing_mode_check'
  ) then
    alter table public.courses
      add constraint courses_pricing_mode_check
      check (pricing_mode in ('full_course','per_session'));
  end if;
end $$;
