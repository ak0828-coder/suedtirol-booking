import type { Metadata } from "next"
import { SiteHeader } from "@/components/marketing/site-header"
import { SiteFooter } from "@/components/marketing/site-footer"
import { getDictionary } from "@/lib/dictionaries"
import { createTranslator } from "@/lib/translator"

const BASE_URL = "https://avaimo.com"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  return {
    title: "Impressum – Avaimo",
    robots: { index: false, follow: false },
    alternates: { canonical: `${BASE_URL}/${lang}/impressum` },
  }
}

export default async function ImpressumPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang as any)
  const t = createTranslator(dict)

  return (
    <div className="min-h-screen bg-[#F9F8F4] text-[#0E1A14]">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-10 sm:py-12 space-y-6">
        <div className="text-xs uppercase tracking-[0.2em] text-[#1F3D2B]/70">{t("legal.imprint.badge")}</div>
        <h1 className="text-3xl font-semibold">{t("legal.imprint.title")}</h1>
        <p className="text-sm text-[#0E1A14]/70">{t("legal.imprint.placeholder")}</p>
      </main>
      <SiteFooter />
    </div>
  )
}
