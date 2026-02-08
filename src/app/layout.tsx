import type { Metadata } from "next";
import { Sora, Fraunces } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Avaimo",
  description: "Die Vereinsplattform, die Verwaltung, Buchung und Finanzen automatisiert.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={`${sora.variable} ${fraunces.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
