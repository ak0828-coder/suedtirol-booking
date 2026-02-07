-- Fix bookings_payment_status_check to allow unpaid for Stripe checkout
ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS bookings_payment_status_check;

ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_payment_status_check
  CHECK (payment_status IN ('unpaid','paid_stripe','paid_cash','paid_member','internal'));
