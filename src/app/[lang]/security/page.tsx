import type { Metadata } from "next"
import { SiteHeader } from "@/components/marketing/site-header"
import { SiteFooter } from "@/components/marketing/site-footer"
import { ShieldCheck, Lock, Server, FileCheck, ArrowRight } from "lucide-react"
import { getDictionary } from "@/lib/dictionaries"
import { createTranslator } from "@/lib/translator"
import Link from "next/link"
import { BreadcrumbSchema } from "@/components/seo/structured-data"

const BASE_URL = "https://avaimo.com"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params

  const titles: Record<string, string> = {
    de: "Sicherheit & Datenschutz – Avaimo",
    it: "Sicurezza e Privacy – Avaimo",
    en: "Security & Privacy – Avaimo",
  }
  const descriptions: Record<string, string> = {
    de: "Avaimo ist DSGVO-konform: EU-Datenhaltung, Row Level Security, Stripe PCI-DSS, HTTPS/HSTS und Cookie-Consent. Ihre Daten sind sicher.",
    it: "Avaimo è conforme al GDPR: dati nell'UE, Row Level Security, Stripe PCI-DSS, HTTPS/HSTS e consenso cookie. I vostri dati sono al sicuro.",
    en: "Avaimo is GDPR-compliant: EU data storage, Row Level Security, Stripe PCI-DSS, HTTPS/HSTS and cookie consent. Your data is safe.",
  }

  const title = titles[lang] ?? titles.de
  const description = descriptions[lang] ?? descriptions.de

  return {
    title,
    description,
    alternates: { canonical: `${BASE_URL}/${lang}/security` },
    openGraph: { title, description, url: `${BASE_URL}/${lang}/security` },
  }
}

export default async function SecurityPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang as any)
  const t = createTranslator(dict)
  const items = [
    {
      title: t("security.items.gdpr.title"),
      icon: ShieldCheck,
      text: t("security.items.gdpr.text"),
    },
    {
      title: t("security.items.access.title"),
      icon: Lock,
      text: t("security.items.access.text"),
    },
    {
      title: t("security.items.infrastructure.title"),
      icon: Server,
      text: t("security.items.infrastructure.text"),
    },
    {
      title: t("security.items.contracts.title"),
      icon: FileCheck,
      text: t("security.items.contracts.text"),
    },
  ]

  return (
    <div className="min-h-screen bg-[#F9F8F4] text-[#0E1A14]">
      <BreadcrumbSchema items={[
        { name: "Avaimo", url: "https://avaimo.com" },
        { name: "Sicherheit", url: `https://avaimo.com/${lang}/security` },
      ]} />
      <SiteHeader />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-12 sm:pt-20 pb-8 sm:pb-12">
        <div className="max-w-2xl">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1F3D2B]/70 mb-3">
            {t("security.hero.badge")}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight mb-4">
            {t("security.hero.title")}
          </h1>
          <p className="text-base sm:text-lg text-[#0E1A14]/65 leading-relaxed mb-6">
            {t("security.hero.subtitle")}
          </p>
          <Link
            href={`/${lang}/contact`}
            className="inline-flex items-center gap-2 rounded-full border border-[#1F3D2B]/25 px-5 py-2.5 text-sm font-medium text-[#1F3D2B] hover:bg-[#1F3D2B]/5 transition-colors"
          >
            Kontakt aufnehmen <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* Security items */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-16 sm:pb-24">
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl sm:rounded-3xl border border-[#1F3D2B]/10 bg-white/90 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="inline-flex items-center justify-center h-10 w-10 rounded-2xl bg-[#1F3D2B]/8 mb-4">
                <item.icon className="h-5 w-5 text-[#1F3D2B]" />
              </div>
              <div className="font-semibold text-[#0E1A14] mb-2">{item.title}</div>
              <p className="text-sm text-[#0E1A14]/65 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
