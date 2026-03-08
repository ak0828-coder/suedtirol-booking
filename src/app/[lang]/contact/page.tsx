import type { Metadata } from "next"
import Link from "next/link"
import { SiteHeader } from "@/components/marketing/site-header"
import { SiteFooter } from "@/components/marketing/site-footer"
import { Mail, MonitorPlay, ArrowRight } from "lucide-react"
import { getDictionary } from "@/lib/dictionaries"
import { createTranslator } from "@/lib/translator"
import { BreadcrumbSchema } from "@/components/seo/structured-data"

const BASE_URL = "https://avaimo.com"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params

  const titles: Record<string, string> = {
    de: "Kontakt – Avaimo",
    it: "Contatto – Avaimo",
    en: "Contact – Avaimo",
  }
  const descriptions: Record<string, string> = {
    de: "Kontaktieren Sie Avaimo für eine Demo oder Beratung. Schreiben Sie uns an info@avaimo.com oder starten Sie direkt mit der interaktiven Demo.",
    it: "Contattate Avaimo per una demo o consulenza. Scrivete a info@avaimo.com o iniziate con la demo interattiva.",
    en: "Contact Avaimo for a demo or consultation. Write to info@avaimo.com or start with the interactive demo.",
  }

  const title = titles[lang] ?? titles.de
  const description = descriptions[lang] ?? descriptions.de

  return {
    title,
    description,
    alternates: { canonical: `${BASE_URL}/${lang}/contact` },
    openGraph: { title, description, url: `${BASE_URL}/${lang}/contact` },
  }
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang as any)
  const t = createTranslator(dict)

  return (
    <div className="min-h-screen bg-[#F9F8F4] text-[#0E1A14]">
      <BreadcrumbSchema items={[
        { name: "Avaimo", url: "https://avaimo.com" },
        { name: "Kontakt", url: `https://avaimo.com/${lang}/contact` },
      ]} />
      <SiteHeader />

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 pt-12 sm:pt-20 pb-8 sm:pb-12">
        <div className="max-w-xl">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1F3D2B]/70 mb-3">
            {t("contact.hero.badge")}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight mb-4">
            {t("contact.hero.title")}
          </h1>
          <p className="text-base sm:text-lg text-[#0E1A14]/65 leading-relaxed">
            {t("contact.hero.subtitle")}
          </p>
        </div>
      </section>

      {/* Contact cards */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-16 sm:pb-24">
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
          {/* Email card */}
          <div className="rounded-2xl sm:rounded-3xl border border-[#1F3D2B]/12 bg-white p-6 sm:p-8 flex flex-col gap-5 shadow-sm">
            <div className="inline-flex items-center justify-center h-11 w-11 rounded-2xl bg-[#1F3D2B]/8">
              <Mail className="h-5 w-5 text-[#1F3D2B]" />
            </div>
            <div>
              <div className="font-semibold text-[#0E1A14] mb-2">{t("contact.cards.demo.title")}</div>
              <p className="text-sm text-[#0E1A14]/65 leading-relaxed">{t("contact.cards.demo.desc")}</p>
            </div>
            <div className="mt-auto">
              <a
                href="mailto:info@avaimo.com"
                className="inline-flex items-center gap-2 rounded-full bg-[#1F3D2B] px-5 py-2.5 text-sm font-medium text-[#F9F8F4] hover:bg-[#162e1f] transition-colors shadow-[0_8px_24px_-8px_rgba(31,61,43,0.4)]"
              >
                info@avaimo.com <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Demo card */}
          <div className="rounded-2xl sm:rounded-3xl border border-[#CBBF9A]/60 bg-white p-6 sm:p-8 flex flex-col gap-5 shadow-sm">
            <div className="inline-flex items-center justify-center h-11 w-11 rounded-2xl bg-[#CBBF9A]/15">
              <MonitorPlay className="h-5 w-5 text-[#1F3D2B]" />
            </div>
            <div>
              <div className="font-semibold text-[#0E1A14] mb-2">{t("contact.cards.live.title")}</div>
              <p className="text-sm text-[#0E1A14]/65 leading-relaxed">{t("contact.cards.live.desc")}</p>
            </div>
            <div className="mt-auto">
              <Link
                href={`/${lang}/demo`}
                className="inline-flex items-center gap-2 rounded-full border border-[#1F3D2B]/25 px-5 py-2.5 text-sm font-medium text-[#1F3D2B] hover:bg-[#1F3D2B]/5 transition-colors"
              >
                {t("contact.cards.live.cta")} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
