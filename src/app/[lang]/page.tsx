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
    <div
      className="min-h-screen text-white"
      style={{ background: "#0C0F0E" }}
    >
      <OrganizationSchema lang={lang} />
      <SoftwareApplicationSchema lang={lang} />
      <WebSiteSchema lang={lang} />
      <FAQSchema lang={lang} />

      {/* Dot grid background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(255,255,255,0.045) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
          zIndex: 0,
        }}
      />

      {/* Ambient glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        <div
          className="absolute -top-48 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full"
          style={{
            background: "radial-gradient(ellipse, rgba(31,61,43,0.35) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute top-1/2 -right-48 w-[600px] h-[600px] rounded-full"
          style={{
            background: "radial-gradient(ellipse, rgba(203,191,154,0.06) 0%, transparent 70%)",
            filter: "blur(100px)",
          }}
        />
      </div>

      <div className="relative z-10">
        <SiteHeader />

        <main>
          {/* ── Hero ── */}
          <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-16 sm:pt-24 pb-20 sm:pb-32">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              {/* Left: copy */}
              <div className="space-y-7">
                <div
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.18em]"
                  style={{
                    background: "rgba(31,61,43,0.35)",
                    border: "1px solid rgba(31,61,43,0.6)",
                    color: "#CBBF9A",
                  }}
                >
                  {t("home.hero.badge")}
                </div>

                <h1
                  className="text-4xl sm:text-5xl md:text-[62px] leading-[1.03] font-bold tracking-[-0.03em]"
                  style={{ color: "#F9F8F4" }}
                >
                  {t("home.hero.title")}
                </h1>

                <p className="text-base sm:text-lg leading-relaxed max-w-md" style={{ color: "rgba(249,248,244,0.52)" }}>
                  {t("home.hero.subtitle")}
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href={`/${lang}/demo`}
                    className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold transition-opacity hover:opacity-90"
                    style={{
                      background: "#1F3D2B",
                      color: "#CBBF9A",
                      boxShadow: "0 0 40px rgba(31,61,43,0.5), inset 0 1px 0 rgba(203,191,154,0.12)",
                      border: "1px solid rgba(31,61,43,0.8)",
                    }}
                  >
                    {t("home.hero.cta_demo")} <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/${lang}/contact`}
                    className="inline-flex items-center justify-center rounded-full px-7 py-3.5 text-sm font-medium transition-colors hover:bg-white/5"
                    style={{
                      border: "1px solid rgba(249,248,244,0.12)",
                      color: "rgba(249,248,244,0.65)",
                    }}
                  >
                    {t("home.hero.cta_consulting")}
                  </Link>
                </div>

                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  {[
                    t("home.proof.fast"),
                    t("home.proof.gdpr"),
                    t("home.proof.no_excel"),
                  ].map((item) => (
                    <span key={item} className="flex items-center gap-1.5 text-sm" style={{ color: "rgba(249,248,244,0.38)" }}>
                      <Check className="h-3.5 w-3.5" style={{ color: "#CBBF9A" }} /> {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right: product mockup */}
              <div className="relative hidden sm:block">
                <div
                  className="absolute -inset-6 rounded-3xl"
                  style={{
                    background: "radial-gradient(ellipse at center, rgba(31,61,43,0.25) 0%, transparent 70%)",
                    filter: "blur(24px)",
                  }}
                />
                <div
                  className="relative rounded-2xl overflow-hidden"
                  style={{
                    background: "#111714",
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
                  }}
                >
                  {/* Browser chrome */}
                  <div
                    className="px-4 py-2.5 flex items-center gap-2"
                    style={{ background: "#0d1110", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <div className="flex gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-red-500/40" />
                      <div className="h-2.5 w-2.5 rounded-full bg-amber-500/40" />
                      <div className="h-2.5 w-2.5 rounded-full bg-green-500/40" />
                    </div>
                    <div
                      className="ml-2 flex-1 rounded-md px-3 py-1 text-[10px]"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        color: "rgba(255,255,255,0.25)",
                      }}
                    >
                      avaimo.com/club/tc-bergblick/admin
                    </div>
                  </div>

                  {/* Admin UI */}
                  <div className="flex" style={{ height: 380, background: "#0e1410" }}>
                    {/* Sidebar */}
                    <div
                      className="w-36 p-3 flex-shrink-0"
                      style={{ background: "#0a100c", borderRight: "1px solid rgba(255,255,255,0.05)" }}
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <div
                          className="h-6 w-6 rounded-md flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                          style={{ background: "#1F3D2B", color: "#CBBF9A" }}
                        >
                          TC
                        </div>
                        <span className="text-[10px] font-semibold truncate" style={{ color: "rgba(255,255,255,0.6)" }}>
                          Bergblick
                        </span>
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
                          className="text-[10px] px-2 py-1.5 rounded-lg mb-0.5"
                          style={{
                            background: item.active ? "rgba(31,61,43,0.6)" : "transparent",
                            color: item.active ? "#CBBF9A" : "rgba(255,255,255,0.28)",
                            border: item.active ? "1px solid rgba(31,61,43,0.8)" : "1px solid transparent",
                            fontWeight: item.active ? 600 : 400,
                          }}
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
                            className="rounded-xl p-2.5"
                            style={{
                              background: "rgba(255,255,255,0.04)",
                              border: "1px solid rgba(255,255,255,0.07)",
                            }}
                          >
                            <div className="text-sm font-semibold" style={{ color: "#F9F8F4" }}>{v}</div>
                            <div className="text-[9px] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{l}</div>
                          </div>
                        ))}
                      </div>

                      {/* Revenue chart */}
                      <div
                        className="rounded-xl p-3 mb-3"
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        <div className="text-[9px] mb-2 font-medium" style={{ color: "rgba(255,255,255,0.3)" }}>
                          Umsatz diese Woche
                        </div>
                        <div className="flex items-end gap-1" style={{ height: 44 }}>
                          {[30, 55, 40, 70, 50, 85, 60, 90, 45, 75, 35, 95].map((h, i) => (
                            <div
                              key={i}
                              className="flex-1 rounded-sm"
                              style={{
                                height: `${h}%`,
                                background: i === 11
                                  ? "#1F3D2B"
                                  : `rgba(31,61,43,${0.18 + (i % 4) * 0.06})`,
                              }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Recent bookings */}
                      <div>
                        <div className="text-[9px] font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.25)" }}>
                          Letzte Buchungen
                        </div>
                        <div className="space-y-1.5">
                          {[
                            { name: "Erna M.", court: "Platz 3", time: "10:00", paid: true },
                            { name: "Alex K.", court: "Platz 1", time: "12:30", paid: false },
                            { name: "Maria S.", court: "Platz 2", time: "15:00", paid: true },
                          ].map((b) => (
                            <div
                              key={b.name}
                              className="flex items-center gap-2 rounded-lg px-2.5 py-1.5"
                              style={{
                                background: "rgba(255,255,255,0.03)",
                                border: "1px solid rgba(255,255,255,0.06)",
                              }}
                            >
                              <div className="text-[10px] font-medium flex-1" style={{ color: "rgba(255,255,255,0.65)" }}>
                                {b.name}
                              </div>
                              <div className="text-[9px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                                {b.court} · {b.time}
                              </div>
                              <div
                                className="text-[9px] rounded-full px-1.5 py-0.5 font-medium"
                                style={
                                  b.paid
                                    ? { background: "rgba(34,197,94,0.12)", color: "#4ade80" }
                                    : { background: "rgba(251,191,36,0.12)", color: "#fbbf24" }
                                }
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
            </div>
          </section>

          {/* ── Stats bar ── */}
          <section
            className="py-10 sm:py-12"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              <div className="grid grid-cols-3 gap-4 text-center" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                {(
                  [
                    ["30%", t("home.results.stats.0")],
                    ["+18%", t("home.results.stats.1")],
                    ["5 Min", t("home.results.stats.2")],
                  ] as [string, string][]
                ).map(([value, label], i) => (
                  <div
                    key={label}
                    className="px-2 sm:px-6"
                    style={{
                      borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.06)" : undefined,
                    }}
                  >
                    <div
                      className="text-2xl sm:text-3xl md:text-4xl font-bold font-mono"
                      style={{ color: "#CBBF9A" }}
                    >
                      {value}
                    </div>
                    <div className="text-xs sm:text-sm mt-1 sm:mt-1.5 leading-tight" style={{ color: "rgba(255,255,255,0.35)" }}>
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Pain → Solution ── */}
          <section className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-28">
            <div className="text-center mb-12 sm:mb-16">
              <div
                className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-3"
                style={{ color: "rgba(203,191,154,0.6)" }}
              >
                Problem → Lösung
              </div>
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight"
                style={{ color: "#F9F8F4" }}
              >
                Was Avaimo löst
              </h2>
            </div>
            <div className="grid lg:grid-cols-2 gap-4 sm:gap-5">
              {/* Before */}
              <div
                className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div
                  className="text-[11px] font-semibold uppercase tracking-[0.18em] mb-6"
                  style={{ color: "rgba(255,255,255,0.25)" }}
                >
                  {t("home.pains.title")}
                </div>
                <div className="space-y-4 sm:space-y-5">
                  {pains.map((item) => (
                    <div key={item} className="flex items-start gap-3.5">
                      <div
                        className="mt-0.5 h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                      >
                        <span className="text-[11px] font-bold leading-none" style={{ color: "rgba(255,255,255,0.2)" }}>✕</span>
                      </div>
                      <span className="text-sm sm:text-base leading-snug" style={{ color: "rgba(255,255,255,0.5)" }}>
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* After */}
              <div
                className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10"
                style={{
                  background: "rgba(31,61,43,0.25)",
                  border: "1px solid rgba(31,61,43,0.5)",
                }}
              >
                <div
                  className="text-[11px] font-semibold uppercase tracking-[0.18em] mb-6"
                  style={{ color: "rgba(203,191,154,0.6)" }}
                >
                  {t("home.outcomes.title")}
                </div>
                <div className="space-y-4 sm:space-y-5">
                  {outcomes.map((item) => (
                    <div key={item} className="flex items-start gap-3.5">
                      <div
                        className="mt-0.5 h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(203,191,154,0.12)", border: "1px solid rgba(203,191,154,0.25)" }}
                      >
                        <Check className="h-3 w-3" style={{ color: "#CBBF9A" }} />
                      </div>
                      <span className="text-sm sm:text-base leading-snug" style={{ color: "rgba(249,248,244,0.7)" }}>
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── Modules ── */}
          <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-20 sm:pb-28">
            <div className="text-center mb-12 sm:mb-16">
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight"
                style={{ color: "#F9F8F4" }}
              >
                {t("home.modules.title")}
              </h2>
              <Link
                href={`/${lang}/features`}
                className="inline-flex items-center gap-1 mt-3 text-sm transition-colors hover:opacity-80"
                style={{ color: "#CBBF9A" }}
              >
                {t("home.modules.cta")} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {modules.map((item, i) => (
                <div
                  key={item.title}
                  className="rounded-2xl sm:rounded-3xl p-5 sm:p-7 transition-all"
                  style={
                    i === 0
                      ? {
                          background: "rgba(31,61,43,0.3)",
                          border: "1px solid rgba(31,61,43,0.6)",
                        }
                      : {
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.07)",
                        }
                  }
                >
                  <div
                    className="inline-flex items-center justify-center h-10 w-10 rounded-2xl mb-4 sm:mb-5"
                    style={
                      i === 0
                        ? { background: "rgba(203,191,154,0.12)", border: "1px solid rgba(203,191,154,0.2)" }
                        : { background: "rgba(31,61,43,0.25)", border: "1px solid rgba(31,61,43,0.4)" }
                    }
                  >
                    <item.icon
                      className="h-5 w-5"
                      style={{ color: i === 0 ? "#CBBF9A" : "rgba(203,191,154,0.7)" }}
                    />
                  </div>
                  <div
                    className="font-semibold mb-2"
                    style={{ color: i === 0 ? "#F9F8F4" : "rgba(249,248,244,0.85)" }}
                  >
                    {item.title}
                  </div>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: i === 0 ? "rgba(249,248,244,0.5)" : "rgba(255,255,255,0.35)" }}
                  >
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* ── How it works ── */}
          <section
            className="py-20 sm:py-28"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              <div className="text-center mb-12 sm:mb-16">
                <div
                  className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-3"
                  style={{ color: "rgba(203,191,154,0.6)" }}
                >
                  {t("home.steps.badge", "So einfach")}
                </div>
                <h2
                  className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight"
                  style={{ color: "#F9F8F4" }}
                >
                  {t("home.steps.title", "In 3 Schritten startklar")}
                </h2>
              </div>
              <div className="grid sm:grid-cols-3 gap-10 sm:gap-8 md:gap-12">
                {steps.map((item) => (
                  <div key={item.n} className="relative flex sm:block gap-5 sm:gap-0">
                    <div
                      className="text-7xl sm:text-8xl font-bold leading-none select-none mb-0 sm:mb-3 flex-shrink-0"
                      style={{ color: "rgba(31,61,43,0.4)" }}
                    >
                      {item.n}
                    </div>
                    <div className="pt-1 sm:pt-0">
                      <div className="font-semibold text-lg mb-2" style={{ color: "#F9F8F4" }}>
                        {item.title}
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Final CTA ── */}
          <section className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-28">
            <div
              className="rounded-2xl sm:rounded-3xl px-6 py-12 sm:px-10 sm:py-16 md:p-16 text-center relative overflow-hidden"
              style={{
                background: "rgba(31,61,43,0.2)",
                border: "1px solid rgba(31,61,43,0.5)",
              }}
            >
              {/* Radial glow inside CTA */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "radial-gradient(ellipse 70% 80% at 50% 120%, rgba(31,61,43,0.5) 0%, transparent 70%)",
                }}
              />
              <div className="relative">
                <div
                  className="text-[11px] uppercase tracking-[0.2em] mb-4 font-semibold"
                  style={{ color: "#CBBF9A" }}
                >
                  {t("home.final.badge")}
                </div>
                <h2
                  className="text-2xl sm:text-3xl md:text-5xl font-bold mb-6 sm:mb-8 max-w-xl mx-auto leading-tight tracking-tight"
                  style={{ color: "#F9F8F4" }}
                >
                  {t("home.final.title")}
                </h2>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href={`/${lang}/demo`}
                    className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold transition-opacity hover:opacity-90"
                    style={{
                      background: "#CBBF9A",
                      color: "#0C0F0E",
                    }}
                  >
                    {t("home.final.cta")} <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/${lang}/contact`}
                    className="inline-flex items-center justify-center rounded-full px-8 py-3.5 text-sm font-medium transition-colors hover:bg-white/5"
                    style={{
                      border: "1px solid rgba(249,248,244,0.15)",
                      color: "rgba(249,248,244,0.6)",
                    }}
                  >
                    {t("home.hero.cta_consulting")}
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>

        <SiteFooter />
      </div>
    </div>
  )
}
