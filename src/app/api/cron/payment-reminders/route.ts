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

  // Members with unpaid or overdue payment status (non-subscription, older than 3 days)
  const threshold = new Date()
  threshold.setDate(threshold.getDate() - 3)

  const { data: unpaidMembers } = await supabaseAdmin
    .from("club_members")
    .select("id, user_id, club_id, payment_status, valid_until")
    .in("payment_status", ["unpaid", "overdue"])
    .eq("status", "active")
    .is("stripe_subscription_id", null)
    .lt("updated_at", threshold.toISOString())

  if (!unpaidMembers || unpaidMembers.length === 0) {
    return NextResponse.json({ ok: true, reminded: 0 })
  }

  const clubIds = Array.from(new Set(unpaidMembers.map((m: any) => m.club_id)))
  const userIds = Array.from(new Set(unpaidMembers.map((m: any) => m.user_id)))

  const { data: clubs } = await supabaseAdmin.from("clubs").select("id, name, slug, default_language, admin_email").in("id", clubIds)
  const { data: profiles } = await supabaseAdmin.from("profiles").select("id, first_name").in("id", userIds)
  const { data: { users: authUsers } } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })

  const clubMap = new Map((clubs || []).map((c: any) => [c.id, c]))
  const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]))
  const emailMap = new Map((authUsers || []).map((u: any) => [u.id, u.email]))

  let reminded = 0
  for (const m of unpaidMembers) {
    const email = emailMap.get(m.user_id)
    if (!email) continue
    const club = clubMap.get(m.club_id)
    const profile = profileMap.get(m.user_id)
    const lang: "de" | "en" | "it" = club?.default_language === "it" ? "it" : club?.default_language === "en" ? "en" : "de"
    const firstName = profile?.first_name || ""
    const clubName = club?.name || "Club"
    const contactEmail = club?.admin_email || "info@avaimo.com"

    const copy: Record<string, { subject: string; html: string }> = {
      de: {
        subject: `Offene Zahlung – ${clubName}`,
        html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#0f172a">
          <h2>Erinnerung: Offene Zahlung</h2>
          <p>Hallo${firstName ? ` ${firstName}` : ""},</p>
          <p>für deine Mitgliedschaft bei <strong>${clubName}</strong> ist noch eine Zahlung ausstehend.</p>
          <p>Bitte wende dich an deinen Club (${contactEmail}), um die Zahlung zu klären und deine Mitgliedschaft zu erhalten.</p>
        </div>`,
      },
      en: {
        subject: `Outstanding payment – ${clubName}`,
        html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#0f172a">
          <h2>Payment reminder</h2>
          <p>Hi${firstName ? ` ${firstName}` : ""},</p>
          <p>There is an outstanding payment for your membership at <strong>${clubName}</strong>.</p>
          <p>Please contact your club (${contactEmail}) to resolve the payment and keep your membership active.</p>
        </div>`,
      },
      it: {
        subject: `Pagamento in sospeso – ${clubName}`,
        html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#0f172a">
          <h2>Promemoria pagamento</h2>
          <p>Ciao${firstName ? ` ${firstName}` : ""},</p>
          <p>C'è un pagamento in sospeso per la tua iscrizione presso <strong>${clubName}</strong>.</p>
          <p>Contatta il tuo club (${contactEmail}) per regolarizzare il pagamento e mantenere attiva la tua iscrizione.</p>
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
      console.error("payment-reminders email error:", err)
    }
  }

  return NextResponse.json({ ok: true, reminded })
}
