"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useI18n } from "@/components/i18n/locale-provider"
import { Globe } from "lucide-react"

export function SiteFooter() {
  const params = useParams()
  const lang = typeof params?.lang === "string" ? params.lang : "de"
  const { t } = useI18n()
  
  const sections = [
    {
      title: "Produkt",
      links: [
        { href: `/${lang}/features`, label: t("nav.features") },
        { href: `/${lang}/pricing`, label: t("nav.pricing") },
        { href: `/${lang}/demo`, label: t("nav.demo") },
        { href: `/${lang}/security`, label: t("nav.security", "Sicherheit") },
      ]
    },
    {
      title: "Rechtliches",
      links: [
        { href: `/${lang}/impressum`, label: t("footer.impressum", "Impressum") },
        { href: `/${lang}/datenschutz`, label: t("footer.privacy", "Datenschutz") },
      ]
    }
  ]

  const locales = [
    { code: "de", label: "Deutsch" },
    { code: "it", label: "Italiano" },
    { code: "en", label: "English" },
  ]

  return (
    <footer className="bg-[#0C0F0E] border-t border-white/5 pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-24">
          <div className="col-span-2 lg:col-span-2 space-y-6">
            <Link href={`/${lang}`} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#1F3D2B] flex items-center justify-center text-[#CBBF9A] font-bold text-sm">
                A
              </div>
              <span className="text-xl font-bold tracking-tight text-[#F9F8F4]">
                {t("app.name", "Avaimo")}
              </span>
            </Link>
            <p className="text-[#F9F8F4]/50 max-w-xs leading-relaxed">
              Die All-in-One-Plattform für moderne Sportvereine. Buchung, Mitglieder und Finanzen in einem System.
            </p>
          </div>

          {sections.map((section) => (
            <div key={section.title} className="space-y-6">
              <h4 className="text-sm font-bold uppercase tracking-widest text-[#CBBF9A]">
                {section.title}
              </h4>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href} 
                      className="text-[#F9F8F4]/50 hover:text-[#CBBF9A] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-[#CBBF9A]">
              Sprache
            </h4>
            <div className="flex flex-col gap-3">
              {locales.map((l) => (
                <Link
                  key={l.code}
                  href={`/${l.code}`}
                  className={`text-sm flex items-center gap-2 ${
                    lang === l.code ? "text-[#CBBF9A] font-medium" : "text-[#F9F8F4]/40 hover:text-[#F9F8F4]/60"
                  } transition-colors`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-[#F9F8F4]/30">
            © {new Date().getFullYear()} Avaimo. Alle Rechte vorbehalten.
          </p>
          <div className="flex items-center gap-6">
             <Link href={`/${lang}/contact`} className="text-sm text-[#F9F8F4]/30 hover:text-[#CBBF9A] transition-colors">
               Kontakt
             </Link>
             <Link href="https://avaimo.com" className="text-sm text-[#F9F8F4]/30 hover:text-[#CBBF9A] transition-colors">
               avaimo.com
             </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
