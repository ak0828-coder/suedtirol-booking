import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"
import { MatchRecapEmailTemplate } from "@/components/emails/match-recap-template"
import { format } from "date-fns"
import crypto from "crypto"
import React from "react"

const resend = new Resend(process.env.RESEND_API_KEY)

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { autoRefreshToken: false, persistSession: false },
  }
)

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (secret) {
    const url = new URL(req.url)
    const token = req.headers.get("x-cron-secret") || url.searchParams.get("secret")
    if (token !== secret) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
  }

  const now = new Date()
  const from = new Date(now.getTime() - 2 * 60 * 60 * 1000)
  const to = new Date(now.getTime() - 10 * 60 * 1000)

  const { data: bookings } = await supabaseAdmin
    .from("bookings")
    .select("id, club_id, end_time, guest_name, guest_email, user_id")
    .gte("end_time", from.toISOString())
    .lte("end_time", to.toISOString())
    .eq("status", "confirmed")

  if (!bookings || bookings.length === 0) {
    return NextResponse.json({ ok: true, sent: 0 })
  }

  const bookingIds = bookings.map((b) => b.id)
  const { data: existing } = await supabaseAdmin
    .from("match_recaps")
    .select("booking_id")
    .in("booking_id", bookingIds)

  const existingIds = new Set((existing || []).map((r) => r.booking_id))

  let sent = 0

  for (const booking of bookings) {
    if (existingIds.has(booking.id)) continue

    const token = crypto.randomBytes(24).toString("hex")

    let email = booking.guest_email || null
    if (!email && booking.user_id) {
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(booking.user_id)
      email = userData?.user?.email || null
    }

    const { data: club } = await supabaseAdmin
      .from("clubs")
      .select("name, slug")
      .eq("id", booking.club_id)
      .single()

    const recapUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/match/recap/${token}`

    const { data: recapRow, error } = await supabaseAdmin
      .from("match_recaps")
      .insert({
        booking_id: booking.id,
        club_id: booking.club_id,
        token,
        guest_name: booking.guest_name,
        guest_email: booking.guest_email,
        player_user_id: booking.user_id,
        sent_at: null,
      })
      .select()
      .single()

    if (error) {
      console.error("match_recaps insert error:", error)
      continue
    }

    await supabaseAdmin
      .from("bookings")
      .update({ recap_status: "pending" })
      .eq("id", booking.id)

    if (!email) continue

    try {
      const emailReact = React.createElement(MatchRecapEmailTemplate, {
        clubName: club?.name || "Club",
        date: format(new Date(booking.end_time), "dd.MM.yyyy"),
        time: format(new Date(booking.end_time), "HH:mm"),
        recapUrl,
      })

      await resend.emails.send({
        from: "Suedtirol Booking <onboarding@resend.dev>",
        to: [email],
        subject: `Wie lief dein Match?`,
        react: emailReact,
      })

      await supabaseAdmin
        .from("match_recaps")
        .update({ sent_at: new Date().toISOString() })
        .eq("id", recapRow.id)

      sent += 1
    } catch (err) {
      console.error("match recap email error:", err)
    }
  }

  return NextResponse.json({ ok: true, sent })
}
