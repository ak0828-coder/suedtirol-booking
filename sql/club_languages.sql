-- Club language settings
-- Run in Supabase SQL editor

ALTER TABLE clubs
ADD COLUMN IF NOT EXISTS supported_languages TEXT[] DEFAULT ARRAY['de','it'];

ALTER TABLE clubs
ADD COLUMN IF NOT EXISTS default_language TEXT DEFAULT 'de';
