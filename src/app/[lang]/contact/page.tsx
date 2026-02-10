import Link from "next/link"
import { SiteHeader } from "@/components/marketing/site-header"
import { SiteFooter } from "@/components/marketing/site-footer"
import { getDictionary } from "@/lib/dictionaries"
import { createTranslator } from "@/lib/translator"

export default async function ContactPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang as any)
  const t = createTranslator(dict)
  return (
    <div className="min-h-screen bg-[#F9F8F4] text-[#0E1A14]">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-12 space-y-12">
        <section className="space-y-4">
          <div className="text-xs uppercase tracking-[0.2em] text-[#1F3D2B]/70">{t("contact.hero.badge")}</div>
          <h1 className="text-4xl font-semibold">{t("contact.hero.title")}</h1>
          <p className="text-[#0E1A14]/70 max-w-3xl">{t("contact.hero.subtitle")}</p>
        </section>

        <section className="rounded-3xl border border-[#1F3D2B]/15 bg-white/90 p-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="text-sm font-semibold text-[#1F3D2B]">{t("contact.cards.demo.title")}</div>
              <p className="text-sm text-[#0E1A14]/70">{t("contact.cards.demo.desc")}</p>
              <a
                className="inline-flex items-center justify-center rounded-full bg-[#1F3D2B] px-5 py-2 text-[#F9F8F4]"
                href="mailto:hello@avaimo.com"
              >
                hello@avaimo.com
              </a>
            </div>
            <div className="space-y-4">
              <div className="text-sm font-semibold text-[#1F3D2B]">{t("contact.cards.live.title")}</div>
              <p className="text-sm text-[#0E1A14]/70">{t("contact.cards.live.desc")}</p>
              <Link
                href={`/${lang}/demo`}
                className="inline-flex items-center justify-center rounded-full border border-[#1F3D2B]/30 px-5 py-2 text-[#1F3D2B]"
              >
                {t("contact.cards.live.cta")}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
