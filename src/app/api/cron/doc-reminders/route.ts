import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"
import React from "react"

const resend = new Resend(process.env.RESEND_API_KEY)

const normalizeLang = (lang?: string | null) => (lang === "it" || lang === "en" ? lang : "de")
const localeMap: Record<string, string> = { de: "de-DE", en: "en-US", it: "it-IT" }

const copy = {
  de: {
    subject: "Erinnerung: ärztliches Zeugnis prüfen",
    intro: "Ein ärztliches Zeugnis läuft bald aus und wartet auf Bestätigung.",
    file: "Datei",
    until: "Vorläufig gültig bis",
  },
  en: {
    subject: "Reminder: review medical certificate",
    intro: "A medical certificate is expiring soon and awaits approval.",
    file: "File",
    until: "Temporarily valid until",
  },
  it: {
    subject: "Promemoria: verifica certificato medico",
    intro: "Un certificato medico scade a breve e attende conferma.",
    file: "File",
    until: "Valido provvisoriamente fino al",
  },
}

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (secret) {
    const url = new URL(req.url)
    const token = req.headers.get("x-cron-secret") || url.searchParams.get("secret")
    if (token !== secret) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const now = new Date()
  const soon = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const { data: docs } = await supabaseAdmin
    .from("member_documents")
    .select("id, club_id, user_id, file_name, temp_valid_until")
    .eq("review_status", "pending")
    .eq("ai_status", "ok")
    .lte("temp_valid_until", soon.toISOString())

  if (!docs || docs.length === 0) {
    return NextResponse.json({ ok: true, reminded: 0 })
  }

  const clubIds = Array.from(new Set(docs.map((d: any) => d.club_id)))
  const { data: clubs } = await supabaseAdmin
    .from("clubs")
    .select("id, name, admin_email, default_language")
    .in("id", clubIds)

  const clubMap = new Map((clubs || []).map((c: any) => [c.id, c]))

  let sent = 0
  for (const doc of docs) {
    if (!doc.temp_valid_until) continue
    const club = clubMap.get(doc.club_id)
    const adminEmail = club?.admin_email
    if (!adminEmail) continue

    const lang = normalizeLang(club?.default_language)
    const dict = copy[lang]
    const locale = localeMap[lang]

    try {
      const emailReact = React.createElement(
        "div",
        null,
        React.createElement("p", null, dict.intro),
        React.createElement(
          "p",
          null,
          React.createElement("strong", null, `${dict.file}:`),
          " ",
          doc.file_name
        ),
        React.createElement(
          "p",
          null,
          React.createElement("strong", null, `${dict.until}:`),
          " ",
          new Date(doc.temp_valid_until).toLocaleDateString(locale)
        )
      )

      await resend.emails.send({
        from: "Avaimo <onboarding@resend.dev>",
        to: [adminEmail],
        subject: `${dict.subject} (${club?.name || "Club"})`,
        react: emailReact,
      })
      sent += 1
    } catch (err) {
      console.error("Reminder email failed:", err)
    }
  }

  return NextResponse.json({ ok: true, reminded: sent })
}
