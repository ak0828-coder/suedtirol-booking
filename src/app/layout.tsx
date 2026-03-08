import type { Metadata } from "next"
import { Sora, JetBrains_Mono } from "next/font/google"
import "./globals.css"

const sora = Sora({
  variable: "--font-sans",
  subsets: ["latin"],
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
})

const BASE_URL = "https://avaimo.com"

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Avaimo – Vereinsverwaltung für Sportvereine",
    template: "%s – Avaimo",
  },
  description:
    "Avaimo ist die All-in-One-Vereinsplattform für Sportvereine: Buchung, Mitglieder, Zahlungen, Verträge und Trainer in einem System. DSGVO-konform, in unter 48h startklar.",
  keywords: [
    "Vereinsverwaltung",
    "Sportvereins-Software",
    "Tennisclub-Software",
    "Platzbuchung",
    "Mitgliederverwaltung",
    "Vereinssoftware",
    "Buchungssystem Sport",
    "Südtirol",
    "DSGVO",
    "Stripe Zahlungen",
    "digitale Verträge",
    "Avaimo",
  ],
  authors: [{ name: "Avaimo", url: BASE_URL }],
  creator: "Avaimo",
  publisher: "Avaimo",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: "Avaimo",
    title: "Avaimo – Vereinsverwaltung für Sportvereine",
    description:
      "Buchung, Mitglieder, Zahlungen und Verträge in einem System. Speziell für Tennis- und Sportvereine.",
    url: BASE_URL,
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Avaimo – Vereinsverwaltung für Sportvereine",
      },
    ],
    locale: "de_DE",
    alternateLocale: ["it_IT", "en_US"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Avaimo – Vereinsverwaltung für Sportvereine",
    description:
      "Buchung, Mitglieder, Zahlungen und Verträge in einem System.",
    images: [`${BASE_URL}/og-image.png`],
  },
  category: "Software",
  applicationName: "Avaimo",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#1F3D2B" />
        <meta name="color-scheme" content="light" />
        {/* AI crawler hints */}
        <link rel="alternate" type="text/plain" href="/llms.txt" title="LLMs.txt" />
        <link rel="alternate" type="text/plain" href="/llms-full.txt" title="LLMs Full Content" />
      </head>
      <body className={`${sora.variable} ${jetbrainsMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
