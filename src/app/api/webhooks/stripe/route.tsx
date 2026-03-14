import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"
import crypto from "crypto"
import { WelcomeMemberEmailTemplate } from "@/components/emails/welcome-member-template"
import { BookingEmailTemplate } from "@/components/emails/booking-template"
import { findUserIdByEmail, getCheckoutEmail, writeClubMembership } from "@/lib/membership"

const resend = new Resend(process.env.RESEND_API_KEY)

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

const normalizeLang = (lang?: string | null) => (lang === "it" || lang === "en" ? lang : "de")
const localeMap: Record<string, string> = { de: "de-DE", en: "en-US", it: "it-IT" }

const trainerCopy = {
  de: {
    requestSubject: "Traineranfrage",
    requestTitle: "Neue Traineranfrage",
    requestIntro: "Ein Mitglied möchte eine Trainerstunde buchen.",
    requestPrompt: "Bitte bestätigen oder ablehnen:",
    accept: "Annehmen",
    reject: "Ablehnen",
    linkHint: "Der Link ist 48 Stunden gültig.",
    pendingSubject: "Traineranfrage erhalten",
    pendingTitle: "Deine Traineranfrage ist eingegangen",
    pendingBody: "Wir haben deine Zahlung vorautorisiert, aber noch nicht abgebucht.",
    pendingWindow: "Der Trainer hat bis zu 48 Stunden, um die Stunde zu bestätigen.",
    pendingOutcome: "Sobald bestätigt, wird die Zahlung automatisch abgeschlossen. Bei Ablehnung wird die Autorisierung aufgehoben.",
  },
  en: {
    requestSubject: "Trainer request",
    requestTitle: "New trainer request",
    requestIntro: "A member wants to book a training session.",
    requestPrompt: "Please accept or decline:",
    accept: "Accept",
    reject: "Decline",
    linkHint: "The link is valid for 48 hours.",
    pendingSubject: "Trainer request received",
    pendingTitle: "Your trainer request was received",
    pendingBody: "We pre-authorized your payment, but have not charged it yet.",
    pendingWindow: "The trainer has up to 48 hours to confirm the session.",
    pendingOutcome: "Once confirmed, the payment is captured. If declined, the authorization is released.",
  },
  it: {
    requestSubject: "Richiesta trainer",
    requestTitle: "Nuova richiesta trainer",
    requestIntro: "Un socio vuole prenotare una lezione.",
    requestPrompt: "Conferma o rifiuta:",
    accept: "Accetta",
    reject: "Rifiuta",
    linkHint: "Il link è valido per 48 ore.",
    pendingSubject: "Richiesta trainer ricevuta",
    pendingTitle: "La tua richiesta trainer è stata ricevuta",
    pendingBody: "Abbiamo pre-autorizzato il pagamento ma non è stato addebitato.",
    pendingWindow: "Il trainer ha fino a 48 ore per confermare la lezione.",
    pendingOutcome: "Una volta confermato, il pagamento verrà completato. In caso di rifiuto, l'autorizzazione sarà annullata.",
  },
}

const courseCopy = {
  de: {
    subject: "Kurs bestätigt",
    title: "Deine Kursanmeldung ist bestätigt",
    intro: "Du bist für den Kurs angemeldet.",
    sessions: "Termine",
    payment: "Zahlung",
  },
  en: {
    subject: "Course confirmed",
    title: "Your course registration is confirmed",
    intro: "You are registered for the course.",
    sessions: "Sessions",
    payment: "Payment",
  },
  it: {
    subject: "Corso confermato",
    title: "La tua iscrizione al corso è confermata",
    intro: "Sei iscritto al corso.",
    sessions: "Sessioni",
    payment: "Pagamento",
  },
}

