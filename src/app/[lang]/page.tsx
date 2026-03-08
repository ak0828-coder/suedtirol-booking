import type { Metadata } from "next"
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
  ChevronRight,
} from "lucide-react"
import { SiteHeader } from "@/components/marketing/site-header"
import { SiteFooter } from "@/components/marketing/site-footer"
import { getDictionary } from "@/lib/dictionaries"
import { createTranslator } from "@/lib/translator"
import {
  OrganizationSchema,
  SoftwareApplicationSchema,
  WebSiteSchema,
  FAQSchema,
} from "@/components/seo/structured-data"

const BASE_URL = "https://avaimo.com"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params

  const titles: Record<string, string> = {
    de: "Avaimo – Vereinsverwaltung für Sportvereine",
    it: "Avaimo – Gestione Club Sportivi",
    en: "Avaimo – Sports Club Management Software",
  }
  const descriptions: Record<string, string> = {
    de: "Die All-in-One-Vereinsplattform für Tennis- und Sportvereine. Buchung, Mitglieder, Zahlungen, Verträge und Trainer. DSGVO-konform, in unter 48h startklar.",
    it: "La piattaforma all-in-one per club sportivi: prenotazioni, soci, pagamenti, contratti e istruttori. Conforme al GDPR, operativo in meno di 48 ore.",
    en: "The all-in-one platform for sports clubs: bookings, members, payments, contracts and trainers. GDPR-compliant, up and running in under 48 hours.",
  }

  const title = titles[lang] ?? titles.de
  const description = descriptions[lang] ?? descriptions.de

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/${lang}`,
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${lang}`,
    },
  }
}

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang as any)
  const t = createTranslator(dict)

  const modules = [
    { title: t("home.modules.bookings.title"), description: t("home.modules.bookings.desc"), icon: Calendar },
    { title: t("home.modules.members.title"), description: t("home.modules.members.desc"), icon: Users },
    { title: t("home.modules.payments.title"), description: t("home.modules.payments.desc"), icon: CreditCard },
    { title: t("home.modules.contracts.title"), description: t("home.modules.contracts.desc"), icon: FileSignature },
    { title: t("home.modules.training.title"), description: t("home.modules.training.desc"), icon: Sparkles },
    { title: t("home.modules.reporting.title"), description: t("home.modules.reporting.desc"), icon: BarChart3 },
  ]

  const pains = [t("home.pains.0"), t("home.pains.1"), t("home.pains.2"), t("home.pains.3")]
  const outcomes = [t("home.outcomes.0"), t("home.outcomes.1"), t("home.outcomes.2"), t("home.outcomes.3")]

  const steps = [
    { n: "01", title: t("home.steps.0.title", "Club anlegen"), desc: t("home.steps.0.desc", "Verein einrichten, Plätze und Preise konfigurieren – in unter 48 Stunden betriebsbereit.") },
    { n: "02", title: t("home.steps.1.title", "Mitglieder einladen"), desc: t("home.steps.1.desc", "CSV-Import oder direkte Einladung. Verträge werden digital unterzeichnet.") },
    { n: "03", title: t("home.steps.2.title", "Alles läuft"), desc: t("home.steps.2.desc", "Buchungen, Zahlungen und Erinnerungen passieren automatisch.") },
  ]

  return (
    <div className="min-h-screen bg-[#F9F8F4] text-[#0E1A14]">
      <OrganizationSchema lang={lang} />
      <SoftwareApplicationSchema lang={lang} />
      <WebSiteSchema lang={lang} />
      <FAQSchema lang={lang} />
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-32 h-[600px] w-[600px] rounded-full bg-[#CBBF9A]/12 blur-3xl" />
        <div className="absolute top-60 -left-40 h-[500px] w-[500px] rounded-full bg-[#1F3D2B]/7 blur-3xl" />
        <div className="absolute bottom-40 right-1/3 h-[400px] w-[400px] rounded-full bg-[#CBBF9A]/8 blur-3xl" />
      </div>

      <SiteHeader />

      <main className="relative z-10">
        {/* ── Hero ── */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-12 sm:pt-16 pb-16 sm:pb-28">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-14 items-center">
            {/* Left: copy */}
            <div className="space-y-6 sm:space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#1F3D2B]/15 bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#1F3D2B]">
                {t("home.hero.badge")}
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-[60px] leading-[1.05] font-semibold tracking-tight">
                {t("home.hero.title")}
              </h1>

              <p className="text-base sm:text-lg text-[#0E1A14]/58 leading-relaxed max-w-md">
                {t("home.hero.subtitle")}
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href={`/${lang}/demo`}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1F3D2B] px-7 py-3.5 text-sm font-medium text-[#F9F8F4] shadow-[0_16px_40px_-16px_rgba(31,61,43,0.65)] hover:bg-[#162e1f] transition-colors"
                >
                  {t("home.hero.cta_demo")} <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={`/${lang}/contact`}
                  className="inline-flex items-center justify-center rounded-full border border-[#1F3D2B]/25 px-7 py-3.5 text-sm font-medium text-[#1F3D2B] hover:bg-[#1F3D2B]/5 transition-colors"
                >
                  {t("home.hero.cta_consulting")}
                </Link>
              </div>

              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#0E1A14]/50">
                {[
                  t("home.proof.fast"),
                  t("home.proof.gdpr"),
                  t("home.proof.no_excel"),
                ].map((item) => (
                  <span key={item} className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-[#1F3D2B]" /> {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: product mockup */}
            <div className="relative hidden sm:block">
              <div className="absolute -inset-4 bg-gradient-to-br from-[#1F3D2B]/6 to-[#CBBF9A]/6 rounded-3xl blur-2xl" />
              <div className="relative rounded-2xl border border-slate-200/80 bg-white shadow-[0_32px_80px_-24px_rgba(0,0,0,0.15)] overflow-hidden">
                {/* Browser chrome */}
                <div className="bg-slate-50 border-b border-slate-100 px-4 py-2.5 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-400/60" />
                    <div className="h-2.5 w-2.5 rounded-full bg-green-400/60" />
                  </div>
                  <div className="ml-2 flex-1 bg-white rounded-md border border-slate-200 px-3 py-1 text-[10px] text-slate-400">
                    avaimo.com/club/tc-bergblick/admin
                  </div>
                </div>
                {/* Admin UI */}
                <div className="flex bg-[#f5f5f7]" style={{ height: 380 }}>
                  {/* Sidebar */}
                  <div className="w-36 bg-slate-50 border-r border-slate-100 p-3 flex-shrink-0">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-6 w-6 rounded-md bg-[#1F3D2B] flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">
                        TC
                      </div>
                      <span className="text-[10px] font-semibold text-slate-700 truncate">Bergblick</span>
                    </div>
                    {[
                      { label: "Übersicht", active: true },
                      { label: "Buchungen", active: false },
                      { label: "Plätze", active: false },
                      { label: "Mitglieder", active: false },
                      { label: "Finanzen", active: false },
                      { label: "Einstellungen", active: false },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className={`text-[10px] px-2 py-1.5 rounded-lg mb-0.5 ${
                          item.active
                            ? "bg-[#1F3D2B] text-white font-medium"
                            : "text-slate-500"
                        }`}
                      >
                        {item.label}
                      </div>
                    ))}
                  </div>
                  {/* Main content */}
                  <div className="flex-1 p-3.5 overflow-hidden">
                    {/* KPI row */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {[
                        ["€ 3.840", "Umsatz"],
                        ["47", "Buchungen"],
                        ["Platz 1", "Top Platz"],
                      ].map(([v, l]) => (
                        <div
                          key={l}
                          className="bg-white rounded-xl p-2.5 border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                        >
                          <div className="text-sm font-semibold text-slate-800">{v}</div>
                          <div className="text-[9px] text-slate-400 mt-0.5">{l}</div>
                        </div>
                      ))}
                    </div>
                    {/* Revenue chart */}
                    <div className="bg-white rounded-xl p-3 mb-3 border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                      <div className="text-[9px] text-slate-400 mb-2 font-medium">Umsatz diese Woche</div>
                      <div className="flex items-end gap-1" style={{ height: 48 }}>
                        {[30, 55, 40, 70, 50, 85, 60, 90, 45, 75, 35, 95].map((h, i) => (
                          <div
                            key={i}
                            className="flex-1 rounded-sm"
                            style={{
                              height: `${h}%`,
                              backgroundColor:
                                i === 11 ? "#1F3D2B" : `rgba(31,61,43,${0.12 + (i % 4) * 0.04})`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    {/* Recent bookings */}
                    <div className="space-y-1.5">
                      <div className="text-[9px] font-medium text-slate-400 mb-1">Letzte Buchungen</div>
                      {[
                        { name: "Erna M.", court: "Platz 3", time: "10:00", paid: true },
                        { name: "Alex K.", court: "Platz 1", time: "12:30", paid: false },
                        { name: "Maria S.", court: "Platz 2", time: "15:00", paid: true },
                      ].map((b) => (
                        <div
                          key={b.name}
                          className="flex items-center gap-2 bg-white border border-slate-100 rounded-lg px-2.5 py-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                        >
                          <div className="text-[10px] font-medium text-slate-700 flex-1">{b.name}</div>
                          <div className="text-[9px] text-slate-400">
                            {b.court} · {b.time}
                          </div>
                          <div
                            className={`text-[9px] rounded-full px-1.5 py-0.5 font-medium ${
                              b.paid
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {b.paid ? "bezahlt" : "offen"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats bar ── */}
        <section className="border-y border-[#1F3D2B]/10 bg-white/70 backdrop-blur-sm py-8 sm:py-10">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid grid-cols-3 gap-4 text-center divide-x divide-[#1F3D2B]/10">
              {(
                [
                  ["30%", t("home.results.stats.0")],
                  ["+18%", t("home.results.stats.1")],
                  ["5 Min", t("home.results.stats.2")],
                ] as [string, string][]
              ).map(([value, label]) => (
                <div key={label} className="px-2 sm:px-6">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-semibold text-[#1F3D2B]">{value}</div>
                  <div className="text-xs sm:text-sm text-[#0E1A14]/50 mt-1 sm:mt-1.5 leading-tight">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pain → Solution ── */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center mb-10 sm:mb-14">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1F3D2B]/60 mb-3">
              Problem → Lösung
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold">Was Avaimo löst</h2>
          </div>
          <div className="grid lg:grid-cols-2 gap-4 sm:gap-5">
            {/* Before */}
            <div className="rounded-2xl sm:rounded-3xl bg-[#0E1A14]/[0.04] border border-[#0E1A14]/[0.06] p-6 sm:p-8 md:p-10">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0E1A14]/35 mb-5 sm:mb-7">
                {t("home.pains.title")}
              </div>
              <div className="space-y-4 sm:space-y-5">
                {pains.map((item) => (
                  <div key={item} className="flex items-start gap-3 sm:gap-3.5">
                    <div className="mt-0.5 h-5 w-5 rounded-full border-2 border-[#0E1A14]/15 flex items-center justify-center flex-shrink-0">
                      <span className="text-[#0E1A14]/30 text-[11px] font-bold leading-none">✕</span>
                    </div>
                    <span className="text-sm sm:text-base text-[#0E1A14]/65 leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* After */}
            <div className="rounded-2xl sm:rounded-3xl bg-[#1F3D2B] p-6 sm:p-8 md:p-10">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#CBBF9A]/70 mb-5 sm:mb-7">
                {t("home.outcomes.title")}
              </div>
              <div className="space-y-4 sm:space-y-5">
                {outcomes.map((item) => (
                  <div key={item} className="flex items-start gap-3 sm:gap-3.5">
                    <div className="mt-0.5 h-5 w-5 rounded-full bg-[#CBBF9A]/15 border border-[#CBBF9A]/25 flex items-center justify-center flex-shrink-0">
                      <Check className="h-3 w-3 text-[#CBBF9A]" />
                    </div>
                    <span className="text-sm sm:text-base text-[#F9F8F4]/75 leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Modules ── */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-16 sm:pb-24">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold">{t("home.modules.title")}</h2>
            <Link
              href={`/${lang}/features`}
              className="inline-flex items-center gap-1 mt-3 text-sm text-[#1F3D2B] hover:text-[#0E1A14] transition-colors"
            >
              {t("home.modules.cta")} <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((item, i) => (
              <div
                key={item.title}
                className={`rounded-2xl sm:rounded-3xl p-5 sm:p-7 border transition-all ${
                  i === 0
                    ? "bg-[#1F3D2B] border-[#1F3D2B]"
                    : "bg-white/90 border-[#1F3D2B]/10 hover:border-[#1F3D2B]/20 hover:shadow-sm"
                }`}
              >
                <div
                  className={`inline-flex items-center justify-center h-10 w-10 rounded-2xl mb-4 sm:mb-5 ${
                    i === 0 ? "bg-[#CBBF9A]/15" : "bg-[#1F3D2B]/8"
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${i === 0 ? "text-[#CBBF9A]" : "text-[#1F3D2B]"}`} />
                </div>
                <div className={`font-semibold mb-2 ${i === 0 ? "text-[#F9F8F4]" : "text-[#0E1A14]"}`}>
                  {item.title}
                </div>
                <p className={`text-sm leading-relaxed ${i === 0 ? "text-[#F9F8F4]/60" : "text-[#0E1A14]/55"}`}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="bg-white/70 border-y border-[#1F3D2B]/8 py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center mb-10 sm:mb-14">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1F3D2B]/60 mb-3">
                {t("home.steps.badge", "So einfach")}
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold">
                {t("home.steps.title", "In 3 Schritten startklar")}
              </h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-8 sm:gap-10 md:gap-8">
              {steps.map((item) => (
                <div key={item.n} className="relative flex sm:block gap-5 sm:gap-0">
                  <div className="text-6xl sm:text-7xl font-bold text-[#1F3D2B]/6 leading-none select-none mb-0 sm:mb-3 flex-shrink-0">
                    {item.n}
                  </div>
                  <div className="pt-1 sm:pt-0">
                    <div className="font-semibold text-lg mb-2 text-[#0E1A14]">{item.title}</div>
                    <p className="text-sm text-[#0E1A14]/55 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
          <div className="rounded-2xl sm:rounded-3xl bg-[#1F3D2B] px-6 py-12 sm:px-10 sm:py-16 md:p-16 text-center">
            <div className="text-xs uppercase tracking-[0.2em] text-[#CBBF9A] mb-4">
              {t("home.final.badge")}
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-semibold text-[#F9F8F4] mb-6 sm:mb-8 max-w-xl mx-auto leading-tight">
              {t("home.final.title")}
            </h2>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={`/${lang}/demo`}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#CBBF9A] px-8 py-3.5 text-sm font-medium text-[#0E1A14] hover:opacity-90 transition-opacity"
              >
                {t("home.final.cta")} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={`/${lang}/contact`}
                className="inline-flex items-center justify-center rounded-full border border-[#F9F8F4]/20 px-8 py-3.5 text-sm font-medium text-[#F9F8F4] hover:bg-[#F9F8F4]/5 transition-colors"
              >
                {t("home.hero.cta_consulting")}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
