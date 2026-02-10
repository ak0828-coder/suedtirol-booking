import * as React from "react"
import { Preview } from "@react-email/preview"
import { Text } from "@react-email/text"
import { Button } from "@react-email/button"
import { Hr } from "@react-email/hr"

const label = {
  fontSize: "12px",
  color: "#64748b",
  textTransform: "uppercase" as const,
  letterSpacing: "0.1em",
  marginBottom: "4px",
}

const card = {
  backgroundColor: "#f8fafc",
  borderRadius: "12px",
  padding: "16px",
  marginBottom: "16px",
}

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
      title: `Willkommen bei ${clubName}!`,
      intro: "Du wurdest vom Verein importiert. Bitte logge dich ein und ändere dein Passwort.",
      email: "E-Mail",
      password: "Vorläufiges Passwort",
      cta: "Jetzt einloggen & Passwort ändern",
      hint: "Bitte ändere dein Passwort direkt nach dem ersten Login.",
    },
    en: {
      preview: `Your Avaimo access for ${clubName}`,
      title: `Welcome to ${clubName}!`,
      intro: "You were imported by the club. Please sign in and change your password.",
      email: "Email",
      password: "Temporary password",
      cta: "Log in & change password",
      hint: "Please change your password after the first login.",
    },
    it: {
      preview: `Accesso Avaimo per ${clubName}`,
      title: `Benvenuto in ${clubName}!`,
      intro: "Sei stato importato dal club. Accedi e modifica la password.",
      email: "Email",
      password: "Password temporanea",
      cta: "Accedi & cambia password",
      hint: "Cambia la password dopo il primo accesso.",
    },
  }
  const dict = copy[lang as "de" | "en" | "it"] || copy.de

  return (
    <div style={{ fontFamily: "Arial, sans-serif", color: "#0f172a" }}>
      <Preview>{dict.preview}</Preview>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>{dict.title}</h1>
      <Text style={{ fontSize: 14, marginBottom: 12 }}>{dict.intro}</Text>
      <div style={card}>
        <Text style={label}>{dict.email}</Text>
        <Text style={{ marginTop: 0 }}>{email}</Text>
        <Text style={{ ...label, marginTop: 12 }}>{dict.password}</Text>
        <Text style={{ marginTop: 0 }}>{password}</Text>
      </div>
      <Button
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
      </Button>
      <Hr style={{ margin: "20px 0", borderColor: "#e2e8f0" }} />
      <Text style={{ fontSize: 12, color: "#64748b" }}>{dict.hint}</Text>
    </div>
  )
}
