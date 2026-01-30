import Stripe from 'stripe';

const stripeKey = process.env.STRIPE_SECRET_KEY || "dummy_key_for_build";

export const stripe = new Stripe(stripeKey, {
  // FIX: Wir nutzen 'as any', damit der Build nicht wegen der Version abbricht,
  // falls die installierte Library die Version noch nicht kennt.
  apiVersion: '2024-12-18.acacia' as any, 
  typescript: true,
});