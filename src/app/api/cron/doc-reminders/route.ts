import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"
import React from "react"

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
    .select("id, name, admin_email")
    .in("id", clubIds)

  const clubMap = new Map((clubs || []).map((c: any) => [c.id, c]))

  let sent = 0
  for (const doc of docs) {
    const club = clubMap.get(doc.club_id)
    const adminEmail = club?.admin_email
    if (!adminEmail) continue

    try {
        const emailReact = React.createElement(
          "div",
          null,
          React.createElement("p", null, "Ein ärztliches Zeugnis läuft bald aus und wartet auf Bestätigung."),
          React.createElement(
            "p",
            null,
            React.createElement("strong", null, "Datei:"),
            " ",
            doc.file_name
          ),
          React.createElement(
            "p",
            null,
            React.createElement("strong", null, "Vorläufig gültig bis:"),
            " ",
            new Date(doc.temp_valid_until).toLocaleDateString("de-DE")
          )
        )

        await resend.emails.send({
          from: "Suedtirol Booking <onboarding@resend.dev>",
          to: [adminEmail],
          subject: `Erinnerung: ärztliches Zeugnis prüfen (${club?.name || "Club"})`,
          react: emailReact,
        })
      sent += 1
    } catch (err) {
      console.error("Reminder email failed:", err)
    }
  }

  return NextResponse.json({ ok: true, reminded: sent })
}
