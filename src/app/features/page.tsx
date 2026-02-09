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
} from "lucide-react"

const featureBlocks = [
  {
    title: "Buchung & Platzverwaltung",
    icon: Calendar,
    bullets: [
      "Live Kalender mit Kollisionserkennung",
      "Sperrzeiten, Öffnungszeiten und Sondertage",
      "Gäste und Mitglieder in einem Flow",
    ],
  },
  {
    title: "Mitglieder & Abos",
    icon: Users,
    bullets: [
      "Individuelle Mitgliedschaftspläne",
      "Rabatte und kostenlose Zeiten pro Plan",
      "Einladungen, Status und Historie",
    ],
  },
  {
    title: "Zahlungen & Mahnwesen",
    icon: CreditCard,
    bullets: [
      "Stripe, Barzahlung, Gutscheine",
      "Automatische Zahlungsstatus",
      "Übersicht für Kassierer und Vorstand",
    ],
  },
  {
    title: "Verträge & Dokumente",
    icon: FileSignature,
    bullets: [
      "Digitale Signatur und Pflichtfelder",
      "PDF-Export und revisionssichere Ablage",
      "Onboarding für neue Mitglieder",
    ],
  },
  {
    title: "Trainer & Kurse",
    icon: Sparkles,
    bullets: [
      "Trainerstunden mit Platz- und Trainerabgleich",
      "Kurse, Camps, Serien-Termine",
      "Trainer-Abrechnung mit Payouts",
    ],
  },
  {
    title: "Reporting & Exporte",
    icon: BarChart3,
    bullets: [
      "Auslastung, Einnahmen, Trends",
      "CSV/DATEV Export für Steuerberater",
      "Monatsreports für Vorstand",
    ],
  },
]

const extraBlocks = [
  {
    title: "Sicherheit & Rollen",
    icon: ShieldCheck,
    description: "Rollenbasierter Zugriff, DSGVO-konforme Datenhaltung, revisionssichere Logs.",
  },
  {
    title: "Benachrichtigungen",
    icon: Bell,
    description: "E-Mails, Erinnerungen, automatische Updates bei Ausfällen und Änderungen.",
  },
  {
    title: "Engagement",
    icon: Target,
    description: "Ranglisten, Match-Recaps und Community-Features für aktive Mitglieder.",
  },
]

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#F9F8F4] text-[#0E1A14]">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-12 space-y-16">
        <section className="space-y-4">
          <div className="text-xs uppercase tracking-[0.2em] text-[#1F3D2B]/70">Funktionen</div>
          <h1 className="text-4xl font-semibold">Alles, was ein moderner Verein braucht.</h1>
          <p className="text-[#0E1A14]/70 max-w-3xl">
            Avaimo verbindet Buchung, Mitglieder, Zahlungen, Verträge und Trainer in einer Plattform.
            Modulare Features sorgen dafür, dass jeder Verein nur das sieht, was er braucht.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featureBlocks.map((block) => (
            <div key={block.title} className="rounded-3xl border border-[#1F3D2B]/15 bg-white/90 p-6 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#1F3D2B]">
                <block.icon className="h-4 w-4" /> {block.title}
              </div>
              <ul className="mt-4 space-y-2 text-sm text-[#0E1A14]/70">
                {block.bullets.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-[#CBBF9A]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {extraBlocks.map((block) => (
            <div key={block.title} className="rounded-3xl border border-[#1F3D2B]/15 bg-white/90 p-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#1F3D2B]">
                <block.icon className="h-4 w-4" /> {block.title}
              </div>
              <p className="mt-3 text-sm text-[#0E1A14]/70">{block.description}</p>
            </div>
          ))}
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

