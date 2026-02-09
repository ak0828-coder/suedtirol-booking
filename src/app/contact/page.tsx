import Link from "next/link"
import { SiteHeader } from "@/components/marketing/site-header"
import { SiteFooter } from "@/components/marketing/site-footer"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f7] text-slate-900">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-12 space-y-12">
        <section className="space-y-4">
          <div className="text-xs uppercase tracking-wide text-slate-500">Kontakt</div>
          <h1 className="text-4xl font-semibold">Lass uns deinen Verein automatisieren.</h1>
          <p className="text-slate-600 max-w-3xl">
            Sag uns kurz, wie dein Verein organisiert ist. Wir zeigen dir eine Demo,
            die genau zu euch passt.
          </p>
        </section>

        <section className="rounded-3xl border border-slate-200/60 bg-white p-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="text-sm font-semibold">Demo anfragen</div>
              <p className="text-sm text-slate-600">
                Schick uns eine Mail mit Vereinsname, Anzahl Plätze und aktuellem Ablauf.
              </p>
              <a
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-white"
                href="mailto:hello@avaimo.com"
              >
                hello@avaimo.com
              </a>
            </div>
            <div className="space-y-4">
              <div className="text-sm font-semibold">Oder starte direkt die Demo</div>
              <p className="text-sm text-slate-600">
                Sieh dir die Admin- und Mitgliederansicht an, ohne Login.
              </p>
              <Link
                href="/demo"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-2"
              >
                Demo ansehen
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

