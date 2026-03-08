import type { Metadata } from "next"
import { SiteHeader } from "@/components/marketing/site-header"
import { SiteFooter } from "@/components/marketing/site-footer"
import {
  Calendar,
  Users,
  CreditCard,
  FileSignature,
  Sparkles,
  BarChart3,
  ShieldCheck,
  Bell,
  Target,
  ArrowRight,
} from "lucide-react"
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
    de: "Funktionen – Avaimo Vereinsverwaltung",
    it: "Funzionalità – Avaimo Gestione Club",
    en: "Features – Avaimo Sports Club Management",
  }
  const descriptions: Record<string, string> = {
    de: "Alle Funktionen von Avaimo im Überblick: Online-Buchung, Mitgliederverwaltung, Stripe-Zahlungen, digitale Verträge, KI-Dokumentenprüfung und mehr.",
    it: "Tutte le funzionalità di Avaimo: prenotazioni online, gestione soci, pagamenti Stripe, contratti digitali, verifica documenti AI e molto altro.",
    en: "All Avaimo features: online booking, member management, Stripe payments, digital contracts, AI document verification and more.",
  }

  const title = titles[lang] ?? titles.de
  const description = descriptions[lang] ?? descriptions.de

  return {
    title,
    description,
    alternates: { canonical: `${BASE_URL}/${lang}/features` },
    openGraph: { title, description, url: `${BASE_URL}/${lang}/features` },
  }
}

export default async function FeaturesPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang as any)
  const t = createTranslator(dict)
  const featureBlocks = [
    {
      title: t("features.blocks.booking.title"),
      icon: Calendar,
      bullets: [
        t("features.blocks.booking.bullets.0"),
        t("features.blocks.booking.bullets.1"),
        t("features.blocks.booking.bullets.2"),
      ],
    },
    {
      title: t("features.blocks.members.title"),
      icon: Users,
      bullets: [
        t("features.blocks.members.bullets.0"),
        t("features.blocks.members.bullets.1"),
        t("features.blocks.members.bullets.2"),
      ],
    },
    {
      title: t("features.blocks.payments.title"),
      icon: CreditCard,
      bullets: [
        t("features.blocks.payments.bullets.0"),
        t("features.blocks.payments.bullets.1"),
        t("features.blocks.payments.bullets.2"),
      ],
    },
    {
      title: t("features.blocks.contracts.title"),
      icon: FileSignature,
      bullets: [
        t("features.blocks.contracts.bullets.0"),
        t("features.blocks.contracts.bullets.1"),
        t("features.blocks.contracts.bullets.2"),
      ],
    },
    {
      title: t("features.blocks.training.title"),
      icon: Sparkles,
      bullets: [
        t("features.blocks.training.bullets.0"),
        t("features.blocks.training.bullets.1"),
        t("features.blocks.training.bullets.2"),
      ],
    },
    {
      title: t("features.blocks.reporting.title"),
      icon: BarChart3,
      bullets: [
        t("features.blocks.reporting.bullets.0"),
        t("features.blocks.reporting.bullets.1"),
        t("features.blocks.reporting.bullets.2"),
      ],
    },
  ]

  const extraBlocks = [
    {
      title: t("features.extra.security.title"),
      icon: ShieldCheck,
      description: t("features.extra.security.desc"),
    },
    {
      title: t("features.extra.notifications.title"),
      icon: Bell,
      description: t("features.extra.notifications.desc"),
    },
    {
      title: t("features.extra.engagement.title"),
      icon: Target,
      description: t("features.extra.engagement.desc"),
    },
  ]

  return (
    <div className="min-h-screen bg-[#F9F8F4] text-[#0E1A14]">
      <BreadcrumbSchema items={[
        { name: "Avaimo", url: "https://avaimo.com" },
        { name: "Features", url: `https://avaimo.com/${lang}/features` },
      ]} />
      <SiteHeader />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-12 sm:pt-20 pb-12 sm:pb-16">
        <div className="max-w-2xl">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1F3D2B]/70 mb-3">
            {t("features.hero.badge")}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight mb-4">
            {t("features.hero.title")}
          </h1>
          <p className="text-base sm:text-lg text-[#0E1A14]/65 leading-relaxed mb-6">
            {t("features.hero.subtitle")}
          </p>
          <Link
            href={`/${lang}/demo`}
            className="inline-flex items-center gap-2 rounded-full bg-[#1F3D2B] px-6 py-3 text-sm font-medium text-[#F9F8F4] hover:bg-[#162e1f] transition-colors shadow-[0_8px_24px_-8px_rgba(31,61,43,0.5)]"
          >
            Demo ansehen <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Feature grid */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-12 sm:pb-16">
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {featureBlocks.map((block, i) => (
            <div
              key={block.title}
              className={`rounded-2xl sm:rounded-3xl border p-5 sm:p-6 shadow-sm transition-shadow hover:shadow-md ${
                i === 0
                  ? "border-[#CBBF9A]/60 bg-white sm:col-span-2 lg:col-span-1"
                  : "border-[#1F3D2B]/10 bg-white/90"
              }`}
            >
              <div className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-[#1F3D2B]/8 mb-4">
                <block.icon className="h-4 w-4 text-[#1F3D2B]" />
              </div>
              <div className="text-sm font-semibold text-[#0E1A14] mb-3">{block.title}</div>
              <ul className="space-y-2">
                {block.bullets.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-[#0E1A14]/65">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#CBBF9A] flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Extra blocks */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-16 sm:pb-24">
        <div className="rounded-2xl sm:rounded-3xl border border-[#1F3D2B]/10 bg-white/90 p-6 sm:p-8">
          <div className="grid gap-6 sm:gap-8 sm:grid-cols-3">
            {extraBlocks.map((block) => (
              <div key={block.title}>
                <div className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-[#1F3D2B]/8 mb-3">
                  <block.icon className="h-4 w-4 text-[#1F3D2B]" />
                </div>
                <div className="text-sm font-semibold text-[#0E1A14] mb-2">{block.title}</div>
                <p className="text-sm text-[#0E1A14]/65 leading-relaxed">{block.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
