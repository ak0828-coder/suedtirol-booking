import { SiteHeader } from "@/components/marketing/site-header"
import { SiteFooter } from "@/components/marketing/site-footer"
import { ShieldCheck, Lock, Server, FileCheck } from "lucide-react"
import { getDictionary } from "@/lib/dictionaries"
import { createTranslator } from "@/lib/translator"

export default async function SecurityPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang as any)
  const t = createTranslator(dict)
  const items = [
    {
      title: t("security.items.gdpr.title"),
      icon: ShieldCheck,
      text: t("security.items.gdpr.text"),
    },
    {
      title: t("security.items.access.title"),
      icon: Lock,
      text: t("security.items.access.text"),
    },
    {
      title: t("security.items.infrastructure.title"),
      icon: Server,
      text: t("security.items.infrastructure.text"),
    },
    {
      title: t("security.items.contracts.title"),
      icon: FileCheck,
      text: t("security.items.contracts.text"),
    },
  ]

  return (
    <div className="min-h-screen bg-[#F9F8F4] text-[#0E1A14]">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-12 space-y-12">
        <section className="space-y-4">
          <div className="text-xs uppercase tracking-[0.2em] text-[#1F3D2B]/70">{t("security.hero.badge")}</div>
          <h1 className="text-4xl font-semibold">{t("security.hero.title")}</h1>
          <p className="text-[#0E1A14]/70 max-w-3xl">{t("security.hero.subtitle")}</p>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          {items.map((item) => (
            <div key={item.title} className="rounded-3xl border border-[#1F3D2B]/15 bg-white/90 p-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#1F3D2B]">
                <item.icon className="h-4 w-4" /> {item.title}
              </div>
              <p className="mt-3 text-sm text-[#0E1A14]/70">{item.text}</p>
            </div>
          ))}
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
