import * as React from "react"

export function WelcomeMemberEmailTemplate({
  clubName,
  email,
  magicLink,
  loginUrl,
  lang = "de",
  existingUser = false,
  needsPassword = false,
}: {
  clubName: string
  email: string
  magicLink?: string
  loginUrl: string
  lang?: string
  existingUser?: boolean
  needsPassword?: boolean
  /** @deprecated use magicLink instead */
  password?: string
}) {
  const copy = {
    de: {
      title: existingUser ? `Du bist dabei!` : `Willkommen im Club`,
      subtitle: clubName,
      intro: needsPassword
        ? `Deine Mitgliedschaft bei ${clubName} wurde bestätigt. Lege jetzt dein Passwort fest, um dein Dashboard freizuschalten.`
        : existingUser
        ? `Du hast nun vollen Zugang zum Verein ${clubName}. Dein Dashboard wartet auf dich.`
        : `Deine Mitgliedschaft bei ${clubName} wurde erfolgreich bestätigt. Willkommen in der Community!`,
      linkNote: "Dieser Link ist 24 Stunden gültig. Danach kannst du dich mit \"Passwort vergessen\" anmelden.",
      email_label: "DEINE E-MAIL",
      cta: needsPassword ? "Konto aktivieren" : "Zum Dashboard",
      fallback: "Falls der Button nicht funktioniert, kopiere diesen Link:",
    },
    en: {
      title: existingUser ? `You're in!` : `Welcome to the Club`,
      subtitle: clubName,
      intro: needsPassword
        ? `Your membership at ${clubName} has been confirmed. Set your password now to unlock your dashboard.`
        : existingUser
        ? `You now have full access to ${clubName}. Your dashboard is waiting for you.`
        : `Your membership at ${clubName} has been successfully confirmed. Welcome to the community!`,
      linkNote: "This link is valid for 24 hours. Afterwards, use \"Forgot password\" to log in.",
      email_label: "YOUR EMAIL",
      cta: needsPassword ? "Activate Account" : "Go to Dashboard",
      fallback: "If the button doesn't work, copy this link:",
    },
    it: {
      title: existingUser ? `Sei dei nostri!` : `Benvenuto nel Club`,
      subtitle: clubName,
      intro: needsPassword
        ? `La tua iscrizione a ${clubName} è stata confermata. Imposta la tua password ora per sbloccare la tua dashboard.`
        : existingUser
        ? `Hai ora pieno accesso al club ${clubName}. La tua dashboard ti aspetta.`
        : `La tua iscrizione a ${clubName} è stata confermata con successo. Benvenuto nella community!`,
      linkNote: "Questo link è valido per 24 ore. Dopodiché usa \"Password dimenticata\" per accedere.",
      email_label: "LA TUA EMAIL",
      cta: needsPassword ? "Attiva Account" : "Vai alla Dashboard",
      fallback: "Se il bottone non funziona, copia questo link:",
    },
  }
  const d = copy[lang as "de" | "en" | "it"] || copy.de
  const href = magicLink || loginUrl

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
          {d.title}
        </h1>
        <p style={{ 
          fontSize: "18px", 
          fontWeight: "bold", 
          color: "#CBBF9A", 
          marginBottom: "24px",
          textTransform: "uppercase",
          letterSpacing: "0.1em"
        }}>
          {d.subtitle}
        </p>
        
        <p style={{ 
          fontSize: "16px", 
          color: "rgba(255,255,255,0.5)", 
          marginBottom: "40px",
          lineHeight: "1.6",
          padding: "0 20px"
        }}>
          {d.intro}
        </p>

        {/* Action Card */}
        <div style={{ 
          backgroundColor: "#0A0D0C", 
          borderRadius: "32px", 
          border: "1px solid rgba(255,255,255,0.08)",
          padding: "40px 32px",
          marginBottom: "32px"
        }}>
          <div style={{ marginBottom: "32px" }}>
             <div style={{ fontSize: "10px", fontWeight: "bold", letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", marginBottom: "8px" }}>
               {d.email_label}
             </div>
             <div style={{ fontSize: "18px", fontWeight: "bold", color: "#FFFFFF" }}>
               {email}
             </div>
          </div>

          <a
            href={href}
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
            {d.cta}
          </a>
        </div>

        {magicLink && (
          <div style={{ padding: "0 20px", marginBottom: "40px" }}>
             <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", lineHeight: "1.6" }}>
               {d.linkNote}
             </p>
          </div>
        )}

        {magicLink && (
          <div style={{ 
            fontSize: "10px", 
            color: "rgba(255,255,255,0.15)", 
            wordBreak: "break-all",
            padding: "0 40px"
          }}>
            <p style={{ marginBottom: "8px" }}>{d.fallback}</p>
            <a href={magicLink} style={{ color: "rgba(255,255,255,0.2)", textDecoration: "underline" }}>{magicLink}</a>
          </div>
        )}

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
