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
    <div className="min-h-screen bg-[#f5f5f7] text-slate-900">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#f3b87b]/40 blur-3xl" />
        <div className="absolute top-32 -left-28 h-96 w-96 rounded-full bg-[#6cc6b2]/40 blur-3xl" />
      </div>

      <SiteHeader />

      <main className="relative z-10">
        <section className="mx-auto max-w-6xl px-6 pt-10 pb-20">
          <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/60 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-wide">
                Made in Südtirol · DSGVO-ready
              </div>
              <h1 className="text-4xl md:text-5xl leading-tight">
                Die Vereins-Software, die euren Betrieb leitet, während ihr auf dem Platz seid.
              </h1>
              <p className="text-lg text-slate-600">
                Avaimo vereint Buchung, Mitgliedschaften, Zahlungen, Verträge und Trainer in einer
                Plattform. Weniger Verwaltung, mehr Zeit für den Sport.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/demo"
                  className="rounded-full bg-slate-900 px-6 py-3 text-white inline-flex items-center gap-2"
                >
                  Demo ansehen <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/contact" className="rounded-full border border-slate-300 px-6 py-3">
                  Beratung anfragen
                </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {proof.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-slate-200/60 bg-white p-4">
                    <div className="text-sm font-semibold">{item.label}</div>
                    <div className="text-xs text-slate-500">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-slate-900 text-white p-6 shadow-2xl">
              <div className="text-xs uppercase tracking-wide text-slate-400">Admin Overview</div>
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl bg-slate-800 p-4">
                  <div className="text-sm text-slate-300">Buchung heute</div>
                  <div className="text-2xl font-semibold">Platz 3 - 19:00</div>
                  <div className="text-xs text-slate-500">Mitglied - bezahlt</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-slate-800 p-4">
                    <div className="text-xs text-slate-400">Offene Beiträge</div>
                    <div className="text-2xl font-semibold">8</div>
                  </div>
                  <div className="rounded-2xl bg-slate-800 p-4">
                    <div className="text-xs text-slate-400">Trainerstunden</div>
                    <div className="text-2xl font-semibold">12</div>
                  </div>
                </div>
                <div className="rounded-2xl bg-gradient-to-r from-[#6cc6b2] to-[#f3b87b] p-4 text-slate-900">
                  <div className="text-xs uppercase tracking-wide">KI Dokument Check</div>
                  <div className="text-lg font-semibold">Attest geprüft - OK</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-16">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200/60 bg-white p-6">
              <div className="text-sm font-semibold uppercase text-slate-500">So sieht es heute aus</div>
              <ul className="mt-4 space-y-3 text-slate-700">
                {pains.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-rose-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-slate-200/60 bg-white p-6">
              <div className="text-sm font-semibold uppercase text-slate-500">So sieht es mit Avaimo aus</div>
              <ul className="mt-4 space-y-3 text-slate-700">
                {outcomes.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-emerald-500 mt-1" />
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
            <Link href="/features" className="text-sm text-slate-500 hover:text-slate-700">
              Alle Funktionen ansehen
            </Link>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {modules.map((item) => (
              <div key={item.title} className="rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <item.icon className="h-4 w-4" /> {item.title}
                </div>
                <p className="mt-3 text-sm text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-20">
          <div className="rounded-3xl border border-slate-200/60 bg-white p-10">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">Ergebnisse</div>
                <h3 className="mt-3 text-3xl font-semibold">Weniger Admin-Aufwand, mehr aktive Mitglieder.</h3>
                <p className="mt-3 text-slate-600">
                  Avaimo reduziert Routinearbeit und sorgt für volle Plätze, transparente Finanzen
                  und ein modernes Vereinsimage.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/demo" className="rounded-full bg-slate-900 px-5 py-2 text-white">
                    Demo ansehen
                  </Link>
                  <Link href="/pricing" className="rounded-full border border-slate-300 px-5 py-2">
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
                  <div key={label} className="rounded-2xl border border-slate-200/60 bg-slate-50 p-4">
                    <div className="text-2xl font-semibold">{value}</div>
                    <div className="text-xs text-slate-500">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="rounded-3xl border border-slate-200/60 bg-slate-900 p-10 text-white">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-400">Bereit für Avaimo?</div>
                <h3 className="mt-2 text-3xl font-semibold">Sieh dein Vereins-Dashboard jetzt live.</h3>
              </div>
              <Link href="/demo" className="rounded-full bg-white px-6 py-3 text-slate-900">
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

