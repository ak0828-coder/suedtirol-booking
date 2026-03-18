"use client"

import type { Metadata } from "next"
import Link from "next/link"
import { motion, useScroll, useTransform } from "motion/react"
import {
  ArrowRight,
  Check,
  Calendar,
  CreditCard,
  FileSignature,
  Users,
  Sparkles,
  BarChart3,
  ShieldCheck,
  Zap,
} from "lucide-react"
import { SiteHeader } from "@/components/marketing/site-header"
import { SiteFooter } from "@/components/marketing/site-footer"
import { useI18n } from "@/components/i18n/locale-provider"
import { useParams } from "next/navigation"
import { useRef } from "react"
import {
  OrganizationSchema,
  SoftwareApplicationSchema,
  WebSiteSchema,
  FAQSchema,
} from "@/components/seo/structured-data"

const BASE_URL = "https://avaimo.com"

export default function Home() {
  const params = useParams()
  const lang = (params?.lang as string) || "de"
  const { t } = useI18n()
  const targetRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95])

  const modules = [
    {
      title: t("home.modules.bookings.title"),
      description: t("home.modules.bookings.desc"),
      icon: Calendar,
      color: "bg-emerald-500/10 text-emerald-500",
      delay: 0.1,
    },
    {
      title: t("home.modules.members.title"),
      description: t("home.modules.members.desc"),
      icon: Users,
      color: "bg-blue-500/10 text-blue-500",
      delay: 0.2,
    },
    {
      title: t("home.modules.payments.title"),
      description: t("home.modules.payments.desc"),
      icon: CreditCard,
      color: "bg-amber-500/10 text-amber-500",
      delay: 0.3,
    },
    {
      title: t("home.modules.contracts.title"),
      description: t("home.modules.contracts.desc"),
      icon: FileSignature,
      color: "bg-purple-500/10 text-purple-500",
      delay: 0.4,
    },
    {
      title: t("home.modules.training.title"),
      description: t("home.modules.training.desc"),
      icon: Sparkles,
      color: "bg-rose-500/10 text-rose-500",
      delay: 0.5,
    },
    {
      title: t("home.modules.reporting.title"),
      description: t("home.modules.reporting.desc"),
      icon: BarChart3,
      color: "bg-indigo-500/10 text-indigo-500",
      delay: 0.6,
    },
  ]

  const steps = [
    {
      n: "01",
      title: t("home.steps.0.title", "Club anlegen"),
      desc: t("home.steps.0.desc", "Verein einrichten, Plätze und Preise konfigurieren – in unter 48 Stunden betriebsbereit."),
    },
    {
      n: "02",
      title: t("home.steps.1.title", "Mitglieder einladen"),
      desc: t("home.steps.1.desc", "CSV-Import oder direkte Einladung. Verträge werden digital unterzeichnet."),
    },
    {
      n: "03",
      title: t("home.steps.2.title", "Alles läuft"),
      desc: t("home.steps.2.desc", "Buchungen, Zahlungen und Erinnerungen passieren automatisch."),
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  }

  return (
    <div className="min-h-screen bg-[#0C0F0E] text-[#F9F8F4] selection:bg-[#CBBF9A] selection:text-[#0C0F0E]">
      <OrganizationSchema lang={lang} />
      <SoftwareApplicationSchema lang={lang} />
      <WebSiteSchema lang={lang} />
      <FAQSchema lang={lang} />

      {/* Grid background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: `radial-gradient(#F9F8F4 0.5px, transparent 0.5px)`,
            backgroundSize: "24px 24px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0C0F0E]/50 to-[#0C0F0E]" />
      </div>

      {/* Dynamic Background Glows */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-[#1F3D2B] blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-[#CBBF9A] blur-[120px]"
        />
      </div>

      <div className="relative z-10 flex flex-col">
        <SiteHeader />

        <main className="flex-1">
          {/* ── Hero ── */}
          <section
            ref={targetRef}
            className="relative pt-20 pb-32 overflow-hidden px-4"
          >
            <motion.div
              style={{ opacity, scale }}
              className="max-w-7xl mx-auto flex flex-col items-center text-center"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#F9F8F4]/10 bg-white/5 backdrop-blur-md text-xs font-medium tracking-wide text-[#CBBF9A] mb-8"
              >
                <span className="flex h-2 w-2 rounded-full bg-[#CBBF9A] animate-pulse" />
                {t("home.hero.badge")}
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 max-w-4xl"
              >
                {t("home.hero.title")}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg md:text-xl text-[#F9F8F4]/60 max-w-2xl mb-12 leading-relaxed"
              >
                {t("home.hero.subtitle")}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-20"
              >
                <Link
                  href={`/${lang}/demo`}
                  className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#1F3D2B] text-[#CBBF9A] rounded-full font-semibold transition-all hover:shadow-[0_0_30px_rgba(31,61,43,0.5)] overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {t("home.hero.cta_demo")}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href={`/${lang}/contact`}
                  className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-[#F9F8F4]/10 rounded-full font-semibold transition-all backdrop-blur-sm"
                >
                  {t("home.hero.cta_consulting")}
                </Link>
              </motion.div>

              {/* Hero Image / Video Mockup */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                className="relative w-full max-w-5xl mx-auto"
              >
                <div className="absolute -inset-4 bg-gradient-to-r from-[#1F3D2B]/30 to-[#CBBF9A]/10 blur-[80px] opacity-50" />
                <div className="relative aspect-[16/10] bg-[#0d1110] rounded-2xl border border-[#F9F8F4]/10 overflow-hidden shadow-2xl">
                  {/* Browser Chrome Placeholder */}
                  <div className="flex items-center gap-2 px-4 py-3 bg-[#0a0d0c] border-b border-white/5">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
                    </div>
                    <div className="flex-1 flex justify-center">
                      <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-md text-[10px] text-white/30 font-mono">
                        avaimo.com/club/tc-bergblick/dashboard
                      </div>
                    </div>
                  </div>

                  {/* UI Preview */}
                  <div className="p-8 flex h-full">
                    {/* Sidebar */}
                    <div className="w-48 hidden md:block space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-[#1F3D2B] flex items-center justify-center text-[10px] font-bold text-[#CBBF9A]">TC</div>
                        <div className="h-2 w-20 bg-white/10 rounded" />
                      </div>
                      <div className="space-y-3">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-white/5 rounded" />
                            <div className={`h-1.5 rounded bg-white/5 ${i === 0 ? 'w-24 bg-[#1F3D2B]/40' : 'w-16'}`} />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 space-y-8 pl-0 md:pl-8">
                      <div className="grid grid-cols-3 gap-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-2">
                            <div className="h-2 w-12 bg-white/10 rounded" />
                            <div className="h-4 w-20 bg-white/20 rounded" />
                          </div>
                        ))}
                      </div>
                      <div className="flex-1 bg-white/[0.03] border border-white/5 rounded-2xl p-6">
                        <div className="flex justify-between items-center mb-8">
                          <div className="h-3 w-32 bg-white/10 rounded" />
                          <div className="h-8 w-24 bg-[#1F3D2B]/20 rounded-lg" />
                        </div>
                        <div className="flex items-end gap-3 h-48">
                          {[40, 70, 45, 90, 65, 80, 50, 95, 30, 85, 60, 75].map((h, i) => (
                            <motion.div
                              key={i}
                              initial={{ height: 0 }}
                              animate={{ height: `${h}%` }}
                              transition={{ duration: 1, delay: 0.6 + i * 0.05 }}
                              className="flex-1 bg-[#1F3D2B]/40 rounded-t-sm"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </section>

          {/* ── Stats Bar ── */}
          <section className="py-20 border-y border-[#F9F8F4]/5 bg-[#0a0d0c]/50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { label: t("home.results.stats.0"), value: "30%", icon: Zap },
                  { label: t("home.results.stats.1"), value: "+18%", icon: BarChart3 },
                  { label: t("home.results.stats.2"), value: "5 Min", icon: ShieldCheck },
                  { label: "Kundenzufriedenheit", value: "99%", icon: Sparkles },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex flex-col items-center text-center space-y-2"
                  >
                    <div className="p-2 bg-white/5 rounded-lg mb-2">
                      <stat.icon className="w-5 h-5 text-[#CBBF9A]" />
                    </div>
                    <div className="text-3xl md:text-4xl font-bold text-[#F9F8F4]">{stat.value}</div>
                    <div className="text-sm text-[#F9F8F4]/40 font-medium uppercase tracking-wider">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Features Bento ── */}
          <section className="py-32 px-4 bg-gradient-to-b from-[#0C0F0E] to-[#0a0d0c]">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-24">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-[#CBBF9A] font-semibold text-sm tracking-widest uppercase mb-4"
                >
                  Features
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="text-4xl md:text-5xl font-bold tracking-tight"
                >
                  {t("home.modules.title")}
                </motion.h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map((module, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: module.delay }}
                    whileHover={{ y: -5 }}
                    className="group relative p-8 bg-white/5 border border-white/5 rounded-[2rem] overflow-hidden transition-all hover:bg-white/[0.08] hover:border-white/10"
                  >
                    <div className={`w-12 h-12 rounded-2xl ${module.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <module.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{module.title}</h3>
                    <p className="text-[#F9F8F4]/50 leading-relaxed">{module.description}</p>
                    <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="w-5 h-5 text-[#CBBF9A]" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Problem/Solution ── */}
          <section className="py-32 px-4 bg-[#0a0d0c]">
            <div className="max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">
                    Zeit für das Wesentliche,<br />
                    <span className="text-[#CBBF9A]">nicht für Bürokratie.</span>
                  </h2>
                  <p className="text-lg text-[#F9F8F4]/50 mb-12 max-w-lg">
                    Avaimo automatisiert die zeitfressenden Aufgaben Ihres Vereins, damit Sie sich wieder auf den Sport konzentrieren können.
                  </p>
                  <div className="space-y-6">
                    {[
                      t("home.outcomes.0"),
                      t("home.outcomes.1"),
                      t("home.outcomes.2"),
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        </div>
                        <span className="font-medium text-[#F9F8F4]/80">{item}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <div className="absolute -inset-10 bg-[#1F3D2B]/20 blur-[100px] rounded-full" />
                  <div className="relative p-8 bg-white/5 border border-white/5 rounded-[3rem] backdrop-blur-xl">
                    <div className="space-y-8">
                      <div className="p-6 bg-red-500/10 border border-red-500/10 rounded-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-red-500/5 translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                        <div className="relative flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">✕</div>
                          <div className="flex-1">
                            <div className="h-2 w-24 bg-red-500/20 rounded mb-2" />
                            <div className="text-sm text-red-500/60">{t("home.pains.0")}</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-center">
                        <ArrowRight className="w-8 h-8 text-[#CBBF9A] rotate-90" />
                      </div>
                      <div className="p-6 bg-emerald-500/10 border border-emerald-500/10 rounded-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-emerald-500/5 translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                        <div className="relative flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">✓</div>
                          <div className="flex-1">
                            <div className="h-2 w-32 bg-emerald-500/20 rounded mb-2" />
                            <div className="text-sm text-emerald-500/60">{t("home.outcomes.0")}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* ── Steps ── */}
          <section className="py-32 px-4 relative overflow-hidden">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-24">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                  {t("home.steps.title", "In 3 Schritten startklar")}
                </h2>
                <p className="text-[#F9F8F4]/40">{t("home.steps.badge", "So einfach")}</p>
              </div>

              <div className="grid md:grid-cols-3 gap-12 relative">
                {/* Connection Line */}
                <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent hidden md:block" />

                {steps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.2 }}
                    className="relative group"
                  >
                    <div className="text-8xl font-black text-white/[0.03] absolute -top-12 -left-4 group-hover:text-[#1F3D2B]/20 transition-colors">
                      {step.n}
                    </div>
                    <div className="relative pt-12">
                      <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                      <p className="text-[#F9F8F4]/50 leading-relaxed">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* ── CTA ── */}
          <section className="py-32 px-4">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative bg-[#1F3D2B] rounded-[4rem] p-12 md:p-24 overflow-hidden group text-center"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#CBBF9A]/10 blur-[100px] rounded-full" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-black/20 blur-[100px] rounded-full" />

                <div className="relative z-10 max-w-3xl mx-auto">
                  <span className="text-[#CBBF9A] font-semibold text-sm tracking-widest uppercase mb-6 block">
                    {t("home.final.badge")}
                  </span>
                  <h2 className="text-4xl md:text-6xl font-bold text-white mb-10 leading-tight">
                    {t("home.final.title")}
                  </h2>
                  <div className="flex flex-col sm:flex-row gap-6 justify-center">
                    <Link
                      href={`/${lang}/demo`}
                      className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-[#CBBF9A] text-[#0C0F0E] rounded-full font-bold text-lg transition-transform hover:scale-105"
                    >
                      {t("home.final.cta")}
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link
                      href={`/${lang}/contact`}
                      className="inline-flex items-center justify-center px-10 py-5 bg-black/20 text-white border border-white/10 rounded-full font-bold text-lg backdrop-blur-sm hover:bg-black/30 transition-colors"
                    >
                      {t("home.hero.cta_consulting")}
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>
        </main>

        <SiteFooter />
      </div>
    </div>
  )
}
