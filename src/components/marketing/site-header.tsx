"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useI18n } from "@/components/i18n/locale-provider"

export function SiteHeader() {
  const params = useParams()
  const lang = typeof params?.lang === "string" ? params.lang : "de"
  const { t } = useI18n()
  const navItems = [
    { href: `/${lang}/features`, label: t("nav.features") },
    { href: `/${lang}/pricing`, label: t("nav.pricing") },
    { href: `/${lang}/demo`, label: t("nav.demo") },
    { href: `/${lang}/security`, label: t("nav.security", "Sicherheit") },
    { href: `/${lang}/contact`, label: t("nav.contact") },
  ]
  return (
    <header className="sticky top-0 z-30 border-b border-[#0E1A14]/10 bg-[#1F3D2B]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href={`/${lang}`} className="text-lg font-semibold tracking-tight text-[#F9F8F4]">
          {t("app.name", "Avaimo")}
        </Link>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-[#F9F8F4]/80 hover:text-[#F9F8F4]">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href={`/${lang}/demo`}
            className="rounded-full border border-[#F9F8F4]/30 bg-transparent px-4 py-2 text-sm text-[#F9F8F4] hover:bg-[#F9F8F4]/10"
          >
            {t("cta.demo", "Demo ansehen")}
          </Link>
          <Link
            href={`/${lang}/contact`}
            className="rounded-full bg-[#CBBF9A] px-4 py-2 text-sm text-[#0E1A14] hover:opacity-90"
          >
            {t("cta.consulting", "Beratung")}
          </Link>
        </div>
      </div>
    </header>
  )
}
