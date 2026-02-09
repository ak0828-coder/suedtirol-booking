import { SiteHeader } from "@/components/marketing/site-header"
import { SiteFooter } from "@/components/marketing/site-footer"

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-[#F9F8F4] text-[#0E1A14]">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 py-12 space-y-6">
        <div className="text-xs uppercase tracking-[0.2em] text-[#1F3D2B]/70">Impressum</div>
        <h1 className="text-3xl font-semibold">Impressum</h1>
        <p className="text-sm text-[#0E1A14]/70">
          Placeholder. Bitte Firmenadresse, UID und Kontaktangaben eintragen.
        </p>
      </main>
      <SiteFooter />
    </div>
  )
}
