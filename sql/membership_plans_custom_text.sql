ALTER TABLE membership_plans
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS cta_label text,
ADD COLUMN IF NOT EXISTS features text;
