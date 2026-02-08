import Link from "next/link";
import {
  Check,
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
  Calendar,
  CreditCard,
  FileSignature,
  Users,
  BarChart3,
  Zap,
} from "lucide-react";

const highlights = [
  {
    title: "Mitglieder & Abos",
    description: "Jahresbeitraege, Rabatte, Memberships und automatische Verlaengerungen.",
    icon: Users,
  },
  {
    title: "Online-Buchungen",
    description: "24/7 Platzbuchung mit Kollisionserkennung, Gast- und Member-Flow.",
    icon: Calendar,
  },
  {
    title: "Zahlungen & Abrechnung",
    description: "Stripe, Barzahlung, Gutscheine und klare Zahlungsstatus.",
    icon: CreditCard,
  },
  {
    title: "Vertragsgenerator",
    description: "Digitale Mitgliedsvertraege mit Feldern, Unterschrift und PDF.",
    icon: FileSignature,
  },
  {
    title: "Trainer & Kurse",
    description: "Trainerstunden, Camps, automatische Terminblocker und Abrechnung.",
    icon: Sparkles,
  },
  {
    title: "Reporting",
    description: "Auslastung, Einnahmen und Export fuer Steuerberater.",
    icon: BarChart3,
  },
];

const painPoints = [
  "WhatsApp-Chaos und Telefonketten fuer freie Plaetze",
  "Papiervertraege, Scans und Excel-Listen",
  "Barzahlungen ohne Uebersicht und offene Beitraege",
  "Trainer-Abrechnung per Hand",
];

const solutions = [
  "Buchungen und Mitglieder automatisch in einer App",
  "Digitale Vertraege mit Pflichtfeldern und Signatur",
  "Zahlungen sofort nachvollziehbar",
  "Trainer-Payouts auf Knopfdruck",
];

const plans = [
  {
    name: "Starter",
    price: "149",
    badge: "Fuer kleine Vereine",
    features: [
      "Platzbuchung",
      "Mitgliederverwaltung",
      "Vertraege & Dokumente",
      "E-Mail Support",
    ],
  },
  {
    name: "Pro",
    price: "299",
    badge: "Beliebtestes Paket",
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
    badge: "Fuer grosse Anlagen",
    features: [
      "Custom Workflows",
      "SLA & Support",
      "Reporting & Export",
      "Onboarding durch uns",
    ],
  },
];

