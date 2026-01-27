import Stripe from 'stripe';

// Wir nutzen einen "Dummy-Wert" für den Build-Prozess, falls der Key fehlt.
// Im echten Betrieb (Runtime) ist der Key dann da.
const stripeKey = process.env.STRIPE_SECRET_KEY || "dummy_key_for_build";

export const stripe = new Stripe(stripeKey, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});