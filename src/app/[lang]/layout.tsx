import type { Metadata } from "next";
import { Sora, JetBrains_Mono } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TourShell } from "@/components/tours/tour-shell";
import { defaultLocale, isLocale, locales } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { LocaleProvider } from "@/components/i18n/locale-provider";

const sora = Sora({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Avaimo",
  description: "Die Vereinsplattform, die Verwaltung, Buchung und Finanzen automatisiert.",
};

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { lang: string };
}>) {
  const lang = isLocale(params.lang) ? params.lang : defaultLocale;
  const dictionary = await getDictionary(lang);
  return (
    <html lang={lang} suppressHydrationWarning>
      <body className={`${sora.variable} ${jetbrainsMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LocaleProvider dictionary={dictionary}>
            <TourShell>{children}</TourShell>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
