import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (secret) {
    const url = new URL(req.url)
    const token = req.headers.get("x-cron-secret") || url.searchParams.get("secret")
    if (token !== secret) return new NextResponse("Unauthorized", { status: 401 })
  }

  const now = new Date().toISOString()

  // Find trainer bookings that expired without a response
  const { data: expiredBookings } = await supabaseAdmin
    .from("bookings")
    .select("id, user_id, club_id, guest_email, start_time, trainer_id")
    .eq("status", "pending_trainer")
    .lt("trainer_action_expires_at", now)

  if (!expiredBookings || expiredBookings.length === 0) {
    return NextResponse.json({ ok: true, cancelled: 0 })
  }

  const ids = expiredBookings.map((b: any) => b.id)
  await supabaseAdmin
    .from("bookings")
    .update({ status: "cancelled", payment_status: "unpaid" })
    .in("id", ids)

  // Notify members their trainer booking was auto-cancelled
  const clubIds = Array.from(new Set(expiredBookings.map((b: any) => b.club_id)))
  const { data: clubs } = await supabaseAdmin.from("clubs").select("id, name, default_language").in("id", clubIds)
  const clubMap = new Map((clubs || []).map((c: any) => [c.id, c]))

  for (const booking of expiredBookings) {
    let email = booking.guest_email
    if (!email && booking.user_id) {
      const { data: u } = await supabaseAdmin.auth.admin.getUserById(booking.user_id)
      email = u?.user?.email || null
    }
    if (!email) continue

    const club = clubMap.get(booking.club_id)
    const lang: "de" | "en" | "it" = club?.default_language === "it" ? "it" : club?.default_language === "en" ? "en" : "de"
    const locale = lang === "it" ? "it-IT" : lang === "en" ? "en-US" : "de-DE"
    const dateStr = new Date(booking.start_time).toLocaleString(locale)

    const subjects: Record<string, string> = {
      de: `Trainerstunde konnte nicht bestätigt werden – ${club?.name || "Club"}`,
      en: `Training session could not be confirmed – ${club?.name || "Club"}`,
      it: `La sessione di allenamento non ha potuto essere confermata – ${club?.name || "Club"}`,
    }
    const bodies: Record<string, string> = {
      de: `<p>Leider hat der Trainer deine Anfrage für den <strong>${dateStr}</strong> nicht rechtzeitig beantwortet. Die Buchung wurde automatisch storniert.</p><p>Bitte versuche es erneut oder wähle einen anderen Trainer.</p>`,
      en: `<p>Unfortunately the trainer did not respond to your request for <strong>${dateStr}</strong> in time. The booking was automatically cancelled.</p><p>Please try again or choose a different trainer.</p>`,
      it: `<p>Purtroppo il trainer non ha risposto in tempo alla tua richiesta per <strong>${dateStr}</strong>. La prenotazione è stata annullata automaticamente.</p><p>Riprova o scegli un altro trainer.</p>`,
    }

    try {
      await resend.emails.send({
        from: "Avaimo <info@avaimo.com>",
        to: [email],
        subject: subjects[lang],
        html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#0f172a">${bodies[lang]}</div>`,
      })
    } catch (err) {
      console.error("trainer-booking-expiry email error:", err)
    }
  }

  return NextResponse.json({ ok: true, cancelled: ids.length })
}
