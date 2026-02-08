import { NextResponse } from "next/server"
import { Resend } from "resend"
import Stripe from "stripe"
import { getAdminClient } from "@/lib/supabase/admin"

const resend = new Resend(process.env.RESEND_API_KEY)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2024-12-18.acacia" as any })

export const runtime = "nodejs"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get("token") || ""
  const action = searchParams.get("action") || ""

  if (!token || !["accept", "reject"].includes(action)) {
    return NextResponse.json({ error: "Ungueltiger Link" }, { status: 400 })
  }

  const supabaseAdmin = getAdminClient()
  const { data: booking } = await supabaseAdmin
    .from("bookings")
    .select("id, club_id, payment_intent_id, guest_email, status, trainer_action_expires_at, clubs(slug, name)")
    .eq("trainer_action_token", token)
    .single()

  if (!booking) {
    return NextResponse.json({ error: "Anfrage nicht gefunden" }, { status: 404 })
  }

  const expiresAt = booking.trainer_action_expires_at
  if (expiresAt && new Date(expiresAt).getTime() < Date.now()) {
    return NextResponse.json({ error: "Link ist abgelaufen" }, { status: 410 })
  }

  if (booking.status !== "pending_trainer") {
    return NextResponse.json({ error: "Anfrage ist nicht mehr aktiv" }, { status: 409 })
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
        from: "Avaimo <onboarding@resend.dev>",
        to: [booking.guest_email],
        subject: "Trainerstunde bestaetigt",
        html: `
          <h2>Deine Trainerstunde ist bestaetigt</h2>
          <p>Der Trainer hat die Stunde bestaetigt. Die Zahlung wurde abgeschlossen.</p>
          <p>Verein: ${booking.clubs?.[0]?.name || ""}</p>
        `,
      })
    }

    return new NextResponse(
      "<html><body><h2>Trainerstunde bestaetigt</h2><p>Die Buchung wurde angenommen.</p></body></html>",
      { headers: { "Content-Type": "text/html" } }
    )
  }

  if (booking.payment_intent_id) {
    await stripe.paymentIntents.cancel(booking.payment_intent_id)
  }

  await supabaseAdmin
    .from("bookings")
    .update({
      status: "cancelled",
      payment_status: "unpaid",
      trainer_action_token: null,
      trainer_action_expires_at: null,
    })
    .eq("id", booking.id)

  await supabaseAdmin.from("trainer_payouts").delete().eq("booking_id", booking.id)

  if (booking.guest_email) {
    await resend.emails.send({
      from: "Avaimo <onboarding@resend.dev>",
      to: [booking.guest_email],
      subject: "Trainerstunde abgelehnt",
      html: `
        <h2>Trainerstunde abgelehnt</h2>
        <p>Der Trainer konnte die Stunde leider nicht annehmen. Es wurde nichts belastet.</p>
        <p>Verein: ${booking.clubs?.[0]?.name || ""}</p>
      `,
    })
  }

  return new NextResponse(
    "<html><body><h2>Trainerstunde abgelehnt</h2><p>Die Buchung wurde abgelehnt.</p></body></html>",
    { headers: { "Content-Type": "text/html" } }
  )
}
