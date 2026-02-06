import * as React from "react"
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Button,
} from "@react-email/components"

type WelcomeImportEmailProps = {
  firstName: string
  clubName: string
  tempPassword: string
  loginUrl: string
  email: string
}

export function WelcomeImportEmailTemplate({
  firstName,
  clubName,
  tempPassword,
  loginUrl,
  email,
}: WelcomeImportEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Dein Avaimo Zugang für {clubName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Willkommen bei Avaimo</Heading>
          <Text style={text}>Hallo {firstName || "Mitglied"},</Text>
          <Text style={text}>
            Der Verein <strong>{clubName}</strong> ist ab sofort auf Avaimo.
            Dein Account wurde bereits vorbereitet – du musst dich nur einmal einloggen
            und dein Passwort ändern.
          </Text>

          <Section style={box}>
            <Text style={label}>Deine E-Mail</Text>
            <Text style={value}>{email}</Text>
            <Text style={label}>Vorläufiges Passwort</Text>
            <Text style={code}>{tempPassword}</Text>
          </Section>

          <Button style={button} href={loginUrl}>
            Jetzt einloggen & Passwort ändern
          </Button>

          <Text style={footer}>
            Bitte ändere dein Passwort direkt nach dem ersten Login.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = { backgroundColor: "#ffffff", fontFamily: "Arial, sans-serif" }
const container = { margin: "0 auto", padding: "24px 0 48px", maxWidth: "560px" }
const h1 = { fontSize: "24px", fontWeight: "700", color: "#0f172a" }
const text = { fontSize: "16px", lineHeight: "26px", color: "#334155" }
const box = {
  padding: "20px",
  backgroundColor: "#f8fafc",
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
  margin: "20px 0",
}
const label = { fontSize: "12px", textTransform: "uppercase" as const, color: "#64748b", marginBottom: "6px" }
const value = { fontSize: "16px", fontWeight: "600", color: "#0f172a", marginBottom: "12px" }
const code = { fontSize: "22px", fontWeight: "700", letterSpacing: "2px", color: "#0f172a" }
const button = {
  display: "block",
  backgroundColor: "#0f172a",
  color: "#ffffff",
  textDecoration: "none",
  padding: "12px 20px",
  borderRadius: "10px",
  textAlign: "center" as const,
  fontWeight: "600",
  marginTop: "24px",
}
const footer = { fontSize: "12px", color: "#94a3b8", marginTop: "24px" }
