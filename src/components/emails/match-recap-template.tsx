import * as React from "react"

export function MatchRecapEmailTemplate({
  clubName,
  date,
  time,
  recapUrl,
}: {
  clubName: string
  date: string
  time: string
  recapUrl: string
}) {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", color: "#0f172a" }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Na, wie lief&apos;s?</h1>
      <p style={{ fontSize: 14, marginBottom: 12 }}>
        Dein Match im <strong>{clubName}</strong> am {date} um {time} ist vorbei.
      </p>
      <p style={{ fontSize: 14, marginBottom: 16 }}>
        Erstelle jetzt deine Match-Card und teile sie mit Freunden:
      </p>
      <a
        href={recapUrl}
        style={{
          display: "inline-block",
          padding: "10px 16px",
          background: "#0f172a",
          color: "white",
          borderRadius: 999,
          textDecoration: "none",
          fontSize: 14,
        }}
      >
        Match-Card erstellen
      </a>
      <p style={{ fontSize: 12, color: "#64748b", marginTop: 16 }}>
        Viel Spaß beim Teilen – danke fürs Spielen!
      </p>
    </div>
  )
}
