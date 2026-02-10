"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useI18n } from "@/components/i18n/locale-provider"

export function SiteFooter() {
  const params = useParams()
  const lang = typeof params?.lang === "string" ? params.lang : "de"
  const { t } = useI18n()
  const footerLinks = [
    { href: `/${lang}/features`, label: t("nav.features") },
    { href: `/${lang}/pricing`, label: t("nav.pricing") },
    { href: `/${lang}/security`, label: t("nav.security", "Sicherheit") },
    { href: `/${lang}/contact`, label: t("nav.contact") },
  ]

  return (
    <footer className="border-t border-[#0E1A14]/10 bg-[#1F3D2B]">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-10 md:flex-row">
        <div className="space-y-2">
          <div className="text-sm font-semibold text-[#F9F8F4]">{t("app.name", "Avaimo")}</div>
          <div className="text-xs text-[#F9F8F4]/70">
            {t("footer.tagline_short", "Vereinsplattform für Buchung, Mitglieder und Finanzen.")}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs text-[#F9F8F4]/70">
          {footerLinks.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-[#F9F8F4]">
              {item.label}
            </Link>
          ))}
          <Link href={`/${lang}/impressum`} className="hover:text-[#F9F8F4]">
            {t("footer.impressum", "Impressum")}
          </Link>
          <Link href={`/${lang}/datenschutz`} className="hover:text-[#F9F8F4]">
            {t("footer.privacy", "Datenschutz")}
          </Link>
        </div>
      </div>
    </footer>
  )
}
