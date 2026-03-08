"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useI18n } from "@/components/i18n/locale-provider"
import { useState } from "react"
import { Menu, X } from "lucide-react"

export function SiteHeader() {
  const params = useParams()
  const lang = typeof params?.lang === "string" ? params.lang : "de"
  const { t } = useI18n()
  const [open, setOpen] = useState(false)

  const navItems = [
    { href: `/${lang}/features`, label: t("nav.features") },
    { href: `/${lang}/pricing`, label: t("nav.pricing") },
    { href: `/${lang}/demo`, label: t("nav.demo") },
    { href: `/${lang}/security`, label: t("nav.security", "Sicherheit") },
    { href: `/${lang}/contact`, label: t("nav.contact") },
  ]

  return (
    <header className="sticky top-0 z-30 border-b border-[#0E1A14]/10 bg-[#1F3D2B]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
        <Link href={`/${lang}`} className="text-lg font-semibold tracking-tight text-[#F9F8F4]">
          {t("app.name", "Avaimo")}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[#F9F8F4]/80 hover:text-[#F9F8F4] transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            href={`/${lang}/demo`}
            className="rounded-full border border-[#F9F8F4]/30 bg-transparent px-4 py-2 text-sm text-[#F9F8F4] hover:bg-[#F9F8F4]/10 transition-colors"
          >
            {t("cta.demo", "Demo ansehen")}
          </Link>
          <Link
            href={`/${lang}/contact`}
            className="rounded-full bg-[#CBBF9A] px-4 py-2 text-sm font-medium text-[#0E1A14] hover:opacity-90 transition-opacity"
          >
            {t("cta.consulting", "Beratung")}
          </Link>
        </div>

        {/* Mobile: Demo CTA + hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href={`/${lang}/demo`}
            className="rounded-full bg-[#CBBF9A] px-3.5 py-1.5 text-sm font-medium text-[#0E1A14]"
          >
            Demo
          </Link>
          <button
            onClick={() => setOpen(true)}
            className="rounded-full p-2 text-[#F9F8F4] hover:bg-[#F9F8F4]/10 transition-colors"
            aria-label="Menü öffnen"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-72 max-w-[85vw] bg-[#1F3D2B] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#F9F8F4]/10">
              <span className="font-semibold text-[#F9F8F4]">{t("app.name", "Avaimo")}</span>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-1.5 text-[#F9F8F4]/70 hover:bg-[#F9F8F4]/10 transition-colors"
                aria-label="Menü schließen"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-3 text-sm text-[#F9F8F4]/80 hover:bg-[#F9F8F4]/10 hover:text-[#F9F8F4] transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t border-[#F9F8F4]/10 space-y-2">
              <Link
                href={`/${lang}/demo`}
                onClick={() => setOpen(false)}
                className="block text-center rounded-full border border-[#F9F8F4]/30 px-4 py-2.5 text-sm text-[#F9F8F4] hover:bg-[#F9F8F4]/10 transition-colors"
              >
                {t("cta.demo", "Demo ansehen")}
              </Link>
              <Link
                href={`/${lang}/contact`}
                onClick={() => setOpen(false)}
                className="block text-center rounded-full bg-[#CBBF9A] px-4 py-2.5 text-sm font-medium text-[#0E1A14] hover:opacity-90 transition-opacity"
              >
                {t("cta.consulting", "Beratung")}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
