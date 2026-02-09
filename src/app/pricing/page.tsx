import Link from "next/link"
import { SiteHeader } from "@/components/marketing/site-header"
import { SiteFooter } from "@/components/marketing/site-footer"
import { Check } from "lucide-react"

const tiers = [
  {
    name: "Starter",
    price: "149 EUR / Monat",
    description: "für kleine Vereine mit Fokus auf Buchung und Mitglieder.",
    features: [
      "Buchungssystem",
      "Mitgliederverwaltung",
      "Verträge & Dokumente",
      "E-Mail-Support",
    ],
  },
  {
    name: "Pro",
    price: "299 EUR / Monat",
    description: "Der Standard für wachsende Clubs mit Zahlungen & Trainer.",
    features: [
      "Alles aus Starter",
      "Online-Zahlungen & Gutscheine",
      "Trainer & Kurse",
      "Automatisierte Mails",
    ],
  },
  {
    name: "Enterprise",
    price: "Individuell",
    description: "für Größere Anlagen mit mehreren Standorten.",
    features: [
      "Custom Workflows",
      "SLA & Support",
      "Reporting & Export",
      "Onboarding durch Avaimo",
    ],
  },
]

const addOns = [
  "KI Dokumenten-Check",
  "Erweitertes Reporting",
  "Individuelle Integrationen",
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f7] text-slate-900">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-12 space-y-12">
        <section className="space-y-4">
          <div className="text-xs uppercase tracking-wide text-slate-500">Preise</div>
          <h1 className="text-4xl font-semibold">Transparente Pakete für jeden Verein.</h1>
          <p className="text-slate-600 max-w-3xl">
            Unsere Pakete sind modular. Du kannst jederzeit upgraden oder Module hinzubuchen.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {tiers.map((tier) => (
            <div key={tier.name} className="rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold">{tier.name}</div>
              <div className="mt-2 text-2xl font-semibold">{tier.price}</div>
              <p className="mt-2 text-sm text-slate-600">{tier.description}</p>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                {tier.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500" /> {feature}
                  </div>
                ))}
              </div>
              <Link href="/contact" className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-white">
                Angebot anfragen
              </Link>
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-slate-200/60 bg-white p-6">
          <div className="text-sm font-semibold">Optionale Module</div>
          <p className="mt-2 text-sm text-slate-600">
            Du kannst jedes Paket mit zusätzlichen Modulen erweitern.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {addOns.map((item) => (
              <div key={item} className="rounded-full border border-slate-200/60 bg-slate-50 px-4 py-2 text-sm text-slate-700">
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

