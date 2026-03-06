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

  // 1. Auto-expire members whose valid_until has passed (non-subscription: no stripe_subscription_id)
  const { data: expired } = await supabaseAdmin
    .from("club_members")
    .select("id, user_id, club_id")
    .eq("status", "active")
    .is("stripe_subscription_id", null)
    .lt("valid_until", now)

  if (expired && expired.length > 0) {
    const ids = expired.map((m: any) => m.id)
    await supabaseAdmin
      .from("club_members")
      .update({ status: "expired" })
      .in("id", ids)
  }

  // 2. Warn members expiring in 7 days (non-subscription)
  const in7 = new Date()
  in7.setDate(in7.getDate() + 7)
  const in8 = new Date()
  in8.setDate(in8.getDate() + 8)

  const { data: expiringSoon } = await supabaseAdmin
    .from("club_members")
    .select("id, user_id, club_id, valid_until")
    .eq("status", "active")
    .is("stripe_subscription_id", null)
    .gte("valid_until", in7.toISOString())
    .lt("valid_until", in8.toISOString())

  let warned = 0
  if (expiringSoon && expiringSoon.length > 0) {
    const clubIds = Array.from(new Set(expiringSoon.map((m: any) => m.club_id)))
    const userIds = Array.from(new Set(expiringSoon.map((m: any) => m.user_id)))

    const { data: clubs } = await supabaseAdmin.from("clubs").select("id, name, slug, default_language").in("id", clubIds)
    const { data: profiles } = await supabaseAdmin.from("profiles").select("id, first_name").in("id", userIds)
    const { data: { users: authUsers } } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })

    const clubMap = new Map((clubs || []).map((c: any) => [c.id, c]))
    const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]))
    const emailMap = new Map((authUsers || []).map((u: any) => [u.id, u.email]))

    for (const m of expiringSoon) {
      const email = emailMap.get(m.user_id)
      if (!email) continue
      const club = clubMap.get(m.club_id)
      const profile = profileMap.get(m.user_id)
      const lang: "de" | "en" | "it" = club?.default_language === "it" ? "it" : club?.default_language === "en" ? "en" : "de"
      const locale = lang === "it" ? "it-IT" : lang === "en" ? "en-US" : "de-DE"
      const expiry = new Date(m.valid_until).toLocaleDateString(locale, { day: "2-digit", month: "long", year: "numeric" })
      const firstName = profile?.first_name || ""
      const clubName = club?.name || "Club"
      const renewUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/${lang}/club/${club?.slug}`

      const copy: Record<string, { subject: string; html: string }> = {
        de: {
          subject: `Deine Mitgliedschaft läuft in 7 Tagen ab – ${clubName}`,
          html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#0f172a">
            <h2>Mitgliedschaft läuft bald ab</h2>
            <p>Hallo${firstName ? ` ${firstName}` : ""},</p>
            <p>deine Mitgliedschaft bei <strong>${clubName}</strong> läuft am <strong>${expiry}</strong> ab.</p>
            <p>Um weiterhin Plätze buchen und alle Funktionen nutzen zu können, verlängere bitte rechtzeitig deine Mitgliedschaft.</p>
            <a href="${renewUrl}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#0f172a;color:white;border-radius:999px;text-decoration:none;font-size:14px;font-weight:600">Mitgliedschaft verlängern</a>
          </div>`,
        },
        en: {
          subject: `Your membership expires in 7 days – ${clubName}`,
          html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#0f172a">
            <h2>Membership expiring soon</h2>
            <p>Hi${firstName ? ` ${firstName}` : ""},</p>
            <p>Your membership at <strong>${clubName}</strong> expires on <strong>${expiry}</strong>.</p>
            <p>To continue booking courts and using all features, please renew your membership in time.</p>
            <a href="${renewUrl}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#0f172a;color:white;border-radius:999px;text-decoration:none;font-size:14px;font-weight:600">Renew membership</a>
          </div>`,
        },
        it: {
          subject: `La tua iscrizione scade tra 7 giorni – ${clubName}`,
          html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#0f172a">
            <h2>Iscrizione in scadenza</h2>
            <p>Ciao${firstName ? ` ${firstName}` : ""},</p>
            <p>La tua iscrizione presso <strong>${clubName}</strong> scade il <strong>${expiry}</strong>.</p>
            <p>Per continuare a prenotare campi e usare tutte le funzionalità, rinnova la tua iscrizione in tempo.</p>
            <a href="${renewUrl}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#0f172a;color:white;border-radius:999px;text-decoration:none;font-size:14px;font-weight:600">Rinnova iscrizione</a>
          </div>`,
        },
      }

      try {
        await resend.emails.send({
          from: "Avaimo <info@avaimo.com>",
          to: [email],
          subject: copy[lang].subject,
          html: copy[lang].html,
        })
        warned++
      } catch (err) {
        console.error("member-expiry warn email error:", err)
      }
    }
  }

  return NextResponse.json({ ok: true, expired: expired?.length || 0, warned })
}
