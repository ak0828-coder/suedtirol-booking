import * as React from "react"

export function MatchRecapEmailTemplate({
  clubName,
  date,
  time,
  recapUrl,
  lang = "de",
}: {
  clubName: string
  date: string
  time: string
  recapUrl: string
  lang?: string
}) {
  const copy = {
    de: {
      title: "Na, wie lief's?",
      intro: "Dein Match im",
      intro2: "am",
      intro3: "um",
      cta: "Match-Card erstellen",
      hint: "Viel Spaß beim Teilen – danke fürs Spielen!",
    },
    en: {
      title: "How did it go?",
      intro: "Your match at",
      intro2: "on",
      intro3: "at",
      cta: "Create match card",
      hint: "Have fun sharing — thanks for playing!",
    },
    it: {
      title: "Com'è andata?",
      intro: "La tua partita al",
      intro2: "del",
      intro3: "alle",
      cta: "Crea la match card",
      hint: "Buona condivisione — grazie per aver giocato!",
    },
  }

  const dict = copy[lang as "de" | "en" | "it"] || copy.de

  return (
    <div style={{ fontFamily: "Arial, sans-serif", color: "#0f172a" }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>{dict.title}</h1>
      <p style={{ fontSize: 14, marginBottom: 12 }}>
        {dict.intro} <strong>{clubName}</strong> {dict.intro2} {date} {dict.intro3} {time}.
      </p>
      <p style={{ fontSize: 14, marginBottom: 16 }}>
        {lang === "de" && "Erstelle jetzt deine Match-Card und teile sie mit Freunden:"}
        {lang === "en" && "Create your match card and share it with friends:"}
        {lang === "it" && "Crea la tua match card e condividila con gli amici:"}
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
        {dict.cta}
      </a>
      <p style={{ fontSize: 12, color: "#64748b", marginTop: 16 }}>{dict.hint}</p>
    </div>
  )
}
