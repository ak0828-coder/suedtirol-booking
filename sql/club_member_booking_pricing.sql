ALTER TABLE clubs
ADD COLUMN IF NOT EXISTS member_booking_pricing_mode text DEFAULT 'full_price',
ADD COLUMN IF NOT EXISTS member_booking_pricing_value numeric DEFAULT 0;
