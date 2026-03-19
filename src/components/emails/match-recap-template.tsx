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
      subtitle: "Match Recap",
      intro: "Dein Match im",
      intro2: "am",
      intro3: "um",
      cta: "Match-Card erstellen",
      hint: "Viel Spaß beim Teilen – danke fürs Spielen!",
      description: "Erstelle jetzt deine Match-Card und teile sie mit Freunden:",
    },
    en: {
      title: "How did it go?",
      subtitle: "Match Recap",
      intro: "Your match at",
      intro2: "on",
      intro3: "at",
      cta: "Create match card",
      hint: "Have fun sharing — thanks for playing!",
      description: "Create your match card and share it with friends:",
    },
    it: {
      title: "Com'è andata?",
      subtitle: "Match Recap",
      intro: "La tua partita al",
      intro2: "del",
      intro3: "alle",
      cta: "Crea la match card",
      hint: "Buona condivisione — grazie per aver giocato!",
      description: "Crea la tua match card e condividila con gli amici:",
    },
  }

  const dict = copy[lang as "de" | "en" | "it"] || copy.de

  return (
    <div style={{ 
      backgroundColor: "#030504", 
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
      padding: "40px 20px", 
      color: "#F9F8F4",
      minHeight: "100%"
    }}>
      <div style={{ maxWidth: "500px", margin: "0 auto", textAlign: "center" }}>
        {/* Logo/Brand Area */}
        <div style={{ marginBottom: "40px" }}>
           <div style={{ 
             display: "inline-block",
             width: "48px", 
             height: "48px", 
             borderRadius: "12px", 
             background: "linear-gradient(135deg, #CBBF9A 0%, #8A7B4D 100%)",
             marginBottom: "12px"
           }} />
           <div style={{ fontSize: "12px", fontWeight: "bold", letterSpacing: "0.2em", color: "#CBBF9A" }}>
             AVAÍMO PREMIUM
           </div>
        </div>

        <h1 style={{ 
          fontSize: "36px", 
          fontWeight: "900", 
          marginBottom: "8px",
          letterSpacing: "-0.04em",
          color: "#FFFFFF"
        }}>
          {dict.title}
        </h1>
        <p style={{ 
          fontSize: "14px", 
          fontWeight: "bold", 
          color: "#CBBF9A", 
          marginBottom: "32px",
          textTransform: "uppercase",
          letterSpacing: "0.2em"
        }}>
          {dict.subtitle}
        </p>
        
        <p style={{ 
          fontSize: "16px", 
          color: "rgba(255,255,255,0.5)", 
          marginBottom: "12px",
          lineHeight: "1.6"
        }}>
          {dict.intro} <strong>{clubName}</strong> {dict.intro2} {date} {dict.intro3} {time}.
        </p>
        <p style={{ 
          fontSize: "14px", 
          color: "rgba(255,255,255,0.4)", 
          marginBottom: "40px",
          lineHeight: "1.6"
        }}>
          {dict.description}
        </p>

        {/* Action Card */}
        <div style={{ 
          backgroundColor: "#0A0D0C", 
          borderRadius: "32px", 
          border: "1px solid rgba(255,255,255,0.08)",
          padding: "40px 32px",
          marginBottom: "32px"
        }}>
          <a
            href={recapUrl}
            style={{
              display: "inline-block",
              width: "100%",
              boxSizing: "border-box",
              padding: "20px 32px",
              background: "#CBBF9A",
              color: "#030504",
              borderRadius: "20px",
              textDecoration: "none",
              fontSize: "16px",
              fontWeight: "900",
              textAlign: "center"
            }}
          >
            {dict.cta}
          </a>
        </div>

        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", marginTop: "16px" }}>{dict.hint}</p>

        <div style={{ 
          marginTop: "60px", 
          borderTop: "1px solid rgba(255,255,255,0.05)",
          paddingTop: "30px"
        }}>
          <p style={{ fontSize: "10px", fontWeight: "bold", color: "rgba(255,255,255,0.15)", letterSpacing: "0.1em" }}>
            POWERED BY AVAÍMO
          </p>
        </div>
      </div>
    </div>
  )
}
