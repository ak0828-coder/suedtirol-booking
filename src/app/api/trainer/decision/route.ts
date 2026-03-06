import { NextResponse } from "next/server"
import { Resend } from "resend"
import Stripe from "stripe"
import { getAdminClient } from "@/lib/supabase/admin"

const resend = new Resend(process.env.RESEND_API_KEY)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2024-12-18.acacia" as any })

export const runtime = "nodejs"

const normalizeLang = (lang?: string | null) => (lang === "it" || lang === "en" ? lang : "de")

const copy = {
  de: {
    invalid: "Ungültiger Link",
    missing: "Anfrage nicht gefunden",
    expired: "Link ist abgelaufen",
    inactive: "Anfrage ist nicht mehr aktiv",
    confirmed: "Trainerstunde bestätigt",
    confirmedBody: "Der Trainer hat die Stunde bestätigt. Die Zahlung wurde abgeschlossen.",
    rejected: "Trainerstunde abgelehnt",
    rejectedBody: "Der Trainer konnte die Stunde leider nicht annehmen. Es wurde nichts belastet.",
  },
  en: {
    invalid: "Invalid link",
    missing: "Request not found",
    expired: "Link has expired",
    inactive: "Request is no longer active",
    confirmed: "Training session confirmed",
    confirmedBody: "The trainer confirmed the session. The payment was captured.",
    rejected: "Training session declined",
    rejectedBody: "The trainer declined the session. No charge was made.",
  },
  it: {
    invalid: "Link non valido",
    missing: "Richiesta non trovata",
    expired: "Link scaduto",
    inactive: "Richiesta non più attiva",
    confirmed: "Lezione confermata",
    confirmedBody: "Il trainer ha confermato la lezione. Il pagamento è stato completato.",
    rejected: "Lezione rifiutata",
    rejectedBody: "Il trainer non ha potuto accettare la lezione. Nessun addebito effettuato.",
  },
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get("token") || ""
  const action = searchParams.get("action") || ""

  if (!token || !["accept", "reject"].includes(action)) {
    // Language not yet known — return HTML so trainers see a readable page
    return new NextResponse(
      `<html><body style="font-family:sans-serif;max-width:520px;margin:40px auto;padding:20px"><h2>Invalid link · Ungültiger Link · Link non valido</h2><p>This link is invalid or incomplete.</p></body></html>`,
      { status: 400, headers: { "Content-Type": "text/html" } }
    )
  }

  const supabaseAdmin = getAdminClient()
  const { data: booking } = await supabaseAdmin
    .from("bookings")
    .select("id, club_id, payment_intent_id, guest_email, status, trainer_action_expires_at, clubs(slug, name, default_language)")
    .eq("trainer_action_token", token)
    .single()

  if (!booking) {
    return new NextResponse(
      `<html><body style="font-family:sans-serif;max-width:520px;margin:40px auto;padding:20px"><h2>Request not found · Anfrage nicht gefunden · Richiesta non trovata</h2><p>This link may have already been used or has expired.</p></body></html>`,
      { status: 404, headers: { "Content-Type": "text/html" } }
    )
  }

  const lang = normalizeLang(booking.clubs?.[0]?.default_language)
  const dict = copy[lang]

  const expiresAt = booking.trainer_action_expires_at
  if (expiresAt && new Date(expiresAt).getTime() < Date.now()) {
    return new NextResponse(
      `<html><body style="font-family:sans-serif;max-width:520px;margin:40px auto;padding:20px;text-align:center"><div style="padding:32px;border-radius:16px;background:#fffbeb;border:1px solid #fde68a"><h2 style="color:#92400e;margin:0 0 12px">${dict.expired}</h2></div></body></html>`,
      { status: 410, headers: { "Content-Type": "text/html" } }
    )
  }

  if (booking.status !== "pending_trainer") {
    return new NextResponse(
      `<html><body style="font-family:sans-serif;max-width:520px;margin:40px auto;padding:20px;text-align:center"><div style="padding:32px;border-radius:16px;background:#f8fafc;border:1px solid #e2e8f0"><h2 style="color:#475569;margin:0 0 12px">${dict.inactive}</h2></div></body></html>`,
      { status: 409, headers: { "Content-Type": "text/html" } }
    )
  }

  if (action === "accept") {
    if (booking.payment_intent_id) {
      await stripe.paymentIntents.capture(booking.payment_intent_id)
    }

    await supabaseAdmin
      .from("bookings")
      .update({
        status: "confirmed",
        payment_status: "paid_stripe",
        trainer_action_token: null,
        trainer_action_expires_at: null,
      })
      .eq("id", booking.id)

    if (booking.guest_email) {
      await resend.emails.send({
        from: "Avaimo <info@avaimo.com>",
        to: [booking.guest_email],
        subject: dict.confirmed,
        html: `
          <h2>${dict.confirmed}</h2>
          <p>${dict.confirmedBody}</p>
          <p>${booking.clubs?.[0]?.name || ""}</p>
        `,
      })
    }

    return new NextResponse(
      `<html><body style="font-family:sans-serif;max-width:520px;margin:40px auto;padding:20px;text-align:center"><div style="padding:32px;border-radius:16px;background:#f0fdf4;border:1px solid #bbf7d0"><h2 style="color:#15803d;margin:0 0 12px">✓ ${dict.confirmed}</h2><p style="color:#166534;margin:0">${dict.confirmedBody}</p></div></body></html>`,
      { status: 200, headers: { "Content-Type": "text/html" } }
    )
  }

  if (booking.payment_intent_id) {
    await stripe.paymentIntents.cancel(booking.payment_intent_id)
  }

  await supabaseAdmin
    .from("bookings")
    .update({
      status: "rejected",
      payment_status: "refunded",
      trainer_action_token: null,
      trainer_action_expires_at: null,
    })
    .eq("id", booking.id)

  if (booking.guest_email) {
    await resend.emails.send({
      from: "Avaimo <info@avaimo.com>",
      to: [booking.guest_email],
      subject: dict.rejected,
      html: `
        <h2>${dict.rejected}</h2>
        <p>${dict.rejectedBody}</p>
        <p>${booking.clubs?.[0]?.name || ""}</p>
      `,
    })
  }

  return new NextResponse(
    `<html><body style="font-family:sans-serif;max-width:520px;margin:40px auto;padding:20px;text-align:center"><div style="padding:32px;border-radius:16px;background:#fef2f2;border:1px solid #fecaca"><h2 style="color:#dc2626;margin:0 0 12px">${dict.rejected}</h2><p style="color:#991b1b;margin:0">${dict.rejectedBody}</p></div></body></html>`,
    { status: 200, headers: { "Content-Type": "text/html" } }
  )
}

