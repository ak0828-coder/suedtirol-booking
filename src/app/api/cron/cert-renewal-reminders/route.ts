import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (secret) {
    const url = new URL(req.url)
    const token = req.headers.get("x-cron-secret") || url.searchParams.get("secret")
    if (token !== secret) return new NextResponse("Unauthorized", { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Members whose cert expires in 25–35 days (send once in that window)
  const soon = new Date()
  soon.setDate(soon.getDate() + 25)
  const upper = new Date()
  upper.setDate(upper.getDate() + 35)

  const { data: members } = await supabase
    .from("club_members")
    .select("id, user_id, club_id, medical_certificate_valid_until")
    .eq("status", "active")
    .gte("medical_certificate_valid_until", soon.toISOString())
    .lte("medical_certificate_valid_until", upper.toISOString())

  if (!members || members.length === 0) {
    return NextResponse.json({ ok: true, reminded: 0 })
  }

  const clubIds = Array.from(new Set(members.map((m: any) => m.club_id)))
  const userIds = Array.from(new Set(members.map((m: any) => m.user_id)))

  const { data: clubs } = await supabase
    .from("clubs")
    .select("id, name, slug, default_language")
    .in("id", clubIds)

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, first_name")
    .in("id", userIds)

  const clubMap = new Map((clubs || []).map((c: any) => [c.id, c]))
  const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]))

  // Get user emails from auth.users via admin
  const { data: { users: authUsers } } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  const emailMap = new Map((authUsers || []).map((u: any) => [u.id, u.email]))

  let reminded = 0
  for (const member of members) {
    const email = emailMap.get(member.user_id)
    if (!email) continue
    const club = clubMap.get(member.club_id)
    const profile = profileMap.get(member.user_id)
    const lang = (club?.default_language as "de" | "en" | "it") || "de"
    const locale = lang === "it" ? "it-IT" : lang === "en" ? "en-US" : "de-DE"
    const expiry = new Date(member.medical_certificate_valid_until).toLocaleDateString(locale, {
      day: "2-digit", month: "long", year: "numeric"
    })
    const firstName = profile?.first_name || ""
    const clubName = club?.name || "Dein Club"
    const docsUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/${lang}/club/${club?.slug}/dashboard/documents`

    const copy: Record<string, { subject: string; html: string }> = {
      de: {
        subject: `Erinnerung: Ärztliches Zeugnis läuft ab – ${clubName}`,
        html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#0f172a">
          <h2 style="font-size:20px">Ärztliches Zeugnis läuft bald ab</h2>
          <p>Hallo${firstName ? ` ${firstName}` : ""},</p>
          <p>dein ärztliches Zeugnis bei <strong>${clubName}</strong> läuft am <strong>${expiry}</strong> ab.</p>
          <p>Bitte lade rechtzeitig ein neues Zeugnis hoch, um weiterhin alle Funktionen nutzen und Plätze buchen zu können.</p>
          <a href="${docsUrl}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#0f172a;color:white;border-radius:999px;text-decoration:none;font-size:14px;font-weight:600">Zeugnis jetzt hochladen</a>
          <p style="font-size:12px;color:#94a3b8">Falls du das Zeugnis bereits hochgeladen hast, kannst du diese E-Mail ignorieren.</p>
        </div>`,
      },
      en: {
        subject: `Reminder: Medical certificate expiring – ${clubName}`,
        html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#0f172a">
          <h2 style="font-size:20px">Your medical certificate is expiring soon</h2>
          <p>Hi${firstName ? ` ${firstName}` : ""},</p>
          <p>Your medical certificate at <strong>${clubName}</strong> expires on <strong>${expiry}</strong>.</p>
          <p>Please upload a new certificate in time to continue booking courts and using all features.</p>
          <a href="${docsUrl}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#0f172a;color:white;border-radius:999px;text-decoration:none;font-size:14px;font-weight:600">Upload certificate now</a>
          <p style="font-size:12px;color:#94a3b8">If you already uploaded a new certificate, you can ignore this email.</p>
        </div>`,
      },
      it: {
        subject: `Promemoria: Certificato medico in scadenza – ${clubName}`,
        html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#0f172a">
          <h2 style="font-size:20px">Il tuo certificato medico sta per scadere</h2>
          <p>Ciao${firstName ? ` ${firstName}` : ""},</p>
          <p>Il tuo certificato medico presso <strong>${clubName}</strong> scade il <strong>${expiry}</strong>.</p>
          <p>Carica un nuovo certificato in tempo per continuare a prenotare campi e utilizzare tutte le funzionalità.</p>
          <a href="${docsUrl}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#0f172a;color:white;border-radius:999px;text-decoration:none;font-size:14px;font-weight:600">Carica certificato ora</a>
          <p style="font-size:12px;color:#94a3b8">Se hai già caricato un nuovo certificato, puoi ignorare questa email.</p>
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
      reminded++
    } catch (err) {
      console.error("cert-renewal-reminders email error:", err)
    }
  }

  return NextResponse.json({ ok: true, reminded })
}
