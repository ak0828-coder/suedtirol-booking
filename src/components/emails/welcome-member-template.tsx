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
      title: existingUser ? `Du wurdest zu ${clubName} hinzugefügt!` : `Willkommen im ${clubName}!`,
      intro: needsPassword
        ? `Deine Mitgliedschaft wurde bestätigt. Klicke auf den Button, um dein Passwort festzulegen und dich einzuloggen.`
        : existingUser
        ? `Du hast nun Zugang zum Verein ${clubName}. Klicke auf den Button, um dich einzuloggen.`
        : "Deine Mitgliedschaft wurde erfolgreich bestätigt. Klicke auf den Button, um dich einzuloggen.",
      linkNote: "Dieser Link ist 24 Stunden gültig. Danach kannst du dich mit „Passwort vergessen" anmelden.",
      email_label: "E-Mail",
      cta: needsPassword ? "Passwort festlegen & einloggen" : "Jetzt einloggen",
      fallback: "Falls der Button nicht funktioniert, kopiere diesen Link:",
    },
    en: {
      title: existingUser ? `You've been added to ${clubName}!` : `Welcome to ${clubName}!`,
      intro: needsPassword
        ? "Your membership has been confirmed. Click the button to set your password and log in."
        : existingUser
        ? `You now have access to ${clubName}. Click the button to log in.`
        : "Your membership has been confirmed. Click the button to log in.",
      linkNote: "This link is valid for 24 hours. Afterwards, use \"Forgot password\" to log in.",
      email_label: "Email",
      cta: needsPassword ? "Set password & log in" : "Log in now",
      fallback: "If the button doesn't work, copy this link:",
    },
    it: {
      title: existingUser ? `Sei stato aggiunto a ${clubName}!` : `Benvenuto in ${clubName}!`,
      intro: needsPassword
        ? "La tua iscrizione è stata confermata. Clicca il bottone per impostare la password e accedere."
        : existingUser
        ? `Hai ora accesso al club ${clubName}. Clicca il bottone per accedere.`
        : "La tua iscrizione è stata confermata. Clicca il bottone per accedere.",
      linkNote: "Questo link è valido per 24 ore. Dopodiché usa \"Password dimenticata\" per accedere.",
      email_label: "Email",
      cta: needsPassword ? "Imposta password e accedi" : "Accedi ora",
      fallback: "Se il bottone non funziona, copia questo link:",
    },
  }
  const d = copy[lang as "de" | "en" | "it"] || copy.de
  const href = magicLink || loginUrl

  return (
    <div style={{ fontFamily: "Arial, sans-serif", color: "#0f172a", maxWidth: 520, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, marginBottom: 8, fontWeight: 700 }}>{d.title}</h1>
      <p style={{ fontSize: 14, color: "#475569", marginBottom: 16 }}>{d.intro}</p>

      <div style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: 8, marginBottom: 20, fontSize: 13 }}>
        <strong>{d.email_label}:</strong> {email}
      </div>

      <a
        href={href}
        style={{
          display: "inline-block",
          padding: "12px 24px",
          background: "#0f172a",
          color: "white",
          borderRadius: 999,
          textDecoration: "none",
          fontSize: 14,
          fontWeight: 600,
          marginBottom: 20,
        }}
      >
        {d.cta}
      </a>

      {magicLink && (
        <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 4, marginBottom: 8 }}>
          {d.linkNote}
        </p>
      )}

      {magicLink && (
        <p style={{ fontSize: 11, color: "#cbd5e1" }}>
          {d.fallback}<br />
          <span style={{ wordBreak: "break-all" }}>{magicLink}</span>
        </p>
      )}
    </div>
  )
}
