import * as React from "react"

export function WelcomeImportEmailTemplate({
  clubName,
  email,
  password,
  loginUrl,
  lang = "de",
}: {
  clubName: string
  email: string
  password: string
  loginUrl: string
  lang?: string
}) {
  const copy = {
    de: {
      preview: `Dein Avaimo Zugang für ${clubName}`,
      title: `Willkommen im Club`,
      subtitle: clubName,
      intro: "Du wurdest vom Verein importiert. Bitte logge dich ein und ändere dein Passwort direkt nach dem ersten Login.",
      email_label: "DEINE E-MAIL",
      password_label: "VORLÄUFIGES PASSWORT",
      cta: "Konto aktivieren",
      hint: "Aus Sicherheitsgründen solltest du dein Passwort sofort nach dem ersten Login ändern.",
    },
    en: {
      preview: `Your Avaimo access for ${clubName}`,
      title: `Welcome to the Club`,
      subtitle: clubName,
      intro: "You were imported by the club. Please sign in and change your password directly after the first login.",
      email_label: "YOUR EMAIL",
      password_label: "TEMPORARY PASSWORD",
      cta: "Activate Account",
      hint: "For security reasons, please change your password immediately after your first login.",
    },
    it: {
      preview: `Accesso Avaimo per ${clubName}`,
      title: `Benvenuto nel Club`,
      subtitle: clubName,
      intro: "Sei stato importato dal club. Accedi e modifica la password direttamente dopo il primo accesso.",
      email_label: "LA TUA EMAIL",
      password_label: "PASSWORD TEMPORANEA",
      cta: "Attiva Account",
      hint: "Per motivi di sicurezza, ti preghiamo di cambiare la password immediatamente dopo il primo accesso.",
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
          fontSize: "18px", 
          fontWeight: "bold", 
          color: "#CBBF9A", 
          marginBottom: "24px",
          textTransform: "uppercase",
          letterSpacing: "0.1em"
        }}>
          {dict.subtitle}
        </p>
        
        <p style={{ 
          fontSize: "16px", 
          color: "rgba(255,255,255,0.5)", 
          marginBottom: "40px",
          lineHeight: "1.6",
          padding: "0 20px"
        }}>
          {dict.intro}
        </p>

        {/* Credentials Card */}
        <div style={{ 
          backgroundColor: "#0A0D0C", 
          borderRadius: "32px", 
          border: "1px solid rgba(255,255,255,0.08)",
          padding: "40px 32px",
          marginBottom: "32px",
          textAlign: "left"
        }}>
          <div style={{ marginBottom: "24px" }}>
             <div style={{ fontSize: "10px", fontWeight: "bold", letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", marginBottom: "8px" }}>
               {dict.email_label}
             </div>
             <div style={{ fontSize: "16px", fontWeight: "bold", color: "#FFFFFF" }}>
               {email}
             </div>
          </div>

          <div style={{ marginBottom: "32px", padding: "16px", borderRadius: "16px", background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.1)" }}>
             <div style={{ fontSize: "10px", fontWeight: "bold", letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", marginBottom: "8px" }}>
               {dict.password_label}
             </div>
             <div style={{ fontSize: "18px", fontWeight: "bold", color: "#CBBF9A", fontFamily: "monospace", letterSpacing: "0.05em" }}>
               {password}
             </div>
          </div>

          <a
            href={loginUrl}
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

        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", lineHeight: "1.6", padding: "0 20px" }}>
          {dict.hint}
        </p>

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
