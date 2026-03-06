import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

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

  // Cancel course participants that are unpaid and older than 48h (no Stripe checkout completed)
  const cutoff = new Date()
  cutoff.setHours(cutoff.getHours() - 48)

  const { data: staleParticipants } = await supabaseAdmin
    .from("course_participants")
    .select("id, course_id")
    .eq("payment_status", "unpaid")
    .eq("status", "confirmed")
    .lt("joined_at", cutoff.toISOString())

  let cleaned = 0
  if (staleParticipants && staleParticipants.length > 0) {
    const ids = staleParticipants.map((p: any) => p.id)
    await supabaseAdmin
      .from("course_participants")
      .update({ status: "cancelled" })
      .in("id", ids)
    cleaned = ids.length
  }

  // Also clean up stale course_session_participants
  const { data: staleSessions } = await supabaseAdmin
    .from("course_session_participants")
    .select("id")
    .eq("payment_status", "unpaid")
    .eq("status", "confirmed")
    .lt("created_at", cutoff.toISOString())

  let sessionsCleaned = 0
  if (staleSessions && staleSessions.length > 0) {
    const ids = staleSessions.map((p: any) => p.id)
    await supabaseAdmin
      .from("course_session_participants")
      .update({ status: "cancelled" })
      .in("id", ids)
    sessionsCleaned = ids.length
  }

  return NextResponse.json({ ok: true, cleaned, sessionsCleaned })
}
