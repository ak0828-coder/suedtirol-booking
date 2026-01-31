import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createClient } from "@supabase/supabase-js"

// WICHTIG: Wir nutzen hier den Service Role Key, da Webhooks im Hintergrund laufen
// und keine aktive User-Session haben. Damit umgehen wir RLS.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(req: Request) {
  const body = await req.text()
  const signature = (await headers()).get("Stripe-Signature") as string

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: any) {
    console.error("Webhook Signature Error:", error.message)
    return new NextResponse("Webhook Error: " + error.message, { status: 400 })
  }

  const session = event.data.object as any

  // 1. NEUES ABO ABGESCHLOSSEN
  if (event.type === "checkout.session.completed") {
    // Wir prüfen, ob es wirklich unser Abo-Checkout war
    if (session.metadata?.type === 'membership_subscription') {
        const { userId, clubId, planId } = session.metadata

        // Datum berechnen: Heute + 1 Jahr
        const validUntil = new Date()
        validUntil.setFullYear(validUntil.getFullYear() + 1)

        console.log(`✅ Neues Abo für User ${userId} im Club ${clubId}`)

        const { error } = await supabaseAdmin.from('club_members').upsert({
            user_id: userId,
            club_id: clubId,
            plan_id: planId,
            stripe_subscription_id: session.subscription, // Wichtig für spätere Updates
            status: 'active',
            valid_until: validUntil.toISOString()
        }, { onConflict: 'club_id, user_id' }) // Falls Eintrag existiert, überschreiben

        if(error) {
            console.error("Datenbank Fehler beim Abo-Erstellen:", error)
            return new NextResponse("DB Error", { status: 500 })
        }
    }
  }

  // 2. ABO ERFOLGREICH VERLÄNGERT (Passiert automatisch nach einem Jahr)
  if (event.type === "invoice.payment_succeeded") {
      const subscriptionId = session.subscription
      
      // Wir suchen den Member anhand der Subscription ID
      const { data: member } = await supabaseAdmin
        .from('club_members')
        .select('*')
        .eq('stripe_subscription_id', subscriptionId)
        .single()

      if (member) {
          // Datum um 1 Jahr verlängern basierend auf dem aktuellen Ablaufdatum
          // (oder heute, falls schon abgelaufen)
          const currentValid = new Date(member.valid_until)
          const now = new Date()
          
          // Nimm das spätere Datum (damit man keine Tage verliert)
          const baseDate = currentValid > now ? currentValid : now
          baseDate.setFullYear(baseDate.getFullYear() + 1)

          console.log(`🔄 Abo verlängert für Member ${member.id}`)

          await supabaseAdmin.from('club_members').update({
              status: 'active',
              valid_until: baseDate.toISOString()
          }).eq('id', member.id)
      }
  }

  // 3. ZAHLUNG FEHLGESCHLAGEN (Kreditkarte abgelaufen etc.)
  if (event.type === "invoice.payment_failed") {
      const subscriptionId = session.subscription
      
      console.log(`❌ Abo Zahlung fehlgeschlagen für Subscription ${subscriptionId}`)

      await supabaseAdmin.from('club_members').update({
          status: 'expired' 
      }).eq('stripe_subscription_id', subscriptionId)
  }

  return new NextResponse(null, { status: 200 })
}