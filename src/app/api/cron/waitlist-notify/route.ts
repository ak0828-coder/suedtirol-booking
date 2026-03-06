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

  // Find courses that have waitlisted members and available spots
  const { data: waitlisted } = await supabaseAdmin
    .from("course_participants")
    .select("id, course_id, user_id")
    .eq("status", "waitlist")

  if (!waitlisted || waitlisted.length === 0) {
    return NextResponse.json({ ok: true, notified: 0 })
  }

  const courseIds = Array.from(new Set(waitlisted.map((p: any) => p.course_id)))

  const { data: courses } = await supabaseAdmin
    .from("courses")
    .select("id, title, club_id, max_participants, is_published")
    .in("id", courseIds)
    .eq("is_published", true)

  if (!courses || courses.length === 0) return NextResponse.json({ ok: true, notified: 0 })

  // Count confirmed participants per course
  const { data: confirmed } = await supabaseAdmin
    .from("course_participants")
    .select("course_id")
    .eq("status", "confirmed")
    .in("course_id", courseIds)

  const confirmedCount = new Map<string, number>()
  for (const p of confirmed || []) {
    confirmedCount.set(p.course_id, (confirmedCount.get(p.course_id) || 0) + 1)
  }

  const clubIds = Array.from(new Set(courses.map((c: any) => c.club_id)))
  const { data: clubs } = await supabaseAdmin.from("clubs").select("id, name, slug, default_language").in("id", clubIds)
  const clubMap = new Map((clubs || []).map((c: any) => [c.id, c]))

  const { data: { users: authUsers } } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
  const emailMap = new Map((authUsers || []).map((u: any) => [u.id, u.email]))

  const waitlistByCoure = new Map<string, any[]>()
  for (const p of waitlisted) {
    const list = waitlistByCoure.get(p.course_id) || []
    list.push(p)
    waitlistByCoure.set(p.course_id, list)
  }

  let notified = 0
  for (const course of courses) {
    const max = Number(course.max_participants || 0)
    if (!max) continue
    const count = confirmedCount.get(course.id) || 0
    if (count >= max) continue // Still full

    const freeSpots = max - count
    const waitlistMembers = waitlistByCoure.get(course.id) || []
    const toNotify = waitlistMembers.slice(0, freeSpots)

    const club = clubMap.get(course.club_id)
    const lang: "de" | "en" | "it" = club?.default_language === "it" ? "it" : club?.default_language === "en" ? "en" : "de"
    const courseUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/${lang}/club/${club?.slug}/training`

    const copy: Record<string, { subject: string; html: string }> = {
      de: {
        subject: `Platz frei: ${course.title} – ${club?.name || "Club"}`,
        html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#0f172a">
          <h2>Ein Platz ist frei!</h2>
          <p>Du stehst auf der Warteliste für den Kurs <strong>${course.title}</strong>.</p>
          <p>Es ist jetzt ein Platz frei. Melde dich schnell an – die Plätze sind begrenzt!</p>
          <a href="${courseUrl}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#0f172a;color:white;border-radius:999px;text-decoration:none;font-size:14px;font-weight:600">Jetzt anmelden</a>
        </div>`,
      },
      en: {
        subject: `Spot available: ${course.title} – ${club?.name || "Club"}`,
        html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#0f172a">
          <h2>A spot is now available!</h2>
          <p>You're on the waitlist for <strong>${course.title}</strong>.</p>
          <p>A spot just opened up. Sign up quickly – spots are limited!</p>
          <a href="${courseUrl}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#0f172a;color:white;border-radius:999px;text-decoration:none;font-size:14px;font-weight:600">Sign up now</a>
        </div>`,
      },
      it: {
        subject: `Posto disponibile: ${course.title} – ${club?.name || "Club"}`,
        html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#0f172a">
          <h2>Un posto è disponibile!</h2>
          <p>Sei in lista d'attesa per il corso <strong>${course.title}</strong>.</p>
          <p>Si è liberato un posto. Iscriviti subito – i posti sono limitati!</p>
          <a href="${courseUrl}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#0f172a;color:white;border-radius:999px;text-decoration:none;font-size:14px;font-weight:600">Iscriviti ora</a>
        </div>`,
      },
    }

    for (const p of toNotify) {
      const email = emailMap.get(p.user_id)
      if (!email) continue
      try {
        await resend.emails.send({
          from: "Avaimo <info@avaimo.com>",
          to: [email],
          subject: copy[lang].subject,
          html: copy[lang].html,
        })
        notified++
      } catch (err) {
        console.error("waitlist-notify email error:", err)
      }
    }
  }

  return NextResponse.json({ ok: true, notified })
}
