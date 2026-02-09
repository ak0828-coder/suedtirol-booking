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

const proof = [
  { label: "48h Startklar", value: "Onboarding + Datenimport" },
  { label: "DSGVO Ready", value: "Datenhaltung in der EU" },
  { label: "No Excel", value: "Alles in einer Plattform" },
]

const modules = [
  {
    title: "Buchungen & Plätze",
    description: "Live-Kalender, Kollisionserkennung, Öffnungszeiten, Sperrzeiten.",
    icon: Calendar,
  },
  {
    title: "Mitgliedschaften",
    description: "Abos, Rabatte, Status, Einladungen und Vertrags-Onboarding.",
    icon: Users,
  },
  {
    title: "Zahlungen",
    description: "Stripe, Barzahlung, Gutscheine, automatische Zahlungs-Status.",
    icon: CreditCard,
  },
  {
    title: "Verträge",
    description: "Digitale Signatur, Pflichtfelder, PDF-Export, Revision.",
    icon: FileSignature,
  },
  {
    title: "Trainer & Kurse",
    description: "Trainerstunden, Kurse, Sessions, Abrechnung und Payouts.",
    icon: Sparkles,
  },
  {
    title: "Reporting",
    description: "Auslastung, Einnahmen, Export für Steuerberater.",
    icon: BarChart3,
  },
]

const pains = [
  "Telefonketten und WhatsApp-Chaos für freie Plätze",
  "Papierverträge, Scans, manuelle Ablage",
  "Offene Beiträge ohne klare Übersicht",
  "Trainer-Abrechnung per Hand und Excel",
]

const outcomes = [
  "Buchung und Mitgliederverwaltung in einem System",
  "Verträge digital und rechtssicher",
  "Zahlungen sauber nachvollziehbar",
  "Trainer und Kurse automatisiert abrechnen",
]

export default function Home() {
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
                Old Money Tennis · DSGVO-ready
              </div>
              <h1 className="text-4xl md:text-6xl leading-tight font-semibold">
                Vereinsführung mit Ruhe, Stil und absoluter Kontrolle.
              </h1>
              <p className="text-lg text-[#0E1A14]/70">
                Avaimo verbindet Buchung, Mitglieder, Zahlungen, Verträge und Trainer in einer
                Oberfläche, die sich anfühlt wie ein perfekt gepflegter Court: klar, elegant, sofort verständlich.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/demo"
                  className="rounded-full bg-[#1F3D2B] px-6 py-3 text-[#F9F8F4] inline-flex items-center gap-2 shadow-[0_10px_30px_-18px_rgba(14,26,20,0.8)]"
                >
                  Demo ansehen <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/contact"
                  className="rounded-full border border-[#1F3D2B]/30 px-6 py-3 text-[#1F3D2B] hover:bg-[#1F3D2B]/5"
                >
                  Beratung anfragen
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
              <div className="text-xs uppercase tracking-[0.2em] text-[#CBBF9A]">Executive Overview</div>
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl bg-[#0E1A14]/70 p-4">
                  <div className="text-sm text-[#F9F8F4]/70">Buchung heute</div>
                  <div className="text-2xl font-semibold">Platz 3 · 19:00</div>
                  <div className="text-xs text-[#F9F8F4]/60">Mitglied · bezahlt</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-[#0E1A14]/70 p-4">
                    <div className="text-xs text-[#F9F8F4]/60">Offene Beiträge</div>
                    <div className="text-2xl font-semibold">8</div>
                  </div>
                  <div className="rounded-2xl bg-[#0E1A14]/70 p-4">
                    <div className="text-xs text-[#F9F8F4]/60">Trainerstunden</div>
                    <div className="text-2xl font-semibold">12</div>
                  </div>
                </div>
                <div className="rounded-2xl bg-[#CBBF9A] p-4 text-[#0E1A14]">
                  <div className="text-xs uppercase tracking-[0.2em]">Dokumente</div>
                  <div className="text-lg font-semibold">Attest geprüft · OK</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-16">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-[#1F3D2B]/15 bg-white/90 p-6">
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-[#1F3D2B]/70">
                So sieht es heute aus
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
                So sieht es mit Avaimo aus
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
            <h2 className="text-3xl font-semibold">Module, die Vereine sofort spüren</h2>
            <Link href="/features" className="text-sm text-[#1F3D2B] hover:text-[#0E1A14]">
              Alle Funktionen ansehen
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
                <div className="text-xs uppercase tracking-[0.2em] text-[#1F3D2B]/70">Ergebnisse</div>
                <h3 className="mt-3 text-3xl font-semibold">Weniger Admin-Aufwand, mehr aktive Mitglieder.</h3>
                <p className="mt-3 text-[#0E1A14]/70">
                  Avaimo reduziert Routinearbeit und sorgt für volle Plätze, transparente Finanzen
                  und ein modernes Vereinsimage.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/demo" className="rounded-full bg-[#1F3D2B] px-5 py-2 text-[#F9F8F4]">
                    Demo ansehen
                  </Link>
                  <Link href="/pricing" className="rounded-full border border-[#1F3D2B]/30 px-5 py-2 text-[#1F3D2B]">
                    Preise vergleichen
                  </Link>
                </div>
              </div>
              <div className="grid gap-4">
                {[
                  ["30%", "weniger Admin-Aufwand nach 6 Wochen"],
                  ["+18%", "mehr belegte Plätze im Schnitt"],
                  ["5 Min", "Trainer-Abrechnung im Monatsabschluss"],
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
                <div className="text-xs uppercase tracking-[0.2em] text-[#CBBF9A]">Bereit für Avaimo?</div>
                <h3 className="mt-2 text-3xl font-semibold">Sieh dein Vereins-Dashboard jetzt live.</h3>
              </div>
              <Link href="/demo" className="rounded-full bg-[#CBBF9A] px-6 py-3 text-[#0E1A14]">
                Demo starten
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}

