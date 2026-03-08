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
    title: "Datenschutzerklärung – Avaimo",
    robots: { index: false, follow: false },
    alternates: { canonical: `${BASE_URL}/${lang}/datenschutz` },
  }
}

export default async function DatenschutzPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang as any)
  const t = createTranslator(dict)

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-slate-900">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-10 sm:py-12 space-y-6">
        <div className="text-xs uppercase tracking-wide text-slate-500">{t("legal.privacy.badge")}</div>
        <h1 className="text-3xl font-semibold">{t("legal.privacy.title")}</h1>
        <p className="text-sm text-slate-600">{t("legal.privacy.placeholder")}</p>
      </main>
      <SiteFooter />
    </div>
  )
}
