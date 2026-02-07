import React from "react"
import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer"

export type ContractData = {
  clubName: string
  clubLogoUrl?: string | null
  clubAddress?: string | null
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
  const paragraphs = data.contractText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            {data.clubLogoUrl ? (
              <Image src={data.clubLogoUrl} style={styles.logo} />
            ) : (
              <Text style={{ fontSize: 18, fontWeight: 700 }}>{data.clubName}</Text>
            )}
          </View>
          <View style={styles.clubInfo}>
            <Text style={{ fontWeight: 700 }}>{data.clubName}</Text>
            {data.clubAddress ? <Text>{data.clubAddress}</Text> : null}
          </View>
        </View>

        <Text style={styles.title}>Mitgliedsvertrag</Text>

        <View style={styles.memberBlock}>
          <Text style={styles.memberLabel}>Vertragspartner (Mitglied)</Text>
          <Text style={styles.memberName}>{data.memberName}</Text>
          <Text>{data.memberAddress}</Text>
          <Text>
            {data.memberEmail} · {data.memberPhone}
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
            <Text style={{ fontSize: 9 }}>Für den Verein ({data.clubName})</Text>
          </View>
          <View style={styles.signatureBox}>
            {data.signatureUrl ? <Image src={data.signatureUrl} style={styles.signatureImage} /> : null}
            <Text style={{ fontSize: 9 }}>
              {data.signedCity}, am {data.signedAt}
            </Text>
            <Text style={{ fontSize: 9, fontWeight: 700 }}>{data.memberName}</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Dieses Dokument wurde digital über Avaimo erstellt am {data.signedAt}.
        </Text>
      </Page>
    </Document>
  )
}
