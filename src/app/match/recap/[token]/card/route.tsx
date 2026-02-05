import { ImageResponse } from "@vercel/og"
import { createClient } from "@supabase/supabase-js"
import { NextRequest } from "next/server"

export const runtime = "edge"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: recap } = await supabaseAdmin
    .from("match_recaps")
    .select("*")
    .eq("token", token)
    .single()

  if (!recap) {
    return new Response("Not found", { status: 404 })
  }

  const { data: booking } = await supabaseAdmin
    .from("bookings")
    .select("start_time, club_id")
    .eq("id", recap.booking_id)
    .single()

  const { data: club } = await supabaseAdmin
    .from("clubs")
    .select("name, logo_url, primary_color")
    .eq("id", recap.club_id)
    .single()

  let playerName = recap.guest_name || "Spieler"
  if (recap.player_user_id) {
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", recap.player_user_id)
      .single()
    if (profile) {
      const full = `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
      if (full.length > 0) playerName = full
    }
  }

  const opponentName = recap.opponent_name || "Gegner"
  const resultText = recap.result_text || "6:4, 6:2"
  const clubName = club?.name || "Club"
  const clubColor = club?.primary_color || "#0f172a"
  const dateLabel = booking?.start_time
    ? new Date(booking.start_time).toLocaleDateString("de-DE")
    : ""

  const winnerName = (() => {
    const parts = resultText.split(",").map((p) => p.trim())
    const score = parts.map((set) => {
      const [a, b] = set.split(":").map((v) => parseInt(v, 10))
      if (Number.isNaN(a) || Number.isNaN(b)) return 0
      return a > b ? 1 : a < b ? -1 : 0
    })
    const sum = score.reduce((acc, v) => acc + v, 0)
    if (sum === 0) return null
    return sum > 0 ? playerName : opponentName
  })()

  return new ImageResponse(
    (
      <div
        style={{
          width: "1080px",
          height: "1350px",
          display: "flex",
          flexDirection: "column",
          padding: "64px",
          color: "white",
          background:
            "linear-gradient(135deg, #0b1220 0%, #0f172a 55%, " + clubColor + " 100%)",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 48, fontWeight: 700 }}>{clubName}</div>
            <div style={{ fontSize: 22, opacity: 0.7, marginTop: 6 }}>MATCH CARD</div>
            <div style={{ fontSize: 20, opacity: 0.75, marginTop: 6 }}>{dateLabel}</div>
          </div>
          {club?.logo_url ? (
            <img
              src={club.logo_url}
              width={120}
              height={120}
              style={{ opacity: 0.9, borderRadius: 16 }}
            />
          ) : null}
        </div>

        <div
          style={{
            marginTop: 60,
            padding: 48,
            borderRadius: 32,
            background: "rgba(15, 23, 42, 0.65)",
            border: "2px solid rgba(255,255,255,0.12)",
          }}
        >
          <div style={{ fontSize: 64, fontWeight: 800 }}>{playerName}</div>
          <div style={{ fontSize: 34, opacity: 0.6, marginTop: 16 }}>VS</div>
          <div style={{ fontSize: 64, fontWeight: 800, marginTop: 12 }}>{opponentName}</div>
          <div style={{ fontSize: 72, fontWeight: 900, marginTop: 32 }}>{resultText}</div>
          {winnerName ? (
            <div
              style={{
                display: "inline-block",
                marginTop: 28,
                padding: "10px 18px",
                borderRadius: 14,
                background: "rgba(255, 215, 0, 0.9)",
                color: "#0b1220",
                fontWeight: 800,
                fontSize: 22,
              }}
            >
              WINNER: {winnerName}
            </div>
          ) : null}
        </div>

        <div style={{ marginTop: "auto", fontSize: 20, opacity: 0.6 }}>
          Played at {clubName}
        </div>
      </div>
    ),
    { width: 1080, height: 1350 }
  )
}
