import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createClient } from "@supabase/supabase-js"
import { Resend } from 'resend'
import { WelcomeMemberEmailTemplate } from '@/components/emails/welcome-member-template'
import { BookingEmailTemplate } from '@/components/emails/booking-template'
import { format } from "date-fns"

const resend = new Resend(process.env.RESEND_API_KEY)

// Service Role Client für Admin-Rechte im Hintergrund
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
    console.error("❌ Webhook Signature Error:", error.message)
    return new NextResponse("Webhook Error: " + error.message, { status: 400 })
  }

  const session = event.data.object as any

  // 1. CHECKOUT SESSION COMPLETED (Zahlung erfolgreich)
  if (event.type === "checkout.session.completed") {
    
    // --- A) MITGLIEDSCHAFT (ABO) ---
    if (session.metadata?.type === 'membership_subscription') {
        let { userId, clubId, planId } = session.metadata
        const customerEmail = session.customer_details?.email

        let isNewUser = false
        let tempPassword = ""

        // FALL A: Gast-Bestellung (Kein Account) -> User erstellen
        if (!userId && customerEmail) {
            console.log(`👤 Erstelle neuen User für ${customerEmail}...`)
            
            tempPassword = Math.random().toString(36).slice(-8) + "Aa1!"
            isNewUser = true
            
            const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
                email: customerEmail,
                password: tempPassword,
                email_confirm: true,
                user_metadata: { 
                    must_change_password: true,
                    name: 'Neues Mitglied',
                    full_name: 'Neues Mitglied'
                }
            })

            if (createError) {
                // Prüfen ob User schon existiert
                const { data: listUsers } = await supabaseAdmin.auth.admin.listUsers()
                const found = listUsers.users.find(u => u.email === customerEmail)
                
                if (found) {
                    console.log("ℹ️ User existiert bereits, verknüpfe Abo.")
                    userId = found.id
                    isNewUser = false // Doch kein neuer User
                } else {
                    console.error("❌ User Creation Error:", createError)
                    return new NextResponse("User Creation Failed", { status: 500 })
                }
            } else {
                userId = newUser.user.id
            }
        }

        // FALL B: Abo in DB eintragen (Für neue UND bestehende User)
        if (userId) {
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
                console.error("❌ DB Error Member Upsert:", error)
                return new NextResponse("DB Error", { status: 500 })
            }

            // FALL C: E-Mail senden (Endlich für ALLE)
            const { data: club } = await supabaseAdmin.from('clubs').select('name').eq('id', clubId).single()
            const clubName = club?.name || 'Verein'

            try {
                if (isNewUser) {
                    // 1. Mail für NEUE User (mit Passwort)
                    await resend.emails.send({
                        from: 'Suedtirol Booking <onboarding@resend.dev>',
                        to: [customerEmail],
                        subject: `Willkommen im ${clubName}!`,
                        react: <WelcomeMemberEmailTemplate 
                            clubName={clubName} 
                            email={customerEmail} 
                            password={tempPassword} 
                            loginUrl={`${process.env.NEXT_PUBLIC_BASE_URL}/login`}
                        />
                    })
                    console.log("📧 Willkommens-Mail (neu) gesendet.")
                } else {
                    // 2. Mail für BESTEHENDE User (Bestätigung)
                    await resend.emails.send({
                        from: 'Suedtirol Booking <onboarding@resend.dev>',
                        to: [customerEmail],
                        subject: `Deine Mitgliedschaft im ${clubName} ist aktiv!`,
                        html: `
                          <h1>Hallo!</h1>
                          <p>Vielen Dank. Deine Mitgliedschaft im <strong>${clubName}</strong> wurde erfolgreich aktiviert bzw. verlängert.</p>
                          <p>Du kannst dich jetzt einloggen und Plätze buchen.</p>
                          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/login">Zum Login</a>
                        `
                    })
                    console.log("📧 Bestätigungs-Mail (bestand) gesendet.")
                }
            } catch (emailError) {
                console.error("❌ Fehler beim Senden der Mail:", emailError)
                // Wir werfen hier keinen 500er, damit der Webhook für Stripe trotzdem als "erfolgreich" gilt (DB Eintrag war ja ok)
            }
        }
    }

    // --- B) NEU: EINZELBUCHUNG (COURT BOOKING) ---
    // Wir erkennen das daran, dass 'courtId' in den Metadaten ist
    if (session.metadata?.courtId) {
        const { courtId, clubSlug, date, time, durationMinutes, creditCode, guestName, userId, bookingId } = session.metadata
        const amountTotal = session.amount_total ? session.amount_total / 100 : 0
        const customerEmail = session.customer_details?.email

        const { data: club } = await supabaseAdmin.from('clubs').select('id, admin_email').eq('slug', clubSlug).single()
        
        if (club && bookingId) {
            const [hours, minutes] = time.split(':').map(Number)
            const startTime = new Date(date)
            startTime.setHours(hours, minutes, 0, 0)
            const endTime = new Date(startTime.getTime() + parseInt(durationMinutes) * 60000)

            if (creditCode) {
                 const { data: current } = await supabaseAdmin
                   .from('credit_codes')
                   .select('usage_count, usage_limit')
                   .eq('code', creditCode.toUpperCase())
                   .eq('club_id', club.id)
                   .single()

                 if (current) {
                   const newCount = (current.usage_count || 0) + 1
                   const limit = current.usage_limit || 1
                   const isFullyRedeemed = newCount >= limit
                   await supabaseAdmin.from('credit_codes')
                     .update({ usage_count: newCount, is_redeemed: isFullyRedeemed })
                     .eq('code', creditCode.toUpperCase())
                     .eq('club_id', club.id)
                 }
            }

            await supabaseAdmin.from('bookings').update({
                status: 'confirmed',
                payment_status: 'paid_stripe',
                price_paid: amountTotal,
                start_time: startTime.toISOString(),
                end_time: endTime.toISOString(),
                guest_name: guestName || customerEmail || 'Gast (Stripe)',
                guest_email: customerEmail || null,
                user_id: userId || null
            }).eq('id', bookingId)
            
            console.log(`✅ Stripe Buchung aktualisiert: ${amountTotal}€ für ${time} Uhr`)

            // BUCHUNGSMAIL AN KUNDEN
            if (customerEmail) {
                try {
                    const orderId = "ORD-" + Math.floor(Math.random() * 100000)
                    await resend.emails.send({
                        from: 'Suedtirol Booking <onboarding@resend.dev>',
                        to: [customerEmail],
                        subject: `Deine Buchung am ${format(startTime, 'dd.MM.yyyy')} um ${time}`,
                        react: <BookingEmailTemplate
                            guestName={guestName || customerEmail || "Gast"}
                            courtName="Tennisplatz"
                            date={format(startTime, 'dd.MM.yyyy')}
                            time={time}
                            price={amountTotal}
                            orderId={orderId}
                        />,
                    })
                    console.log("📧 Buchungs-Mail (Stripe) gesendet.")
                } catch (emailError) {
                    console.error("❌ Buchungs-Mail Fehler:", emailError)
                }
            }
        } else if (club && courtId) {
            const [hours, minutes] = time.split(':').map(Number)
            const startTime = new Date(date)
            startTime.setHours(hours, minutes, 0, 0)
            const endTime = new Date(startTime.getTime() + parseInt(durationMinutes) * 60000)

            await supabaseAdmin.from('bookings').insert({
                court_id: courtId,
                club_id: club.id,
                start_time: startTime.toISOString(),
                end_time: endTime.toISOString(),
                status: 'confirmed',
                payment_status: 'paid_stripe',
                price_paid: amountTotal,
                guest_name: guestName || customerEmail || 'Gast (Stripe)',
                guest_email: customerEmail || null,
                user_id: userId || null
            })
        }
    }

    // --- A2) MITGLIEDSCHAFT (EINMALZAHLUNG) ---
    if (session.metadata?.type === 'membership_one_time') {
        const clubId = session.metadata?.clubId
        const userId = session.metadata?.userId
        if (clubId && userId) {
            const validUntil = new Date()
            validUntil.setFullYear(validUntil.getFullYear() + 1)

            await supabaseAdmin.from('club_members').upsert({
                user_id: userId,
                club_id: clubId,
                status: 'active',
                payment_status: 'paid',
                valid_until: validUntil.toISOString(),
                next_payment_at: validUntil.toISOString()
            }, { onConflict: 'club_id, user_id' })
        }
    }\r\n  }\r\n\r\n  // 2. ABO ERFOLGREICH VERLÄNGERT
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
          const baseDate = currentValid > now ? currentValid : now
          baseDate.setFullYear(baseDate.getFullYear() + 1)

          await supabaseAdmin.from('club_members').update({
              status: 'active',
              valid_until: baseDate.toISOString()
          }).eq('id', member.id)
          console.log("🔄 Abo Datenbank verlängert.")
      }
  }

  // 1b. CHECKOUT SESSION EXPIRED (Zahlung abgebrochen/timeout)
  if (event.type === "checkout.session.expired") {
      const expired = event.data.object as any
      const bookingId = expired.metadata?.bookingId
      if (bookingId) {
          await supabaseAdmin.from('bookings').delete().eq('id', bookingId)
          console.log(`🧹 Awaiting-Payment Buchung gelöscht: ${bookingId}`)
      }
  }

  // 3. ZAHLUNG FEHLGESCHLAGEN
  if (event.type === "invoice.payment_failed") {
      const subscriptionId = session.subscription
      console.log(`❌ Abo Zahlung fehlgeschlagen: ${subscriptionId}`)
      await supabaseAdmin.from('club_members').update({
          status: 'expired' 
      }).eq('stripe_subscription_id', subscriptionId)
  }

  return new NextResponse(null, { status: 200 })
}



