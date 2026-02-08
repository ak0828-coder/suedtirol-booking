import { SiteHeader } from "@/components/marketing/site-header"
import { SiteFooter } from "@/components/marketing/site-footer"

export default function DatenschutzPage() {
  return (
    <div className="min-h-screen bg-[#f7f4ef] text-slate-900">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 py-12 space-y-6">
        <div className="text-xs uppercase tracking-wide text-slate-500">Datenschutz</div>
        <h1 className="text-3xl font-semibold">Datenschutz</h1>
        <p className="text-sm text-slate-600">
          Placeholder. Bitte Datenschutzerklaerung und Verantwortliche eintragen.
        </p>
      </main>
      <SiteFooter />
    </div>
  )
}
