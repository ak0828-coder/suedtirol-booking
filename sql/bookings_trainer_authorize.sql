-- Add payment_intent_id for trainer manual capture
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS payment_intent_id text;
