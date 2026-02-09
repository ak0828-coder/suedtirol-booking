import { SiteHeader } from "@/components/marketing/site-header"
import { SiteFooter } from "@/components/marketing/site-footer"
import { ShieldCheck, Lock, Server, FileCheck } from "lucide-react"

const items = [
  {
    title: "DSGVO & Hosting",
    icon: ShieldCheck,
    text: "Datenhaltung in der EU, klare Rollen und Audit-Trails für jedes Dokument.",
  },
  {
    title: "Zugriffsrechte",
    icon: Lock,
    text: "Feingranulare Rechte für Vorstand, Admin, Trainer und Mitglieder.",
  },
  {
    title: "Infrastruktur",
    icon: Server,
    text: "Skalierbare Architektur mit getrennten Rollen und sicherer Speicherung.",
  },
  {
    title: "Vertraege & Nachweise",
    icon: FileCheck,
    text: "Digitale Signaturen, PDFs, Nachvollziehbarkeit und Exportmoeglichkeit.",
  },
]

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-[#f7f4ef] text-slate-900">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-12 space-y-12">
        <section className="space-y-4">
          <div className="text-xs uppercase tracking-wide text-slate-500">Sicherheit</div>
          <h1 className="text-4xl font-semibold">Sicher, nachvollziehbar, DSGVO-konform.</h1>
          <p className="text-slate-600 max-w-3xl">
            Avaimo ist für Vereine gebaut, die mit sensiblen Mitgliedsdaten arbeiten.
            Sicherheit ist nicht optional, sondern Standard.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          {items.map((item) => (
            <div key={item.title} className="rounded-3xl border border-slate-200/60 bg-white p-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <item.icon className="h-4 w-4" /> {item.title}
              </div>
              <p className="mt-3 text-sm text-slate-600">{item.text}</p>
            </div>
          ))}
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

