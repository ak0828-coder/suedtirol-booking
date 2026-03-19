import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import { defaultLocale, isLocale, locales } from "@/lib/i18n"
import { getDictionary } from "@/lib/dictionaries"
import { LocaleProvider } from "@/components/i18n/locale-provider"
import { Toaster } from "sonner"
import { CookieBanner } from "@/components/cookie-banner"

const BASE_URL = "https://avaimo.com"

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang: requestedLang } = await params
  const lang = isLocale(requestedLang) ? requestedLang : defaultLocale

  const ogLocale =
    lang === "de" ? "de_DE" : lang === "it" ? "it_IT" : "en_US"

  // Build hreflang alternates for all pages under this lang
  const alternateLanguages = Object.fromEntries(
    locales.map((l) => [
      l === "de" ? "de" : l === "it" ? "it" : "en",
      `${BASE_URL}/${l}`,
    ])
  )

  return {
    alternates: {
      canonical: `${BASE_URL}/${lang}`,
      languages: {
        ...alternateLanguages,
        "x-default": `${BASE_URL}/de`,
      },
    },
    openGraph: {
      locale: ogLocale,
    },
  }
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ lang: string }>
}>) {
  const { lang: requestedLang } = await params
  const lang = isLocale(requestedLang) ? requestedLang : defaultLocale
  const dictionary = await getDictionary(lang)

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <LocaleProvider dictionary={dictionary}>
        {children}
      </LocaleProvider>
      <Toaster richColors position="top-right" />
      <CookieBanner />
    </ThemeProvider>
  )
}
