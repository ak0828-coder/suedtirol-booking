import type { Metadata } from "next"
import Link from "next/link"
import { SiteHeader } from "@/components/marketing/site-header"
import { SiteFooter } from "@/components/marketing/site-footer"
import { Check, ArrowRight } from "lucide-react"
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
    de: "Preise – Avaimo Vereinsverwaltung",
    it: "Prezzi – Avaimo Gestione Club",
    en: "Pricing – Avaimo Sports Club Management",
  }
  const descriptions: Record<string, string> = {
    de: "Transparente Preise für Sportvereine jeder Größe. Starter, Pro und Enterprise – mit kostenloser Demo ohne Kreditkarte.",
    it: "Prezzi trasparenti per club sportivi di ogni dimensione. Starter, Pro ed Enterprise – con demo gratuita senza carta di credito.",
    en: "Transparent pricing for sports clubs of all sizes. Starter, Pro and Enterprise – with free demo, no credit card required.",
  }

  const title = titles[lang] ?? titles.de
  const description = descriptions[lang] ?? descriptions.de

  return {
    title,
    description,
    alternates: { canonical: `${BASE_URL}/${lang}/pricing` },
    openGraph: { title, description, url: `${BASE_URL}/${lang}/pricing` },
  }
}

export default async function PricingPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang as any)
  const t = createTranslator(dict)
  const tiers = [
    {
      name: t("pricing.tiers.starter.name"),
      price: t("pricing.tiers.starter.price"),
      description: t("pricing.tiers.starter.desc"),
      features: [
        t("pricing.tiers.starter.features.0"),
        t("pricing.tiers.starter.features.1"),
        t("pricing.tiers.starter.features.2"),
        t("pricing.tiers.starter.features.3"),
      ],
      isPro: false,
    },
    {
      name: t("pricing.tiers.pro.name"),
      price: t("pricing.tiers.pro.price"),
      description: t("pricing.tiers.pro.desc"),
      features: [
        t("pricing.tiers.pro.features.0"),
        t("pricing.tiers.pro.features.1"),
        t("pricing.tiers.pro.features.2"),
        t("pricing.tiers.pro.features.3"),
      ],
      isPro: true,
    },
    {
      name: t("pricing.tiers.enterprise.name"),
      price: t("pricing.tiers.enterprise.price"),
      description: t("pricing.tiers.enterprise.desc"),
      features: [
        t("pricing.tiers.enterprise.features.0"),
        t("pricing.tiers.enterprise.features.1"),
        t("pricing.tiers.enterprise.features.2"),
        t("pricing.tiers.enterprise.features.3"),
      ],
      isPro: false,
    },
  ]

  const addOns = [
    t("pricing.addons.0"),
    t("pricing.addons.1"),
    t("pricing.addons.2"),
  ]

  return (
    <div className="min-h-screen bg-[#F9F8F4] text-[#0E1A14]">
      <BreadcrumbSchema items={[
        { name: "Avaimo", url: "https://avaimo.com" },
        { name: "Pricing", url: `https://avaimo.com/${lang}/pricing` },
      ]} />
      <SiteHeader />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-12 sm:pt-20 pb-8 sm:pb-12">
        <div className="max-w-2xl">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1F3D2B]/70 mb-3">
            {t("pricing.hero.badge")}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight mb-4">
            {t("pricing.hero.title")}
          </h1>
          <p className="text-base sm:text-lg text-[#0E1A14]/65 leading-relaxed">
            {t("pricing.hero.subtitle")}
          </p>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-16 sm:pb-24">
        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl sm:rounded-3xl border p-6 sm:p-8 flex flex-col transition-shadow ${
                tier.isPro
                  ? "border-[#CBBF9A] bg-white shadow-[0_24px_64px_-32px_rgba(14,26,20,0.18)]"
                  : "border-[#1F3D2B]/12 bg-white/90 shadow-sm hover:shadow-md"
              }`}
            >
              {tier.isPro && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center rounded-full bg-[#1F3D2B] px-4 py-1 text-xs font-semibold text-[#CBBF9A] shadow-sm">
                    Empfohlen
                  </span>
                </div>
              )}

              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.15em] text-[#1F3D2B]/70 mb-2">
                  {tier.name}
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-[#0E1A14] mb-1">
                  {tier.price}
                </div>
                <p className="text-sm text-[#0E1A14]/60 mb-6">{tier.description}</p>

                <div className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2.5">
                      <div className={`mt-0.5 h-4.5 w-4.5 rounded-full flex items-center justify-center flex-shrink-0 ${tier.isPro ? "bg-[#1F3D2B]" : "bg-[#1F3D2B]/10"}`}>
                        <Check className={`h-2.5 w-2.5 ${tier.isPro ? "text-[#CBBF9A]" : "text-[#1F3D2B]"}`} />
                      </div>
                      <span className="text-sm text-[#0E1A14]/75">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-auto">
                <Link
                  href={`/${lang}/contact`}
                  className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition-all ${
                    tier.isPro
                      ? "bg-[#1F3D2B] text-[#F9F8F4] hover:bg-[#162e1f] shadow-[0_8px_24px_-8px_rgba(31,61,43,0.5)]"
                      : "bg-[#0E1A14]/6 text-[#0E1A14] hover:bg-[#0E1A14]/10"
                  }`}
                >
                  {t("pricing.cta")} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Add-ons */}
        <div className="mt-8 sm:mt-12 rounded-2xl sm:rounded-3xl border border-[#1F3D2B]/12 bg-white/90 p-6 sm:p-8">
          <div className="text-sm font-semibold text-[#1F3D2B] mb-1">{t("pricing.addons_title")}</div>
          <p className="text-sm text-[#0E1A14]/65 mb-5">{t("pricing.addons_subtitle")}</p>
          <div className="flex flex-wrap gap-2.5">
            {addOns.map((item) => (
              <div
                key={item}
                className="rounded-full border border-[#1F3D2B]/15 bg-[#F9F8F4] px-4 py-2 text-sm text-[#0E1A14]/80"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