const faqs = [
  {
    q: "Wie schnell sind wir startklar?",
    a: "In der Regel innerhalb von 48 Stunden inkl. Import.",
  },
  {
    q: "Koennen wir unsere Texte und Vertraege anpassen?",
    a: "Ja, jedes Feld und jeder Vertrag ist individualisierbar.",
  },
  {
    q: "Brauchen wir technisches Know-how?",
    a: "Nein. Avaimo ist fuer Vorstaende und Admins ohne IT-Kenntnisse gebaut.",
  },
  {
    q: "Gibt es eine Demo?",
    a: "Ja. Du kannst die Demo sofort starten und alle Module testen.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f7f4ef] text-slate-900">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#f3b87b]/40 blur-3xl" />
        <div className="absolute top-32 -left-28 h-96 w-96 rounded-full bg-[#6cc6b2]/40 blur-3xl" />
      </div>

      <header className="relative z-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <div className="text-lg font-semibold tracking-wide">Avaimo</div>
          <div className="flex items-center gap-3 text-sm">
            <Link href="#features" className="hover:opacity-70">
              Funktionen
            </Link>
            <Link href="#pricing" className="hover:opacity-70">
              Preise
            </Link>
            <Link href="#demo" className="hover:opacity-70">
              Demo
            </Link>
            <Link href="/demo" className="rounded-full bg-slate-900 px-4 py-2 text-white">
              Demo starten
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto max-w-6xl px-6 pt-10 pb-20">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/60 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-wide">
                <ShieldCheck className="h-4 w-4" /> Made in Suedtirol - DSGVO ready
              </div>
              <h1 className="text-4xl md:text-5xl leading-tight">
                Die Vereins-Software, die deine Arbeit erledigt, waehrend du schlaefst.
              </h1>
              <p className="text-lg text-slate-600">
                Avaimo automatisiert Buchungen, Mitglieder, Zahlungen, Vertraege und Trainer.
                Dein Verein laeuft sauber, professionell und ohne Excel-Chaos.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/demo"
                  className="rounded-full bg-slate-900 px-6 py-3 text-white flex items-center gap-2"
                >
                  Demo starten <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link href="#pricing" className="rounded-full border border-slate-300 px-6 py-3">
                  Preise ansehen
                </Link>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-slate-500">
                <span className="rounded-full bg-white px-3 py-1">48h Startklar</span>
                <span className="rounded-full bg-white px-3 py-1">Keine IT-Kenntnisse</span>
                <span className="rounded-full bg-white px-3 py-1">Jederzeit kuendbar</span>
              </div>
            </div>

            <div className="rounded-3xl bg-slate-900 text-white p-6 shadow-2xl">
              <div className="text-xs uppercase tracking-wide text-slate-400">Live Dashboard Preview</div>
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl bg-slate-800 p-4">
                  <div className="text-sm text-slate-300">Buchung heute</div>
                  <div className="text-2xl font-semibold">Platz 3 - 19:00</div>
                  <div className="text-xs text-slate-500">Mitglied - bezahlt</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-slate-800 p-4">
                    <div className="text-xs text-slate-400">Offene Beitraege</div>
                    <div className="text-2xl font-semibold">8</div>
                  </div>
                  <div className="rounded-2xl bg-slate-800 p-4">
                    <div className="text-xs text-slate-400">Trainerstunden</div>
                    <div className="text-2xl font-semibold">12</div>
                  </div>
                </div>
                <div className="rounded-2xl bg-gradient-to-r from-[#6cc6b2] to-[#f3b87b] p-4 text-slate-900">
                  <div className="text-xs uppercase tracking-wide">KI Dokument Check</div>
                  <div className="text-lg font-semibold">Attest geprueft - OK</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-16">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200/60 bg-white p-6">
              <div className="text-sm font-semibold uppercase text-slate-500">Pain</div>
              <ul className="mt-4 space-y-3 text-slate-700">
                {painPoints.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-rose-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-slate-200/60 bg-white p-6">
              <div className="text-sm font-semibold uppercase text-slate-500">Loesung</div>
              <ul className="mt-4 space-y-3 text-slate-700">
                {solutions.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-emerald-500 mt-1" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-6xl px-6 pb-20">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-semibold">Alles, was dein Verein braucht</h2>
            <div className="text-sm text-slate-500">Modular, skalierbar, sofort startklar.</div>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {highlights.map((item) => (
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
          <div className="rounded-3xl border border-slate-200/60 bg-gradient-to-r from-[#0f172a] to-[#1f2937] p-10 text-white">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-300">Social Proof</div>
                <h3 className="mt-3 text-3xl font-semibold">Vorstaende gewinnen Zeit. Mitglieder bleiben aktiv.</h3>
                <p className="mt-3 text-slate-300">
                  Avaimo reduziert Verwaltungsaufwand, sorgt fuer volle Plaetze und klare Finanzen.
                </p>
              </div>
              <div className="grid gap-4">
                <div className="rounded-2xl bg-white/10 p-4">
                  <div className="text-sm">"30% weniger Admin-Aufwand nach 6 Wochen."</div>
                  <div className="text-xs text-slate-300 mt-2">Sportverein Example, Bozen</div>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <div className="text-sm">"Unsere Trainerabrechnung dauert jetzt 5 Minuten."</div>
                  <div className="text-xs text-slate-300 mt-2">Tennis Club Example</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-6xl px-6 pb-20">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-semibold">Preise</h2>
            <div className="text-sm text-slate-500">Transparent und ohne versteckte Kosten.</div>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <div key={plan.name} className="rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm">
                <div className="text-xs uppercase tracking-wide text-slate-400">{plan.badge}</div>
                <div className="mt-2 text-2xl font-semibold">{plan.name}</div>
                <div className="mt-4 text-3xl font-semibold text-slate-900">
                  {plan.price} {plan.price === "Individuell" ? "" : "EUR"}
                </div>
                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-500" /> {feature}
                    </div>
                  ))}
                </div>
                <Link
                  href="/demo"
                  className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-white"
                >
                  Demo anfordern
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section id="demo" className="mx-auto max-w-6xl px-6 pb-20">
          <div className="rounded-3xl border border-slate-200/60 bg-white p-8">
            <div className="flex items-start gap-6">
              <Zap className="h-8 w-8 text-amber-500" />
              <div>
                <h3 className="text-2xl font-semibold">Demo in 3 Minuten</h3>
                <p className="text-slate-600">
                  Teste alle Funktionen live oder buche eine gefuehrte Demo.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link href="/demo" className="rounded-full bg-slate-900 px-5 py-2 text-white">
                    Demo starten
                  </Link>
                  <Link href="#pricing" className="rounded-full border border-slate-300 px-5 py-2">
                    Preise vergleichen
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-semibold">FAQ</h2>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {faqs.map((item) => (
              <div key={item.q} className="rounded-2xl border border-slate-200/60 bg-white p-6">
                <div className="text-base font-semibold">{item.q}</div>
                <p className="mt-2 text-sm text-slate-600">{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200/60 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 py-8 md:flex-row">
          <div>
            <div className="text-sm font-semibold">Avaimo</div>
            <div className="text-xs text-slate-500">Vereinsplattform fuer Buchung, Mitglieder und Finanzen.</div>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>Impressum</span>
            <span>Datenschutz</span>
            <span>Kontakt</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
