import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

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

  const threshold = new Date(Date.now() - 20 * 60 * 1000).toISOString()

  const { data: expired } = await supabaseAdmin
    .from("bookings")
    .select("id")
    .eq("status", "awaiting_payment")
    .lt("created_at", threshold)

  if (!expired || expired.length === 0) {
    return NextResponse.json({ ok: true, deleted: 0 })
  }

  const ids = expired.map((b: any) => b.id)
  const { error } = await supabaseAdmin
    .from("bookings")
    .delete()
    .in("id", ids)

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, deleted: ids.length })
}