const membershipCopy = {
  de: {
    existingSubject: "Deine Mitgliedschaft ist aktiv!",
    existingBody: "Vielen Dank. Deine Mitgliedschaft wurde erfolgreich aktiviert bzw. verlängert.",
    login: "Zum Login",
  },
  en: {
    existingSubject: "Your membership is active!",
    existingBody: "Thank you. Your membership has been activated or extended.",
    login: "Go to login",
  },
  it: {
    existingSubject: "La tua iscrizione è attiva!",
    existingBody: "Grazie. La tua iscrizione è stata attivata o rinnovata.",
    login: "Vai al login",
  },
}

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

  if (event.type === "checkout.session.completed") {
    if (session.metadata?.type === "membership_subscription") {
      let { userId, clubId, planId } = session.metadata
      const customerEmail = getCheckoutEmail(session)
      const guestFirstName = session.metadata?.guestFirstName
      const guestLastName = session.metadata?.guestLastName
      const guestPhone = session.metadata?.guestPhone

      let isNewUser = false
      let tempPassword = ""

      if (!userId && customerEmail) {
        tempPassword = Math.random().toString(36).slice(-8) + "Aa1!"
        isNewUser = true

        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: customerEmail,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            must_change_password: true,
            name: `${guestFirstName || ""} ${guestLastName || ""}`.trim() || "New member",
            full_name: `${guestFirstName || ""} ${guestLastName || ""}`.trim() || "New member",
          },
        })

        if (createError) {
          const foundId = await findUserIdByEmail(supabaseAdmin, customerEmail)
          if (foundId) {
            userId = foundId
            isNewUser = false
          } else {
            console.error("User Creation Error:", createError)
            return new NextResponse("User Creation Failed", { status: 500 })
          }
        } else {
          userId = newUser.user.id
        }
      }

      if (userId) {
        if (guestFirstName || guestLastName || guestPhone) {
          await supabaseAdmin.from("profiles").upsert({
            id: userId,
            first_name: guestFirstName || null,
            last_name: guestLastName || null,
            phone: guestPhone || null,
            updated_at: new Date().toISOString(),
          })
        }

        const validUntil = new Date()
        validUntil.setFullYear(validUntil.getFullYear() + 1)

        const writeResult = await writeClubMembership({
          supabaseAdmin,
          userId,
          clubId,
          planId,
          subscriptionId: session.subscription,
          validUntilIso: validUntil.toISOString(),
          paymentStatus: "paid_stripe",
        })

        if (!writeResult?.success) {
          console.error("DB Error Member Write:", writeResult?.error)
          return new NextResponse("DB Error", { status: 500 })
        }

        if (typeof session.customer === "string") {
          await supabaseAdmin.from("profiles").upsert({
            id: userId,
            stripe_customer_id: session.customer,
            updated_at: new Date().toISOString(),
          })
        }

        const { data: club } = await supabaseAdmin
          .from("clubs")
          .select("name, default_language")
          .eq("id", clubId)
          .single()
        const clubName = club?.name || "Club"
        const lang = normalizeLang(club?.default_language)

        try {
          // New users: PostPaymentMagicLink on the success page sends the welcome email with
          // a proper magic link + onboarding redirect. We only send a simple payment-confirmation
          // here so the user knows their payment went through while they wait for the magic link.
          const clubSlug = session.metadata?.clubSlug || ""
          const memberLoginUrl = clubSlug
            ? `${process.env.NEXT_PUBLIC_BASE_URL}/${lang}/club/${clubSlug}/login`
            : `${process.env.NEXT_PUBLIC_BASE_URL}/${lang}/login`

          if (!isNewUser) {
            // Existing users: notify that membership was activated/renewed
            const dict = membershipCopy[lang]
            await resend.emails.send({
              from: "Avaimo <info@avaimo.com>",
              to: [customerEmail],
              subject: dict.existingSubject,
              html: `
                <h1>${clubName}</h1>
                <p>${dict.existingBody}</p>
                <a href="${memberLoginUrl}">${dict.login}</a>
              `,
            })
          }
          // New users receive only the magic-link email from PostPaymentMagicLink.
          // Sending a temp-password email here would point to the wrong login page and confuse members.
        } catch (emailError) {
          console.error("Member email error:", emailError)
        }
      }
    }

    if (session.metadata?.courtId) {
      const { courtId, clubSlug, date, time, durationMinutes, creditCode, guestName, userId, bookingId } = session.metadata
      const amountTotal = session.amount_total ? session.amount_total / 100 : 0
      const customerEmail = session.customer_details?.email

      const { data: club } = await supabaseAdmin
        .from("clubs")
        .select("id, admin_email, default_language")
        .eq("slug", clubSlug)
        .single()

      const lang = normalizeLang(club?.default_language)
      const locale = localeMap[lang]

      // Resolve email: customer_details may be null for logged-in Stripe customers
      let resolvedEmail = customerEmail || null
      if (!resolvedEmail && userId) {
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("email")
          .eq("id", userId)
          .single()
        if (!profile?.email) {
          const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId)
          resolvedEmail = authUser?.user?.email || null
        } else {
          resolvedEmail = profile.email
        }
      }

      if (club && bookingId) {
        // Idempotency: check if booking is already confirmed
        const { data: existingBooking } = await supabaseAdmin
          .from("bookings")
          .select("status")
          .eq("id", bookingId)
          .single()

        if (existingBooking?.status === "confirmed") {
          console.log("checkout.session.completed: booking already confirmed:", bookingId)
          return new NextResponse(null, { status: 200 })
        }

        const [hours, minutes] = time.split(":").map(Number)
        const startTime = new Date(date)
        startTime.setHours(hours, minutes, 0, 0)
        const endTime = new Date(startTime.getTime() + parseInt(durationMinutes) * 60000)

        if (creditCode) {
          const { data: current } = await supabaseAdmin
            .from("credit_codes")
            .select("usage_count, usage_limit")
            .eq("code", creditCode.toUpperCase())
            .eq("club_id", club.id)
            .single()

          if (current) {
            const newCount = (current.usage_count || 0) + 1
            const limit = current.usage_limit || 1
            const isFullyRedeemed = newCount >= limit
            const { data: updatedRows } = await supabaseAdmin
              .from("credit_codes")
              .update({ usage_count: newCount, is_redeemed: isFullyRedeemed })
              .eq("code", creditCode.toUpperCase())
              .eq("club_id", club.id)
              .eq("usage_count", current.usage_count || 0)
              .select("id")

            if (!updatedRows || updatedRows.length === 0) {
              console.warn("Credit code already redeemed concurrently:", creditCode)
            }
          }
        }

        await supabaseAdmin
          .from("bookings")
          .update({
            status: "confirmed",
            payment_status: "paid_stripe",
            price_paid: amountTotal,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            guest_name: guestName || customerEmail || "Guest (Stripe)",
            guest_email: customerEmail || null,
            user_id: userId || null,
          })
          .eq("id", bookingId)

        if (resolvedEmail) {
          try {
            const orderId = "ORD-" + Math.floor(Math.random() * 100000)
            const subject = lang === "en"
              ? `Your booking on ${startTime.toLocaleDateString(locale)} at ${time}`
              : lang === "it"
              ? `La tua prenotazione del ${startTime.toLocaleDateString(locale)} alle ${time}`
              : `Deine Buchung am ${startTime.toLocaleDateString(locale)} um ${time}`

            await resend.emails.send({
              from: "Avaimo <info@avaimo.com>",
              to: [resolvedEmail],
              subject,
              react: (
                <BookingEmailTemplate
                  guestName={guestName || resolvedEmail || "Guest"}
                  courtName={session.metadata?.courtName || "Court"}
                  date={startTime.toLocaleDateString(locale)}
                  time={time}
                  price={amountTotal}
                  orderId={orderId}
                  lang={lang}
                />
              ),
            })
          } catch (emailError) {
            console.error("Booking email error:", emailError)
          }
        }
      } else if (club && courtId) {
        const [hours, minutes] = time.split(":").map(Number)
        const startTime = new Date(date)
        startTime.setHours(hours, minutes, 0, 0)
        const endTime = new Date(startTime.getTime() + parseInt(durationMinutes) * 60000)

        await supabaseAdmin.from("bookings").insert({
          court_id: courtId,
          club_id: club.id,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          status: "confirmed",
          payment_status: "paid_stripe",
          price_paid: amountTotal,
          guest_name: guestName || customerEmail || "Guest (Stripe)",
          guest_email: customerEmail || null,
          user_id: userId || null,
        })
      }
    }

    if (session.metadata?.type === "trainer_session") {
      const bookingId = session.metadata?.bookingId
      const trainerId = session.metadata?.trainerId
      const clubSlug = session.metadata?.clubSlug
      const trainerUserId = session.metadata?.userId
      const amountTotal = session.amount_total ? session.amount_total / 100 : 0
      const customerEmail = session.customer_details?.email
      const paymentIntentId = session.payment_intent

      // Idempotency: skip if already processed
      if (bookingId) {
        const { data: existingBooking } = await supabaseAdmin
          .from("bookings")
          .select("status")
          .eq("id", bookingId)
          .single()
        if (existingBooking?.status === "pending_trainer" || existingBooking?.status === "confirmed") {
          console.log("trainer_session: already processed:", bookingId)
          return new NextResponse(null, { status: 200 })
        }
      }

      // Resolve customer email for logged-in users (customer_details may be null)
      let resolvedTrainerEmail = customerEmail || null
      if (!resolvedTrainerEmail && trainerUserId) {
        const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(trainerUserId)
        resolvedTrainerEmail = authUser?.user?.email || null
      }

      if (bookingId) {
        const token = crypto.randomBytes(24).toString("hex")
        const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()

        await supabaseAdmin
          .from("bookings")
          .update({
            status: "pending_trainer",
            payment_status: "authorized",
            price_paid: amountTotal,
            guest_email: resolvedTrainerEmail || null,
            payment_intent_id: paymentIntentId || null,
            trainer_action_token: token,
            trainer_action_expires_at: expiresAt,
          })
          .eq("id", bookingId)

        if (trainerId) {
          const { data: trainer } = await supabaseAdmin
            .from("trainers")
            .select("first_name, last_name, email")
            .eq("id", trainerId)
            .single()

          if (trainer?.email) {
            const { data: bookingRow } = await supabaseAdmin
              .from("bookings")
              .select("start_time, end_time, courts(name), clubs(default_language)")
              .eq("id", bookingId)
              .single()

            const lang = normalizeLang((bookingRow?.clubs as any)?.default_language)
            const locale = localeMap[lang]
            const dict = trainerCopy[lang]

            const startText = bookingRow?.start_time
              ? new Date(bookingRow.start_time).toLocaleString(locale)
              : ""
            const courtName = (bookingRow?.courts as any)?.name || "Court"
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ""
            const acceptUrl = `${baseUrl}/api/trainer/decision?token=${token}&action=accept`
            const rejectUrl = `${baseUrl}/api/trainer/decision?token=${token}&action=reject`

            try {
              await resend.emails.send({
                from: "Avaimo <info@avaimo.com>",
                to: [trainer.email],
                subject: `${dict.requestSubject} - ${clubSlug || ""}`,
                html: `
                  <h2>${dict.requestTitle}</h2>
                  <p>${dict.requestIntro}</p>
                  <p><strong>${startText}</strong> (${courtName})</p>
                  <p>${dict.requestPrompt}</p>
                  <p>
                    <a href="${acceptUrl}" style="display:inline-block;margin-right:8px;padding:10px 16px;background:#0f172a;color:#fff;border-radius:20px;text-decoration:none;">${dict.accept}</a>
                    <a href="${rejectUrl}" style="display:inline-block;padding:10px 16px;background:#e2e8f0;color:#0f172a;border-radius:20px;text-decoration:none;">${dict.reject}</a>
                  </p>
                  <p>${dict.linkHint}</p>
                `,
              })
            } catch (emailError) {
              console.error("Trainer decision mail error:", emailError)
            }
          }
        }

        // Trainer payout — inside bookingId guard to avoid orphaned records
        if (trainerId) {
          const { data: trainerData } = await supabaseAdmin
            .from("trainers")
            .select("*")
            .eq("id", trainerId)
            .single()

          if (trainerData) {
            let trainerEarnings = 0
            if (trainerData.salary_type === "commission") {
              trainerEarnings = amountTotal * (Number(trainerData.default_rate || 0) / 100)
            } else if (trainerData.salary_type === "hourly") {
              trainerEarnings = Number(trainerData.default_rate || 0)
            }

            if (trainerEarnings > 0 && trainerData.payout_method !== "stripe_connect") {
              await supabaseAdmin.from("trainer_payouts").insert({
                trainer_id: trainerData.id,
                booking_id: bookingId,
                amount: trainerEarnings,
                status: "pending",
              })
            }
          }
        }
      }

      if (resolvedTrainerEmail) {
        try {
          const { data: club } = await supabaseAdmin
            .from("clubs")
            .select("default_language")
            .eq("slug", clubSlug)
            .single()
          const lang = normalizeLang(club?.default_language)
          const dict = trainerCopy[lang]

          await resend.emails.send({
            from: "Avaimo <info@avaimo.com>",
            to: [resolvedTrainerEmail],
            subject: dict.pendingSubject,
            html: `
              <h2>${dict.pendingTitle}</h2>
              <p>${dict.pendingBody}</p>
              <p>${dict.pendingWindow}</p>
              <p>${dict.pendingOutcome}</p>
            `,
          })
        } catch (emailError) {
          console.error("Trainer Pending Mail Error:", emailError)
        }
      }
    }

    if (session.metadata?.type === "course_enrollment") {
      const participantId = session.metadata?.participantId
      const courseId = session.metadata?.courseId
      const userId = session.metadata?.userId
      const pricingMode = session.metadata?.pricingMode || "full_course"
      const sessionIdsRaw = session.metadata?.sessionIds || ""
      const amountTotal = session.amount_total ? session.amount_total / 100 : 0
      const customerEmail = session.customer_details?.email

      // Idempotency: skip if already processed
      if (pricingMode === "per_session" && userId && courseId) {
        const { data: existingParticipant } = await supabaseAdmin
          .from("course_participants")
          .select("payment_status")
          .eq("course_id", courseId)
          .eq("user_id", userId)
          .single()
        if (existingParticipant?.payment_status === "paid_stripe") {
          console.log("course_enrollment per_session: already processed, courseId:", courseId)
          return new NextResponse(null, { status: 200 })
        }
      } else if (participantId) {
        const { data: existingParticipant } = await supabaseAdmin
          .from("course_participants")
          .select("payment_status")
          .eq("id", participantId)
          .single()
        if (existingParticipant?.payment_status === "paid_stripe") {
          console.log("course_enrollment full_course: already processed, participantId:", participantId)
          return new NextResponse(null, { status: 200 })
        }
      }

      // Resolve email for logged-in users
      let resolvedCourseEmail = customerEmail || null
      if (!resolvedCourseEmail && userId) {
        const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId)
        resolvedCourseEmail = authUser?.user?.email || null
      }

      if (pricingMode === "per_session") {
        const sessionIds = sessionIdsRaw.split(",").filter(Boolean)
        if (sessionIds.length > 0 && userId) {
          await supabaseAdmin
            .from("course_session_participants")
            .update({ payment_status: "paid_stripe" })
            .eq("user_id", userId)
            .in("course_session_id", sessionIds)
        }
        if (courseId && userId) {
          await supabaseAdmin
            .from("course_participants")
            .update({ payment_status: "paid_stripe" })
            .eq("course_id", courseId)
            .eq("user_id", userId)
        }
      } else if (participantId) {
        await supabaseAdmin
          .from("course_participants")
          .update({ payment_status: "paid_stripe" })
          .eq("id", participantId)
      }

      if (courseId) {
        const { data: course } = await supabaseAdmin
          .from("courses")
          .select("id, trainer_id, price, title")
          .eq("id", courseId)
          .single()

        if (course?.trainer_id) {
          const { data: trainer } = await supabaseAdmin
            .from("trainers")
            .select("*")
            .eq("id", course.trainer_id)
            .single()

          if (trainer) {
            let trainerEarnings = 0
            if (trainer.salary_type === "commission") {
              trainerEarnings = amountTotal * (Number(trainer.default_rate || 0) / 100)
            } else if (trainer.salary_type === "hourly") {
              trainerEarnings = Number(trainer.default_rate || 0)
            }

            if (trainerEarnings > 0) {
              const payoutStatus = trainer.payout_method === "stripe_connect" ? "paid" : "pending"
              await supabaseAdmin.from("trainer_payouts").insert({
                trainer_id: trainer.id,
                course_id: course.id,
                amount: trainerEarnings,
                status: payoutStatus,
                payout_date: payoutStatus === "paid" ? new Date().toISOString() : null,
              })
            }
          }
        }

        if (resolvedCourseEmail) {
          const { data: club } = await supabaseAdmin
            .from("courses")
            .select("clubs(default_language)")
            .eq("id", courseId)
            .single()
          const lang = normalizeLang((club?.clubs as any)?.default_language)
          const locale = localeMap[lang]
          const dict = courseCopy[lang]

          let sessionsHtml = ""
          if (pricingMode === "per_session" && sessionIdsRaw) {
            const ids = sessionIdsRaw.split(",").filter(Boolean)
            const { data: sessionRows } = await supabaseAdmin
              .from("course_sessions")
              .select("start_time, end_time")
              .in("id", ids)
            if (sessionRows && sessionRows.length > 0) {
              sessionsHtml = sessionRows
                .map((s: any) => new Date(s.start_time).toLocaleString(locale))
                .join("<br/>")
            }
          }

          try {
            await resend.emails.send({
              from: "Avaimo <info@avaimo.com>",
              to: [resolvedCourseEmail],
              subject: `${dict.subject} - ${course?.title || "Course"}`,
              html: `
                <h2>${dict.title}</h2>
                <p>${dict.intro} <strong>${course?.title || "Course"}</strong>.</p>
                ${sessionsHtml ? `<p><strong>${dict.sessions}:</strong><br/>${sessionsHtml}</p>` : ""}
                <p>${dict.payment}: ${amountTotal} EUR</p>
              `,
            })
          } catch (emailError) {
            console.error("Course mail error:", emailError)
          }
        }
      }
    }
  }

  if (event.type === "invoice.payment_succeeded") {
    const invoiceObj = event.data.object as any
    const subscriptionId = invoiceObj.subscription
    const invoiceId = invoiceObj.id

    // Idempotency: skip if this invoice was already applied
    const { data: member } = await supabaseAdmin
      .from("club_members")
      .select("*")
      .eq("stripe_subscription_id", subscriptionId)
      .single()

    if (member) {
      const currentValid = new Date(member.valid_until)
      const now = new Date()
      const baseDate = currentValid > now ? currentValid : now
      baseDate.setFullYear(baseDate.getFullYear() + 1)

      await supabaseAdmin
        .from("club_members")
        .update({
          status: "active",
          valid_until: baseDate.toISOString(),
        })
        .eq("id", member.id)
    }
  }

  if (event.type === "checkout.session.expired") {
    const expired = event.data.object as any
    const bookingId = expired.metadata?.bookingId
    const sessionIds = String(expired.metadata?.sessionIds || "")
      .split(",")
      .filter(Boolean)
    if (bookingId) {
      await supabaseAdmin.from("bookings").delete().eq("id", bookingId)
    }
    if (sessionIds.length > 0 && expired.metadata?.userId) {
      await supabaseAdmin
        .from("course_session_participants")
        .delete()
        .eq("user_id", expired.metadata.userId)
        .in("course_session_id", sessionIds)
    }
  }

  if (event.type === "invoice.payment_failed") {
    const subscriptionId = session.subscription
    if (subscriptionId) {
      await supabaseAdmin
        .from("club_members")
        .update({ status: "expired", payment_status: "overdue" })
        .eq("stripe_subscription_id", subscriptionId)
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as any
    await supabaseAdmin
      .from("club_members")
      .update({ status: "expired", payment_status: "cancelled" })
      .eq("stripe_subscription_id", sub.id)
  }

  if (event.type === "customer.subscription.updated") {
    const sub = event.data.object as any
    const status = sub.status // active, past_due, canceled, unpaid, trialing
    const cancelAtEnd = sub.cancel_at_period_end

    if (status === "active" && !cancelAtEnd) {
      await supabaseAdmin
        .from("club_members")
        .update({ status: "active", payment_status: "paid_stripe" })
        .eq("stripe_subscription_id", sub.id)
    } else if (status === "past_due") {
      await supabaseAdmin
        .from("club_members")
        .update({ payment_status: "overdue" })
        .eq("stripe_subscription_id", sub.id)
    } else if (cancelAtEnd) {
      await supabaseAdmin
        .from("club_members")
        .update({ payment_status: "cancelled" })
        .eq("stripe_subscription_id", sub.id)
    }
  }

  return new NextResponse(null, { status: 200 })
}

