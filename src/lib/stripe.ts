import Stripe from 'stripe';

// Wir nutzen das Ausrufezeichen (!), um TypeScript zu sagen: 
// "Vertrau mir, diese Variable existiert in der .env Datei!"
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});