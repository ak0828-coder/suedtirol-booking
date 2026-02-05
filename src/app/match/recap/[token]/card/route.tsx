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
    const parts = resultText.split(",").map((p: string) => p.trim())
    const score: number[] = parts.map((set: string) => {
      const [a, b] = set.split(":").map((v: string) => parseInt(v, 10))
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
            "radial-gradient(1200px 900px at 10% 10%, rgba(255,255,255,0.08), transparent 60%)," +
            "radial-gradient(900px 700px at 80% 20%, rgba(255,255,255,0.06), transparent 60%)," +
            "linear-gradient(135deg, #0b1220 0%, #0f172a 55%, " + clubColor + " 100%)",
          fontFamily: "Impact, Arial Black, Arial, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 120,
            left: -120,
            width: 1400,
            height: 120,
            background: "rgba(255,255,255,0.05)",
            transform: "rotate(-8deg)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 260,
            left: -120,
            width: 1400,
            height: 70,
            background: "rgba(255,255,255,0.04)",
            transform: "rotate(-8deg)",
          }}
        />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 52, fontWeight: 900, letterSpacing: 1 }}>{clubName}</div>
            <div style={{ fontSize: 22, opacity: 0.7, marginTop: 6, letterSpacing: 2 }}>
              MATCH CARD
            </div>
            <div style={{ fontSize: 20, opacity: 0.75, marginTop: 6 }}>{dateLabel}</div>
          </div>
          {club?.logo_url ? (
            <img
              src={club.logo_url}
              width={120}
              height={120}
              style={{ opacity: 0.9, borderRadius: 18 }}
            />
          ) : null}
        </div>

        <div
          style={{
            marginTop: 70,
            padding: 56,
            borderRadius: 36,
            background: "rgba(15, 23, 42, 0.7)",
            border: "2px solid rgba(255,255,255,0.15)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
          }}
        >
          <div style={{ fontSize: 66, fontWeight: 900 }}>{playerName}</div>
          <div style={{ fontSize: 34, opacity: 0.6, marginTop: 16, letterSpacing: 2 }}>VS</div>
          <div style={{ fontSize: 66, fontWeight: 900, marginTop: 12 }}>{opponentName}</div>
          <div style={{ fontSize: 78, fontWeight: 900, marginTop: 32, letterSpacing: 2 }}>
            {resultText}
          </div>
          {winnerName ? (
            <div
              style={{
                display: "inline-block",
                marginTop: 28,
                padding: "10px 18px",
                borderRadius: 14,
                background: "rgba(255, 215, 0, 0.95)",
                color: "#0b1220",
                fontWeight: 900,
                fontSize: 22,
                letterSpacing: 1,
              }}
            >
              WINNER: {winnerName}
            </div>
          ) : null}
        </div>

        <div style={{ marginTop: "auto", fontSize: 20, opacity: 0.6, letterSpacing: 1 }}>
          Played at {clubName}
        </div>
      </div>
    ),
    { width: 1080, height: 1350 }
  )
}
