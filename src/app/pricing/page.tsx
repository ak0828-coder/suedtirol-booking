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
    <div className="min-h-screen bg-[#F9F8F4] text-[#0E1A14]">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-12 space-y-12">
        <section className="space-y-4">
          <div className="text-xs uppercase tracking-[0.2em] text-[#1F3D2B]/70">Preise</div>
          <h1 className="text-4xl font-semibold">Transparente Pakete für jeden Verein.</h1>
          <p className="text-[#0E1A14]/70 max-w-3xl">
            Unsere Pakete sind modular. Du kannst jederzeit upgraden oder Module hinzubuchen.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {tiers.map((tier) => {
            const isPro = tier.name === "Pro"
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
                  href="/contact"
                  className={`mt-6 inline-flex w-full items-center justify-center rounded-full px-4 py-2 ${
                    isPro ? "bg-[#CBBF9A] text-[#0E1A14]" : "bg-[#1F3D2B] text-[#F9F8F4]"
                  }`}
                >
                  Angebot anfragen
                </Link>
              </div>
            )
          })}
        </section>

        <section className="rounded-3xl border border-[#1F3D2B]/15 bg-white/90 p-6">
          <div className="text-sm font-semibold text-[#1F3D2B]">Optionale Module</div>
          <p className="mt-2 text-sm text-[#0E1A14]/70">
            Du kannst jedes Paket mit zusätzlichen Modulen erweitern.
          </p>
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

