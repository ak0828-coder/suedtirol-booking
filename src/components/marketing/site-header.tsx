"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useI18n } from "@/components/i18n/locale-provider"
import { useState, useEffect } from "react"
import { Menu, X, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"

export function SiteHeader() {
  const params = useParams()
  const lang = typeof params?.lang === "string" ? params.lang : "de"
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { href: `/${lang}/features`, label: t("nav.features") },
    { href: `/${lang}/pricing`, label: t("nav.pricing") },
    { href: `/${lang}/demo`, label: t("nav.demo") },
    { href: `/${lang}/security`, label: t("nav.security", "Sicherheit") },
    { href: `/${lang}/contact`, label: t("nav.contact") },
  ]

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "py-3 bg-[#0C0F0E]/80 backdrop-blur-xl border-b border-white/5 shadow-2xl" 
          : "py-5 bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href={`/${lang}`} className="group flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#1F3D2B] flex items-center justify-center text-[#CBBF9A] font-bold text-sm group-hover:scale-110 transition-transform">
            A
          </div>
          <span className="text-xl font-bold tracking-tight text-[#F9F8F4] group-hover:text-[#CBBF9A] transition-colors">
            {t("app.name", "Avaimo")}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-[#F9F8F4]/60 hover:text-[#CBBF9A] transition-colors relative group"
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#CBBF9A] transition-all group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href={`/${lang}/login`}
            className="text-sm font-medium text-[#F9F8F4]/60 hover:text-[#F9F8F4] transition-colors"
          >
            Login
          </Link>
          <Link
            href={`/${lang}/demo`}
            className="group relative inline-flex items-center gap-2 rounded-full bg-[#1F3D2B] px-5 py-2.5 text-sm font-bold text-[#CBBF9A] transition-all hover:shadow-[0_0_20px_rgba(31,61,43,0.4)] overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            {t("cta.demo", "Demo ansehen")}
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setOpen(!open)}
          className="flex md:hidden items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 text-[#F9F8F4]"
          aria-label="Menü umschalten"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0C0F0E] border-b border-white/5 overflow-hidden"
          >
            <div className="px-4 py-8 space-y-6">
              <nav className="flex flex-col gap-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="text-lg font-medium text-[#F9F8F4]/70 hover:text-[#CBBF9A] transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="pt-6 border-t border-white/5 flex flex-col gap-4">
                <Link
                  href={`/${lang}/demo`}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-full bg-[#1F3D2B] py-4 text-sm font-bold text-[#CBBF9A]"
                >
                  {t("cta.demo", "Demo ansehen")}
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <Link
                  href={`/${lang}/contact`}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center rounded-full bg-white/5 py-4 text-sm font-bold text-[#F9F8F4] border border-white/10"
                >
                  {t("cta.consulting", "Beratung")}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
