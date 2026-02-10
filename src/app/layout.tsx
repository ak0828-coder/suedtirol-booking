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

export const metadata: Metadata = {
  title: "Avaimo",
  description: "Die Vereinsplattform, die Verwaltung, Buchung und Finanzen automatisiert.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={`${sora.variable} ${jetbrainsMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
