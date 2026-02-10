import * as React from "react"

export function WelcomeMemberEmailTemplate({
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
      title: `Willkommen im ${clubName}!`,
      intro: "Deine Mitgliedschaft wurde erfolgreich bestätigt.",
      login: "Bitte logge dich ein und ändere dein Passwort.",
      email: "E-Mail",
      password: "Passwort",
      cta: "Jetzt einloggen",
    },
    en: {
      title: `Welcome to ${clubName}!`,
      intro: "Your membership has been confirmed.",
      login: "Please sign in and change your password.",
      email: "Email",
      password: "Password",
      cta: "Log in now",
    },
    it: {
      title: `Benvenuto in ${clubName}!`,
      intro: "La tua iscrizione è stata confermata.",
      login: "Accedi e modifica la password.",
      email: "Email",
      password: "Password",
      cta: "Accedi ora",
    },
  }
  const dict = copy[lang as "de" | "en" | "it"] || copy.de

  return (
    <div style={{ fontFamily: "Arial, sans-serif", color: "#0f172a" }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>{dict.title}</h1>
      <p style={{ fontSize: 14, marginBottom: 12 }}>{dict.intro}</p>
      <p style={{ fontSize: 14, marginBottom: 12 }}>{dict.login}</p>
      <div style={{ background: "#f8fafc", padding: 12, borderRadius: 8, marginBottom: 16 }}>
        <p style={{ margin: 0 }}><strong>{dict.email}:</strong> {email}</p>
        <p style={{ margin: 0 }}><strong>{dict.password}:</strong> {password}</p>
      </div>
      <a
        href={loginUrl}
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
    </div>
  )
}
