import React from "react"
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"

type ContractPdfProps = {
  clubName: string
  title: string
  body: string
  version: number
  updatedAt?: string | null
}

export function ContractPdfDocument({
  clubName,
  title,
  body,
  version,
  updatedAt,
}: ContractPdfProps) {
  const safeClubName = typeof clubName === "string" ? clubName : String(clubName ?? "")
  const safeTitle = typeof title === "string" ? title : String(title ?? "")
  const safeBody = typeof body === "string" ? body : String(body ?? "")
  const safeUpdatedAt = typeof updatedAt === "string" ? updatedAt : updatedAt ? String(updatedAt) : null

  const paragraphs = safeBody
    .split(/\r?\n/)
    .map((line) => String(line).trim())
    .filter((line) => line.length > 0)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.kicker}>Avaimo - Mitgliedschaft</Text>
          <Text style={styles.title}>{safeTitle}</Text>
          <Text style={styles.subTitle}>{safeClubName}</Text>
          <Text style={styles.meta}>
            Version {version} - {safeUpdatedAt || "-"}
          </Text>
        </View>

        <View style={styles.body}>
          {paragraphs.length === 0 ? (
            <Text style={styles.paragraph}>Kein Vertragstext hinterlegt.</Text>
          ) : (
            paragraphs.map((p, idx) => (
              <Text key={idx} style={styles.paragraph}>
                {p}
              </Text>
            ))
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Dieses Dokument wurde digital Über Avaimo erstellt.
          </Text>
        </View>
      </Page>
    </Document>
  )
}

const styles = StyleSheet.create({
  page: {
    fontSize: 12,
    padding: 40,
    fontFamily: "Helvetica",
    color: "#0f172a",
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 12,
  },
  kicker: {
    fontSize: 10,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#64748b",
    marginBottom: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 4,
  },
  subTitle: {
    fontSize: 12,
    color: "#475569",
    marginBottom: 6,
  },
  meta: {
    fontSize: 10,
    color: "#94a3b8",
  },
  body: {
    marginTop: 8,
    lineHeight: 1.6,
  },
  paragraph: {
    marginBottom: 8,
    lineHeight: 1.6,
  },
  footer: {
    marginTop: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  footerText: {
    fontSize: 9,
    color: "#94a3b8",
  },
})

