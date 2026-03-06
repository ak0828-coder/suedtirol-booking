import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (secret) {
    const url = new URL(req.url)
    const token = req.headers.get("x-cron-secret") || url.searchParams.get("secret")
    if (token !== secret) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const now = new Date()
  const windowStart = new Date(now.getTime() + 23 * 60 * 60 * 1000) // 23h from now
  const windowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000)   // 25h from now

  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, start_time, end_time, guest_email, guest_name, club_id, courts(name)")
    .gte("start_time", windowStart.toISOString())
    .lte("start_time", windowEnd.toISOString())
    .not("guest_email", "is", null)
    .neq("status", "cancelled")

  if (!bookings || bookings.length === 0) {
    return NextResponse.json({ ok: true, reminded: 0 })
  }

  const clubIds = Array.from(new Set(bookings.map((b: any) => b.club_id)))
  const { data: clubs } = await supabase
    .from("clubs")
    .select("id, name, default_language, slug")
    .in("id", clubIds)

  const clubMap = new Map((clubs || []).map((c: any) => [c.id, c]))

  let reminded = 0
  for (const booking of bookings) {
    const club = clubMap.get(booking.club_id)
    if (!booking.guest_email) continue

    const lang = (club?.default_language as "de" | "en" | "it") || "de"
    const locale = lang === "it" ? "it-IT" : lang === "en" ? "en-US" : "de-DE"
    const date = new Date(booking.start_time).toLocaleDateString(locale, { weekday: "long", day: "2-digit", month: "long" })
    const time = new Date(booking.start_time).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })
    const endTime = new Date(booking.end_time).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })
    const courtName = (booking as any).courts?.name || "Platz"
    const clubName = club?.name || "Club"

    const subjects: Record<string, string> = {
      de: `Erinnerung: Deine Buchung morgen um ${time} Uhr`,
      en: `Reminder: Your booking tomorrow at ${time}`,
      it: `Promemoria: La tua prenotazione domani alle ${time}`,
    }

    const html: Record<string, string> = {
      de: `<h2>Erinnerung an deine Buchung</h2><p>Du hast morgen eine Buchung bei <strong>${clubName}</strong>.</p><ul><li><strong>Platz:</strong> ${courtName}</li><li><strong>Datum:</strong> ${date}</li><li><strong>Uhrzeit:</strong> ${time} – ${endTime} Uhr</li></ul><p>Wir freuen uns auf dich!</p>`,
      en: `<h2>Booking Reminder</h2><p>You have a booking tomorrow at <strong>${clubName}</strong>.</p><ul><li><strong>Court:</strong> ${courtName}</li><li><strong>Date:</strong> ${date}</li><li><strong>Time:</strong> ${time} – ${endTime}</li></ul><p>See you there!</p>`,
      it: `<h2>Promemoria prenotazione</h2><p>Hai una prenotazione domani presso <strong>${clubName}</strong>.</p><ul><li><strong>Campo:</strong> ${courtName}</li><li><strong>Data:</strong> ${date}</li><li><strong>Orario:</strong> ${time} – ${endTime}</li></ul><p>A domani!</p>`,
    }

    try {
      await resend.emails.send({
        from: "Avaimo <info@avaimo.com>",
        to: [booking.guest_email],
        subject: subjects[lang],
        html: html[lang],
      })
      reminded++
    } catch (err) {
      console.error("booking-reminders: email error", err)
    }
  }

  return NextResponse.json({ ok: true, reminded })
}
