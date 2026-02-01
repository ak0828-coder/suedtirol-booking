import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createClient } from "@supabase/supabase-js"
import { Resend } from 'resend'
import { WelcomeMemberEmailTemplate } from '@/components/emails/welcome-member-template'

const resend = new Resend(process.env.RESEND_API_KEY)

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
    if (session.metadata?.type === 'membership_subscription') {
        let { userId, clubId, planId } = session.metadata
        const customerEmail = session.customer_details?.email

        // FALLS KEIN USER EINGELOGGT WAR: AUTOMATISCH ERSTELLEN
        if (!userId && customerEmail) {
            console.log(`Creating new user for ${customerEmail}...`)
            
            // Zufälliges Passwort generieren
            const tempPassword = Math.random().toString(36).slice(-8) + "Aa1!"
            
            // 1. User in Supabase anlegen
            const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
                email: customerEmail,
                password: tempPassword,
                email_confirm: true,
                user_metadata: { 
                    must_change_password: true,
                    name: 'Neues Mitglied', // Fix für DB Trigger
                    full_name: 'Neues Mitglied' // Fix für DB Trigger
                }
            })

            if (createError) {
                // Falls User schon existiert (aber nicht eingeloggt war), holen wir seine ID
                // Hinweis: Supabase API gibt generischen Fehler bei Duplikaten, wir prüfen via listUsers
                const { data: listUsers } = await supabaseAdmin.auth.admin.listUsers()
                const found = listUsers.users.find(u => u.email === customerEmail)
                
                if (found) {
                    console.log("User existiert bereits, verknüpfe Abo mit existierendem Account.")
                    userId = found.id
                } else {
                    console.error("User Creation Error:", createError)
                    return new NextResponse("User Creation Failed", { status: 500 })
                }
            } else {
                userId = newUser.user.id

                // 2. Willkommens-Mail mit Passwort senden
                // Club Name holen für Email
                const { data: club } = await supabaseAdmin.from('clubs').select('name').eq('id', clubId).single()
                
                try {
                    await resend.emails.send({
                        from: 'Suedtirol Booking <onboarding@resend.dev>',
                        to: [customerEmail],
                        subject: `Willkommen im ${club?.name || 'Verein'}!`,
                        react: <WelcomeMemberEmailTemplate 
                            clubName={club?.name || 'Verein'} 
                            email={customerEmail} 
                            password={tempPassword} 
                            loginUrl={`${process.env.NEXT_PUBLIC_BASE_URL}/login`}
                        />
                    })
                } catch (emailError) {
                    console.error("Fehler beim Senden der Willkommens-Mail:", emailError)
                }
            }
        }

        // Wenn wir jetzt eine UserID haben (neu oder existierend), tragen wir das Abo ein
        if (userId) {
            // Datum berechnen: Heute + 1 Jahr
            const validUntil = new Date()
            validUntil.setFullYear(validUntil.getFullYear() + 1)

            const { error } = await supabaseAdmin.from('club_members').upsert({
                user_id: userId,
                club_id: clubId,
                plan_id: planId,
                stripe_subscription_id: session.subscription,
                status: 'active',
                valid_until: validUntil.toISOString()
            }, { onConflict: 'club_id, user_id' })

            if(error) {
                console.error("DB Error Member Upsert:", error)
                return new NextResponse("DB Error", { status: 500 })
            }
        }
    }
  }

  // 2. ABO ERFOLGREICH VERLÄNGERT (Passiert automatisch nach einem Jahr)
  if (event.type === "invoice.payment_succeeded") {
      const subscriptionId = session.subscription
      
      const { data: member } = await supabaseAdmin
        .from('club_members')
        .select('*')
        .eq('stripe_subscription_id', subscriptionId)
        .single()

      if (member) {
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

  // 3. ZAHLUNG FEHLGESCHLAGEN
  if (event.type === "invoice.payment_failed") {
      const subscriptionId = session.subscription
      
      console.log(`❌ Abo Zahlung fehlgeschlagen für Subscription ${subscriptionId}`)

      await supabaseAdmin.from('club_members').update({
          status: 'expired' 
      }).eq('stripe_subscription_id', subscriptionId)
  }

  return new NextResponse(null, { status: 200 })
}