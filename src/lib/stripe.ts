import Stripe from 'stripe';

// Wir nutzen einen "Dummy-Wert" für den Build-Prozess, falls der Key fehlt.
// Im echten Betrieb (Runtime) ist der Key dann da.
const stripeKey = process.env.STRIPE_SECRET_KEY || "dummy_key_for_build";

export const stripe = new Stripe(stripeKey, {
  apiVersion: '2025-12-15.clover', // <--- Aktualisiert
  typescript: true,
});