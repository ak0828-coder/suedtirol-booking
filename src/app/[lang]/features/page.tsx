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
import { getDictionary } from "@/lib/dictionaries"
import { createTranslator } from "@/lib/translator"

export default async function FeaturesPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang as any)
  const t = createTranslator(dict)
  const featureBlocks = [
    {
      title: t("features.blocks.booking.title"),
      icon: Calendar,
      bullets: [
        t("features.blocks.booking.bullets.0"),
        t("features.blocks.booking.bullets.1"),
        t("features.blocks.booking.bullets.2"),
      ],
    },
    {
      title: t("features.blocks.members.title"),
      icon: Users,
      bullets: [
        t("features.blocks.members.bullets.0"),
        t("features.blocks.members.bullets.1"),
        t("features.blocks.members.bullets.2"),
      ],
    },
    {
      title: t("features.blocks.payments.title"),
      icon: CreditCard,
      bullets: [
        t("features.blocks.payments.bullets.0"),
        t("features.blocks.payments.bullets.1"),
        t("features.blocks.payments.bullets.2"),
      ],
    },
    {
      title: t("features.blocks.contracts.title"),
      icon: FileSignature,
      bullets: [
        t("features.blocks.contracts.bullets.0"),
        t("features.blocks.contracts.bullets.1"),
        t("features.blocks.contracts.bullets.2"),
      ],
    },
    {
      title: t("features.blocks.training.title"),
      icon: Sparkles,
      bullets: [
        t("features.blocks.training.bullets.0"),
        t("features.blocks.training.bullets.1"),
        t("features.blocks.training.bullets.2"),
      ],
    },
    {
      title: t("features.blocks.reporting.title"),
      icon: BarChart3,
      bullets: [
        t("features.blocks.reporting.bullets.0"),
        t("features.blocks.reporting.bullets.1"),
        t("features.blocks.reporting.bullets.2"),
      ],
    },
  ]

  const extraBlocks = [
    {
      title: t("features.extra.security.title"),
      icon: ShieldCheck,
      description: t("features.extra.security.desc"),
    },
    {
      title: t("features.extra.notifications.title"),
      icon: Bell,
      description: t("features.extra.notifications.desc"),
    },
    {
      title: t("features.extra.engagement.title"),
      icon: Target,
      description: t("features.extra.engagement.desc"),
    },
  ]

  return (
    <div className="min-h-screen bg-[#F9F8F4] text-[#0E1A14]">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-12 space-y-16">
        <section className="space-y-4">
          <div className="text-xs uppercase tracking-[0.2em] text-[#1F3D2B]/70">{t("features.hero.badge")}</div>
          <h1 className="text-4xl font-semibold">{t("features.hero.title")}</h1>
          <p className="text-[#0E1A14]/70 max-w-3xl">{t("features.hero.subtitle")}</p>
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
