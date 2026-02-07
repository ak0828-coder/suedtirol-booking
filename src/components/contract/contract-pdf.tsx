import React from "react"
import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer"

export type ContractData = {
  clubName: string
  clubLogoUrl?: string | null
  clubAddress?: string | null
  contractTitle?: string | null
  memberName: string
  memberAddress: string
  memberEmail: string
  memberPhone: string
  contractText: string
  signatureUrl?: string | null
  signedAt: string
  signedCity: string
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 11,
    lineHeight: 1.5,
    color: "#111827",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 16,
  },
  logo: {
    width: 64,
    height: 64,
    objectFit: "contain",
  },
  clubInfo: {
    textAlign: "right",
    fontSize: 9,
    color: "#6b7280",
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 16,
    color: "#111827",
  },
  memberBlock: {
    marginBottom: 24,
    backgroundColor: "#f9fafb",
    padding: 10,
    borderRadius: 4,
  },
  memberLabel: {
    fontSize: 9,
    color: "#9ca3af",
    marginBottom: 4,
  },
  memberName: {
    fontWeight: 700,
    marginBottom: 2,
  },
  textBlock: {
    marginBottom: 10,
    textAlign: "justify",
  },
  signatureSection: {
    marginTop: 40,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureBox: {
    width: "45%",
    borderTopWidth: 1,
    borderTopColor: "#111827",
    paddingTop: 8,
    minHeight: 70,
  },
  signatureImage: {
    width: 160,
    height: 60,
    objectFit: "contain",
    position: "absolute",
    top: -48,
    left: 0,
  },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 40,
    right: 40,
    fontSize: 8,
    textAlign: "center",
    color: "#9ca3af",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 8,
  },
})

export function ContractPDF({ data }: { data: ContractData }) {
  const normalized = {
    clubName: data?.clubName || "",
    clubLogoUrl:
      typeof data?.clubLogoUrl === "string" && data.clubLogoUrl.trim()
        ? data.clubLogoUrl
        : null,
    clubAddress: data?.clubAddress || "",
    contractTitle: data?.contractTitle || "Mitgliedsvertrag",
    memberName: data?.memberName || "",
    memberAddress: data?.memberAddress || "",
    memberEmail: data?.memberEmail || "",
    memberPhone: data?.memberPhone || "",
    contractText: typeof data?.contractText === "string" ? data.contractText : "",
    signatureUrl:
      typeof data?.signatureUrl === "string" && data.signatureUrl.trim()
        ? data.signatureUrl
        : null,
    signedAt: data?.signedAt || "",
    signedCity: data?.signedCity || "",
  }

  const paragraphs = normalized.contractText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            {normalized.clubLogoUrl ? (
              <Image src={normalized.clubLogoUrl} style={styles.logo} />
            ) : (
              <Text style={{ fontSize: 18, fontWeight: 700 }}>{normalized.clubName}</Text>
            )}
          </View>
          <View style={styles.clubInfo}>
            <Text style={{ fontWeight: 700 }}>{normalized.clubName}</Text>
            {normalized.clubAddress ? <Text>{normalized.clubAddress}</Text> : null}
          </View>
        </View>

        <Text style={styles.title}>{normalized.contractTitle}</Text>

        <View style={styles.memberBlock}>
          <Text style={styles.memberLabel}>Vertragspartner (Mitglied)</Text>
          <Text style={styles.memberName}>{normalized.memberName}</Text>
          <Text>{normalized.memberAddress}</Text>
          <Text>
            {normalized.memberEmail} · {normalized.memberPhone}
          </Text>
        </View>

        <View>
          {paragraphs.length === 0 ? (
            <Text style={styles.textBlock}>Kein Vertragstext hinterlegt.</Text>
          ) : (
            paragraphs.map((line, idx) => (
              <Text key={idx} style={styles.textBlock}>
                {line}
              </Text>
            ))
          )}
        </View>

        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Text style={{ fontSize: 9 }}>Für den Verein ({normalized.clubName})</Text>
          </View>
          <View style={styles.signatureBox}>
            {normalized.signatureUrl ? <Image src={normalized.signatureUrl} style={styles.signatureImage} /> : null}
            <Text style={{ fontSize: 9 }}>
              {normalized.signedCity}, am {normalized.signedAt}
            </Text>
            <Text style={{ fontSize: 9, fontWeight: 700 }}>{normalized.memberName}</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Dieses Dokument wurde digital über Avaimo erstellt am {normalized.signedAt}.
        </Text>
      </Page>
    </Document>
  )
}
