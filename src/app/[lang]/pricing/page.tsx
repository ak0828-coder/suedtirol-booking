import Link from "next/link"
import { SiteHeader } from "@/components/marketing/site-header"
import { SiteFooter } from "@/components/marketing/site-footer"
import { Check } from "lucide-react"
import { getDictionary } from "@/lib/dictionaries"
import { createTranslator } from "@/lib/translator"

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
    },
  ]

  const addOns = [
    t("pricing.addons.0"),
    t("pricing.addons.1"),
    t("pricing.addons.2"),
  ]

  return (
    <div className="min-h-screen bg-[#F9F8F4] text-[#0E1A14]">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-12 space-y-12">
        <section className="space-y-4">
          <div className="text-xs uppercase tracking-[0.2em] text-[#1F3D2B]/70">{t("pricing.hero.badge")}</div>
          <h1 className="text-4xl font-semibold">{t("pricing.hero.title")}</h1>
          <p className="text-[#0E1A14]/70 max-w-3xl">{t("pricing.hero.subtitle")}</p>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {tiers.map((tier) => {
            const isPro = tier.name === t("pricing.tiers.pro.name")
            return (
              <div
                key={tier.name}
                className={`rounded-3xl border p-6 shadow-sm ${
                  isPro
                    ? "border-[#CBBF9A] bg-white/95 shadow-[0_20px_60px_-40px_rgba(14,26,20,0.8)]"
                    : "border-[#1F3D2B]/15 bg-white/90"
                }`}
              >
                <div className="text-sm font-semibold text-[#1F3D2B]">{tier.name}</div>
                <div className="mt-2 text-2xl font-semibold">{tier.price}</div>
                <p className="mt-2 text-sm text-[#0E1A14]/70">{tier.description}</p>
                <div className="mt-4 space-y-2 text-sm text-[#0E1A14]/70">
                  {tier.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#1F3D2B]" /> {feature}
                    </div>
                  ))}
                </div>
                <Link
                  href={`/${lang}/contact`}
                  className={`mt-6 inline-flex w-full items-center justify-center rounded-full px-4 py-2 ${
                    isPro ? "bg-[#CBBF9A] text-[#0E1A14]" : "bg-[#1F3D2B] text-[#F9F8F4]"
                  }`}
                >
                  {t("pricing.cta")}
                </Link>
              </div>
            )
          })}
        </section>

        <section className="rounded-3xl border border-[#1F3D2B]/15 bg-white/90 p-6">
          <div className="text-sm font-semibold text-[#1F3D2B]">{t("pricing.addons_title")}</div>
          <p className="mt-2 text-sm text-[#0E1A14]/70">{t("pricing.addons_subtitle")}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {addOns.map((item) => (
              <div key={item} className="rounded-full border border-[#1F3D2B]/15 bg-[#F9F8F4] px-4 py-2 text-sm text-[#0E1A14]/80">
                {item}
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
