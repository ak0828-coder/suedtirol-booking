import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createClient } from "@supabase/supabase-js"
import { Resend } from 'resend'
import crypto from "crypto"
import { WelcomeMemberEmailTemplate } from '@/components/emails/welcome-member-template'
import { BookingEmailTemplate } from '@/components/emails/booking-template'
import { format } from "date-fns"

const resend = new Resend(process.env.RESEND_API_KEY)

// Service Role Client fÃ¼r Admin-Rechte im Hintergrund
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
    console.error("âŒ Webhook Signature Error:", error.message)
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
            console.log(`ðŸ‘¤ Erstelle neuen User fÃ¼r ${customerEmail}...`)
            
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
                // PrÃ¼fen ob User schon existiert
                const { data: listUsers } = await supabaseAdmin.auth.admin.listUsers()
                const found = listUsers.users.find(u => u.email === customerEmail)
                
                if (found) {
                    console.log("â„¹ï¸ User existiert bereits, verknÃ¼pfe Abo.")
                    userId = found.id
                    isNewUser = false // Doch kein neuer User
                } else {
                    console.error("âŒ User Creation Error:", createError)
                    return new NextResponse("User Creation Failed", { status: 500 })
                }
            } else {
                userId = newUser.user.id
            }
        }

        // FALL B: Abo in DB eintragen (FÃ¼r neue UND bestehende User)
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
                console.error("âŒ DB Error Member Upsert:", error)
                return new NextResponse("DB Error", { status: 500 })
            }

            // FALL C: E-Mail senden (Endlich fÃ¼r ALLE)
            const { data: club } = await supabaseAdmin.from('clubs').select('name').eq('id', clubId).single()
            const clubName = club?.name || 'Verein'

            try {
                if (isNewUser) {
                    // 1. Mail fÃ¼r NEUE User (mit Passwort)
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
                    console.log("ðŸ“§ Willkommens-Mail (neu) gesendet.")
                } else {
                    // 2. Mail fÃ¼r BESTEHENDE User (BestÃ¤tigung)
                    await resend.emails.send({
                        from: 'Suedtirol Booking <onboarding@resend.dev>',
                        to: [customerEmail],
                        subject: `Deine Mitgliedschaft im ${clubName} ist aktiv!`,
                        html: `
                          <h1>Hallo!</h1>
                          <p>Vielen Dank. Deine Mitgliedschaft im <strong>${clubName}</strong> wurde erfolgreich aktiviert bzw. verlÃ¤ngert.</p>
                          <p>Du kannst dich jetzt einloggen und PlÃ¤tze buchen.</p>
                          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/login">Zum Login</a>
                        `
                    })
                    console.log("ðŸ“§ BestÃ¤tigungs-Mail (bestand) gesendet.")
                }
            } catch (emailError) {
                console.error("âŒ Fehler beim Senden der Mail:", emailError)
                // Wir werfen hier keinen 500er, damit der Webhook fÃ¼r Stripe trotzdem als "erfolgreich" gilt (DB Eintrag war ja ok)
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
            
            console.log(`âœ… Stripe Buchung aktualisiert: ${amountTotal}â‚¬ fÃ¼r ${time} Uhr`)

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
                    console.log("ðŸ“§ Buchungs-Mail (Stripe) gesendet.")
                } catch (emailError) {
                    console.error("âŒ Buchungs-Mail Fehler:", emailError)
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

    // --- C) TRAINER SESSION ---
      if (session.metadata?.type === "trainer_session") {
          const bookingId = session.metadata?.bookingId
          const trainerId = session.metadata?.trainerId
          const clubSlug = session.metadata?.clubSlug
          const amountTotal = session.amount_total ? session.amount_total / 100 : 0
          const customerEmail = session.customer_details?.email
          const paymentIntentId = session.payment_intent

          if (bookingId) {
              const token = crypto.randomBytes(24).toString("hex")
              const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()

              await supabaseAdmin.from('bookings').update({
                  status: 'pending_trainer',
                  payment_status: 'authorized',
                  price_paid: amountTotal,
                  guest_email: customerEmail || null,
                  payment_intent_id: paymentIntentId || null,
                  trainer_action_token: token,
                  trainer_action_expires_at: expiresAt
              }).eq('id', bookingId)

              if (trainerId) {
                const { data: trainer } = await supabaseAdmin
                  .from('trainers')
                  .select('first_name, last_name, email')
                  .eq('id', trainerId)
                  .single()

                if (trainer?.email) {
                  const { data: bookingRow } = await supabaseAdmin
                    .from("bookings")
                    .select("start_time, end_time, courts(name)")
                    .eq("id", bookingId)
                    .single()
                  const startText = bookingRow?.start_time
                    ? new Date(bookingRow.start_time).toLocaleString("de-DE")
                    : ""
                  const courtName = bookingRow?.courts?.[0]?.name || "Platz"
                  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ""
                  const acceptUrl = `${baseUrl}/api/trainer/decision?token=${token}&action=accept`
                  const rejectUrl = `${baseUrl}/api/trainer/decision?token=${token}&action=reject`
                  try {
                    await resend.emails.send({
                      from: 'Avaimo <onboarding@resend.dev>',
                      to: [trainer.email],
                      subject: `Traineranfrage - ${clubSlug || ""}`,
                      html: `
                        <h2>Neue Traineranfrage</h2>
                        <p>Ein Mitglied moechte eine Trainerstunde buchen.</p>
                        <p><strong>Termin:</strong> ${startText} (${courtName})</p>
                        <p>Bitte bestaetigen oder ablehnen:</p>
                        <p>
                          <a href="${acceptUrl}" style="display:inline-block;margin-right:8px;padding:10px 16px;background:#0f172a;color:#fff;border-radius:20px;text-decoration:none;">Annehmen</a>
                          <a href="${rejectUrl}" style="display:inline-block;padding:10px 16px;background:#e2e8f0;color:#0f172a;border-radius:20px;text-decoration:none;">Ablehnen</a>
                        </p>
                        <p>Der Link ist 48 Stunden gueltig.</p>
                      `,
                    })
                  } catch (emailError) {
                    console.error("Trainer decision mail error:", emailError)
                  }
                }
              }
          }

          if (customerEmail) {
              try {
                  await resend.emails.send({
                      from: 'Suedtirol Booking <onboarding@resend.dev>',
                      to: [customerEmail],
                      subject: `Traineranfrage erhalten`,
                      html: `
                      <h2>Deine Traineranfrage ist eingegangen</h2>
                      <p>Wir haben deine Zahlung vorautorisiert, aber noch nicht abgebucht.</p>
                      <p>Der Trainer hat bis zu <strong>48 Stunden</strong>, um die Stunde zu bestaetigen.</p>
                      <p>Sobald bestaetigt, wird die Zahlung automatisch abgeschlossen. Bei Ablehnung wird die Autorisierung aufgehoben.</p>
                    `,
                })
            } catch (emailError) {
                console.error("Trainer Pending Mail Fehler:", emailError)
            }
        }

        if (trainerId) {
            const { data: trainer } = await supabaseAdmin
              .from('trainers')
              .select('*')
              .eq('id', trainerId)
              .single()

            if (trainer) {
              let trainerEarnings = 0
              if (trainer.salary_type === 'commission') {
                trainerEarnings = amountTotal * (Number(trainer.default_rate || 0) / 100)
              } else if (trainer.salary_type === 'hourly') {
                trainerEarnings = Number(trainer.default_rate || 0)
              } else {
                trainerEarnings = 0
              }

              if (trainerEarnings > 0) {
                if (trainer.payout_method !== 'stripe_connect') {
                  await supabaseAdmin.from('trainer_payouts').insert({
                    trainer_id: trainer.id,
                    booking_id: bookingId || null,
                    amount: trainerEarnings,
                    status: 'pending'
                  })
                }
              }
            }
        }
    }

    // --- D) COURSE ENROLLMENT ---
      if (session.metadata?.type === "course_enrollment") {
          const participantId = session.metadata?.participantId
          const courseId = session.metadata?.courseId
          const userId = session.metadata?.userId
          const pricingMode = session.metadata?.pricingMode || "full_course"
          const bookingIdsRaw = session.metadata?.bookingIds || ""
          const sessionIdsRaw = session.metadata?.sessionIds || ""
          const amountTotal = session.amount_total ? session.amount_total / 100 : 0
          const customerEmail = session.customer_details?.email

          if (pricingMode === "per_session") {
              const bookingIds = bookingIdsRaw.split(",").filter(Boolean)
              if (bookingIds.length > 0) {
                  await supabaseAdmin.from('bookings')
                    .update({ status: 'confirmed', payment_status: 'paid_stripe', payment_intent_id: session.payment_intent || null })
                    .in('id', bookingIds)
              }
              if (courseId && userId) {
                  await supabaseAdmin.from('course_participants')
                    .update({ payment_status: 'paid_stripe' })
                    .eq('course_id', courseId)
                    .eq('user_id', userId)
              }
          } else if (participantId) {
              await supabaseAdmin.from('course_participants')
                .update({ payment_status: 'paid_stripe' })
                .eq('id', participantId)
          }

          if (courseId) {
              const { data: course } = await supabaseAdmin
                .from('courses')
                .select('id, trainer_id, price, title')
                .eq('id', courseId)
                .single()

              if (course?.trainer_id) {
              const { data: trainer } = await supabaseAdmin
                .from('trainers')
                .select('*')
                .eq('id', course.trainer_id)
                .single()

              if (trainer) {
                let trainerEarnings = 0
                if (trainer.salary_type === 'commission') {
                  trainerEarnings = amountTotal * (Number(trainer.default_rate || 0) / 100)
                } else if (trainer.salary_type === 'hourly') {
                  trainerEarnings = Number(trainer.default_rate || 0)
                }

                  if (trainerEarnings > 0) {
                    const payoutStatus = trainer.payout_method === 'stripe_connect' ? 'paid' : 'pending'
                    await supabaseAdmin.from('trainer_payouts').insert({
                      trainer_id: trainer.id,
                      course_id: course.id,
                      amount: trainerEarnings,
                      status: payoutStatus,
                      payout_date: payoutStatus === 'paid' ? new Date().toISOString() : null
                    })
                  }
                }
              }

              if (customerEmail) {
                let sessionsHtml = ""
                if (pricingMode === "per_session" && sessionIdsRaw) {
                  const ids = sessionIdsRaw.split(",").filter(Boolean)
                  const { data: sessionRows } = await supabaseAdmin
                    .from("course_sessions")
                    .select("start_time, end_time")
                    .in("id", ids)
                  if (sessionRows && sessionRows.length > 0) {
                    sessionsHtml = sessionRows
                      .map((s: any) => new Date(s.start_time).toLocaleString("de-DE"))
                      .join("<br/>")
                  }
                }
                try {
                  await resend.emails.send({
                    from: 'Avaimo <onboarding@resend.dev>',
                    to: [customerEmail],
                    subject: `Kurs bestaetigt - ${course?.title || "Kurs"}`,
                    html: `
                      <h2>Deine Kursanmeldung ist bestaetigt</h2>
                      <p>Du bist fuer den Kurs <strong>${course?.title || "Kurs"}</strong> angemeldet.</p>
                      ${sessionsHtml ? `<p><strong>Termine:</strong><br/>${sessionsHtml}</p>` : ""}
                      <p>Zahlung: ${amountTotal} EUR</p>
                    `,
                  })
                } catch (emailError) {
                  console.error("Course mail error:", emailError)
                }
              }
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
    }
  }

  // 2. ABO ERFOLGREICH VERLÃ„NGERT
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
          console.log("ðŸ”„ Abo Datenbank verlÃ¤ngert.")
      }
  }

  // 1b. CHECKOUT SESSION EXPIRED (Zahlung abgebrochen/timeout)
  if (event.type === "checkout.session.expired") {
      const expired = event.data.object as any
      const bookingId = expired.metadata?.bookingId
      const bookingIds = String(expired.metadata?.bookingIds || "")
        .split(",")
        .filter(Boolean)
      if (bookingId) {
          await supabaseAdmin.from('bookings').delete().eq('id', bookingId)
          console.log(`ðŸ§¹ Awaiting-Payment Buchung gelÃ¶scht: ${bookingId}`)
      }
      if (bookingIds.length > 0) {
          await supabaseAdmin.from('bookings').delete().in('id', bookingIds)
          console.log(`ðŸ§¹ Awaiting-Payment Buchungen geloescht: ${bookingIds.join(",")}`)
      }
  }

  // 3. ZAHLUNG FEHLGESCHLAGEN
  if (event.type === "invoice.payment_failed") {
      const subscriptionId = session.subscription
      console.log(`âŒ Abo Zahlung fehlgeschlagen: ${subscriptionId}`)
      await supabaseAdmin.from('club_members').update({
          status: 'expired' 
      }).eq('stripe_subscription_id', subscriptionId)
  }

  return new NextResponse(null, { status: 200 })
}















