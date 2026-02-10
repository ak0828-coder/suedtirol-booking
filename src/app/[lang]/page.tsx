import Link from "next/link"
import {
  ArrowRight,
  Check,
  Calendar,
  CreditCard,
  FileSignature,
  Users,
  Sparkles,
  BarChart3,
} from "lucide-react"
import { SiteHeader } from "@/components/marketing/site-header"
import { SiteFooter } from "@/components/marketing/site-footer"
import { getDictionary } from "@/lib/dictionaries"
import { createTranslator } from "@/lib/translator"

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang as any)
  const t = createTranslator(dict)
  const proof = [
    { label: t("home.proof.fast"), value: t("home.proof.onboarding") },
    { label: t("home.proof.gdpr"), value: t("home.proof.eu") },
    { label: t("home.proof.no_excel"), value: t("home.proof.one_platform") },
  ]

  const modules = [
    {
      title: t("home.modules.bookings.title"),
      description: t("home.modules.bookings.desc"),
      icon: Calendar,
    },
    {
      title: t("home.modules.members.title"),
      description: t("home.modules.members.desc"),
      icon: Users,
    },
    {
      title: t("home.modules.payments.title"),
      description: t("home.modules.payments.desc"),
      icon: CreditCard,
    },
    {
      title: t("home.modules.contracts.title"),
      description: t("home.modules.contracts.desc"),
      icon: FileSignature,
    },
    {
      title: t("home.modules.training.title"),
      description: t("home.modules.training.desc"),
      icon: Sparkles,
    },
    {
      title: t("home.modules.reporting.title"),
      description: t("home.modules.reporting.desc"),
      icon: BarChart3,
    },
  ]

  const pains = [t("home.pains.0"), t("home.pains.1"), t("home.pains.2"), t("home.pains.3")]

  const outcomes = [
    t("home.outcomes.0"),
    t("home.outcomes.1"),
    t("home.outcomes.2"),
    t("home.outcomes.3"),
  ]

  return (
    <div className="min-h-screen bg-[#F9F8F4] text-[#0E1A14]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-24 h-80 w-80 rounded-full bg-[#CBBF9A]/35 blur-3xl" />
        <div className="absolute top-24 -left-32 h-96 w-96 rounded-full bg-[#1F3D2B]/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,26,20,0.08),transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(90deg,rgba(14,26,20,0.1)_1px,transparent_1px),linear-gradient(180deg,rgba(14,26,20,0.1)_1px,transparent_1px)] [background-size:84px_84px]" />
      </div>

      <SiteHeader />

      <main className="relative z-10">
        <section className="mx-auto max-w-6xl px-6 pt-12 pb-20">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#1F3D2B]/15 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#1F3D2B]">
                {t("home.hero.badge")}
              </div>
              <h1 className="text-4xl md:text-6xl leading-tight font-semibold">
                {t("home.hero.title")}
              </h1>
              <p className="text-lg text-[#0E1A14]/70">{t("home.hero.subtitle")}</p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/${lang}/demo`}
                  className="rounded-full bg-[#1F3D2B] px-6 py-3 text-[#F9F8F4] inline-flex items-center gap-2 shadow-[0_10px_30px_-18px_rgba(14,26,20,0.8)]"
                >
                  {t("home.hero.cta_demo")} <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={`/${lang}/contact`}
                  className="rounded-full border border-[#1F3D2B]/30 px-6 py-3 text-[#1F3D2B] hover:bg-[#1F3D2B]/5"
                >
                  {t("home.hero.cta_consulting")}
                </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {proof.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-[#1F3D2B]/10 bg-white/90 p-4">
                    <div className="text-sm font-semibold text-[#0E1A14]">{item.label}</div>
                    <div className="text-xs text-[#0E1A14]/60">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-[#1F3D2B]/20 bg-[#1F3D2B] text-[#F9F8F4] p-6 shadow-2xl">
              <div className="text-xs uppercase tracking-[0.2em] text-[#CBBF9A]">{t("home.overview.title")}</div>
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl bg-[#0E1A14]/70 p-4">
                  <div className="text-sm text-[#F9F8F4]/70">{t("home.overview.booking_today")}</div>
                  <div className="text-2xl font-semibold">{t("home.overview.court_time")}</div>
                  <div className="text-xs text-[#F9F8F4]/60">{t("home.overview.member_paid")}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-[#0E1A14]/70 p-4">
                    <div className="text-xs text-[#F9F8F4]/60">{t("home.overview.open_fees")}</div>
                    <div className="text-2xl font-semibold">8</div>
                  </div>
                  <div className="rounded-2xl bg-[#0E1A14]/70 p-4">
                    <div className="text-xs text-[#F9F8F4]/60">{t("home.overview.trainer_sessions")}</div>
                    <div className="text-2xl font-semibold">12</div>
                  </div>
                </div>
                <div className="rounded-2xl bg-[#CBBF9A] p-4 text-[#0E1A14]">
                  <div className="text-xs uppercase tracking-[0.2em]">{t("home.overview.docs")}</div>
                  <div className="text-lg font-semibold">{t("home.overview.docs_status")}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-16">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-[#1F3D2B]/15 bg-white/90 p-6">
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-[#1F3D2B]/70">
                {t("home.pains.title")}
              </div>
              <ul className="mt-4 space-y-3 text-[#0E1A14]/80">
                {pains.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-[#CBBF9A]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-[#1F3D2B]/15 bg-white/90 p-6">
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-[#1F3D2B]/70">
                {t("home.outcomes.title")}
              </div>
              <ul className="mt-4 space-y-3 text-[#0E1A14]/80">
                {outcomes.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-[#1F3D2B] mt-1" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-20">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-semibold">{t("home.modules.title")}</h2>
            <Link href={`/${lang}/features`} className="text-sm text-[#1F3D2B] hover:text-[#0E1A14]">
              {t("home.modules.cta")}
            </Link>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {modules.map((item) => (
              <div key={item.title} className="rounded-3xl border border-[#1F3D2B]/10 bg-white/90 p-6 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#1F3D2B]">
                  <item.icon className="h-4 w-4" /> {item.title}
                </div>
                <p className="mt-3 text-sm text-[#0E1A14]/70">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-20">
          <div className="rounded-3xl border border-[#1F3D2B]/15 bg-white/90 p-10">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-[#1F3D2B]/70">{t("home.results.title")}</div>
                <h3 className="mt-3 text-3xl font-semibold">{t("home.results.headline")}</h3>
                <p className="mt-3 text-[#0E1A14]/70">{t("home.results.subheadline")}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href={`/${lang}/demo`} className="rounded-full bg-[#1F3D2B] px-5 py-2 text-[#F9F8F4]">
                    {t("home.results.cta_demo")}
                  </Link>
                  <Link href={`/${lang}/pricing`} className="rounded-full border border-[#1F3D2B]/30 px-5 py-2 text-[#1F3D2B]">
                    {t("home.results.cta_pricing")}
                  </Link>
                </div>
              </div>
              <div className="grid gap-4">
                {[
                  ["30%", t("home.results.stats.0")],
                  ["+18%", t("home.results.stats.1")],
                  ["5 Min", t("home.results.stats.2")],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-2xl border border-[#1F3D2B]/10 bg-[#F9F8F4] p-4">
                    <div className="text-2xl font-semibold">{value}</div>
                    <div className="text-xs text-[#0E1A14]/60">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="rounded-3xl border border-[#1F3D2B]/20 bg-[#1F3D2B] p-10 text-[#F9F8F4]">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-[#CBBF9A]">{t("home.final.badge")}</div>
                <h3 className="mt-2 text-3xl font-semibold">{t("home.final.title")}</h3>
              </div>
              <Link href={`/${lang}/demo`} className="rounded-full bg-[#CBBF9A] px-6 py-3 text-[#0E1A14]">
                {t("home.final.cta")}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
