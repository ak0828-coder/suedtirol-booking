"use client"

import type { Metadata } from "next"
import Link from "next/link"
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react"
import {
  ArrowRight,
  CheckCircle2,
  CalendarDays,
  CreditCard,
  FileSignature,
  Users,
  Sparkles,
  BarChart3,
  Shield,
  Zap,
  ChevronRight,
  Trophy,
  Activity,
  Smartphone,
  Globe2,
} from "lucide-react"
import { SiteHeader } from "@/components/marketing/site-header"
import { SiteFooter } from "@/components/marketing/site-footer"
import { useI18n } from "@/components/i18n/locale-provider"
import { useParams } from "next/navigation"
import { useRef, useState, useEffect } from "react"
import {
  OrganizationSchema,
  SoftwareApplicationSchema,
  WebSiteSchema,
  FAQSchema,
} from "@/components/seo/structured-data"

const BASE_URL = "https://avaimo.com"

// --- Custom Components for Advanced UI ---

function SpotlightCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const divRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return
    const div = divRef.current
    const rect = div.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    div.style.setProperty("--mouse-x", `${x}px`)
    div.style.setProperty("--mouse-y", `${y}px`)
  }

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      className={`relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] group/spotlight ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover/spotlight:opacity-100"
        style={{
          background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(203,191,154,0.1), transparent 40%)`,
        }}
      />
      {children}
    </div>
  )
}

function FloatingElement({ children, delay = 0, yOffset = 20, duration = 4 }: { children: React.ReactNode, delay?: number, yOffset?: number, duration?: number }) {
  return (
    <motion.div
      animate={{ y: [0, -yOffset, 0] }}
      transition={{
        duration: duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay: delay,
      }}
      style={{ willChange: "transform" }}
    >
      {children}
    </motion.div>
  )
}

export default function Home() {
  const params = useParams()
  const lang = (params?.lang as string) || "de"
  const { t } = useI18n()
  const targetRef = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8])
  const y = useTransform(scrollYProgress, [0, 1], [0, 200])

  return (
    <div className="min-h-screen bg-[#030504] text-[#F9F8F4] selection:bg-[#CBBF9A] selection:text-[#030504] font-sans">
      <OrganizationSchema lang={lang} />
      <SoftwareApplicationSchema lang={lang} />
      <WebSiteSchema lang={lang} />
      <FAQSchema lang={lang} />

      {/* --- Global Background Elements --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden flex justify-center">
        {/* Deep dark radial gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#0A1410] via-[#030504] to-[#030504]" />
        
        {/* Subtle grid */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: "4rem 4rem",
            maskImage: "radial-gradient(ellipse 60% 60% at 50% 50%, black 20%, transparent 80%)"
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col">
        <SiteHeader />

        <main className="flex-1">
          {/* ── HERO SECTION ── */}
          <section ref={targetRef} className="relative pt-32 pb-40 overflow-hidden px-4 min-h-[90vh] flex items-center">
            {/* Animated Glows behind Hero */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[500px] pointer-events-none">
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-[#10B981]/20 to-[#CBBF9A]/20 blur-[120px] rounded-full mix-blend-screen"
              />
            </div>

            <motion.div
              style={{ opacity, scale, y, willChange: "transform, opacity" }}
              className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center"
            >
              {/* Left: Text Content */}
              <div className="flex flex-col items-start text-left z-10">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#10B981]/30 bg-[#10B981]/10 backdrop-blur-md text-sm font-medium tracking-wide text-[#34D399] mb-8"
                >
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34D399] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#10B981]"></span>
                  </span>
                  Avaimo 2.0 ist jetzt verfügbar
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
                  className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter mb-8 leading-[1.05]"
                >
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
                    Der unfaire
                  </span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#CBBF9A] via-[#E2D8B9] to-[#CBBF9A]">
                    Vorteil
                  </span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
                    für deinen Verein.
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
                  className="text-lg lg:text-xl text-[#F9F8F4]/60 max-w-xl mb-10 leading-relaxed font-light"
                >
                  Vergiss Excel-Chaos, WhatsApp-Gruppen und Papierkram. Avaimo ist das smarte Betriebssystem, das deinen Sportverein auf Autopilot stellt.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
                  className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto"
                >
                  <Link
                    href={`/${lang}/demo`}
                    className="group relative flex items-center justify-center gap-3 px-8 py-4 bg-white text-[#030504] rounded-full font-bold text-lg transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                  >
                    Kostenlos starten
                    <div className="w-8 h-8 rounded-full bg-[#030504]/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </Link>
                  <Link
                    href={`/${lang}/demo`}
                    className="flex items-center justify-center gap-2 px-8 py-4 bg-white/5 border border-white/10 rounded-full font-semibold text-lg hover:bg-white/10 transition-colors backdrop-blur-md"
                  >
                    <Smartphone className="w-5 h-5 text-[#CBBF9A]" />
                    Live Demo
                  </Link>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 0.8 }}
                  className="mt-12 flex items-center gap-4 text-sm text-white/40"
                >
                  <div className="flex -space-x-2">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`w-8 h-8 rounded-full border-2 border-[#030504] bg-gradient-to-br from-[#1F3D2B] to-[#0A1410] flex items-center justify-center`}>
                        <Users className="w-3 h-3 text-[#CBBF9A]" />
                      </div>
                    ))}
                  </div>
                  <p>Bereits über <strong className="text-white">150+ Vereine</strong> an Bord</p>
                </motion.div>
              </div>

              {/* Right: Abstract UI Composition */}
              <div className="relative h-[600px] hidden lg:block w-full perspective-1000">
                <motion.div 
                  initial={{ opacity: 0, rotateY: 10, rotateX: 10, x: 50 }}
                  animate={{ opacity: 1, rotateY: -5, rotateX: 5, x: 0 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="absolute inset-0 preserve-3d"
                >
                  {/* Main Dashboard Card */}
                  <FloatingElement yOffset={15} duration={6}>
                    <div className="absolute top-10 right-0 w-[450px] bg-[#0A0D0C]/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-20">
                      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-red-500/50" />
                          <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                          <div className="w-3 h-3 rounded-full bg-green-500/50" />
                        </div>
                        <div className="text-xs font-mono text-white/30">admin.avaimo.com</div>
                      </div>
                      <div className="p-6 space-y-6">
                        <div className="flex justify-between items-end">
                          <div>
                            <div className="text-xs text-white/50 mb-1 uppercase tracking-wider">Umsatz diesen Monat</div>
                            <div className="text-4xl font-bold text-white">€ 14.850</div>
                          </div>
                          <div className="px-3 py-1 bg-[#10B981]/20 text-[#34D399] rounded-full text-xs font-bold flex items-center gap-1">
                            <Activity className="w-3 h-3" /> +24%
                          </div>
                        </div>
                        {/* Chart Mock */}
                        <div className="flex items-end gap-2 h-32 pt-4 border-b border-white/5">
                          {[30, 45, 25, 60, 40, 75, 50, 90, 65, 100].map((h, i) => (
                            <motion.div 
                              key={i}
                              initial={{ height: 0 }}
                              animate={{ height: `${h}%` }}
                              transition={{ duration: 1, delay: 0.5 + (i * 0.05) }}
                              className={`flex-1 rounded-t-sm ${i === 9 ? 'bg-[#CBBF9A]' : 'bg-white/10'}`} 
                            />
                          ))}
                        </div>
                        <div className="space-y-3">
                          <div className="text-xs font-medium text-white/40">Kürzliche Buchungen</div>
                          {[
                            { name: "Max Mustermann", time: "18:00 - Platz 1", type: "Padel" },
                            { name: "Sarah Schmidt", time: "19:30 - Platz 3", type: "Tennis" }
                          ].map((b, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1F3D2B] to-black flex items-center justify-center text-xs font-bold text-[#CBBF9A]">
                                  {b.name.charAt(0)}
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-white">{b.name}</div>
                                  <div className="text-xs text-white/50">{b.time}</div>
                                </div>
                              </div>
                              <div className="text-xs px-2 py-1 rounded bg-white/10 text-white/70">{b.type}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </FloatingElement>

                  {/* Floating Notification */}
                  <FloatingElement delay={1} yOffset={20} duration={5}>
                    <div className="absolute top-1/4 -left-12 p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl flex items-center gap-4 z-30">
                      <div className="w-12 h-12 rounded-full bg-[#10B981]/20 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-[#34D399]" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">Zahlung erhalten</div>
                        <div className="text-xs text-white/60">Mitgliedsbeitrag 2026 - €240</div>
                      </div>
                    </div>
                  </FloatingElement>

                  {/* Floating Court Status */}
                  <FloatingElement delay={2} yOffset={10} duration={7}>
                     <div className="absolute bottom-10 right-20 p-5 bg-[#1F3D2B]/80 backdrop-blur-xl border border-[#CBBF9A]/30 rounded-2xl shadow-2xl z-10">
                        <div className="text-xs font-bold text-[#CBBF9A] uppercase tracking-wider mb-3">Live Auslastung</div>
                        <div className="flex gap-2">
                          {[1,2,3,4].map(court => (
                            <div key={court} className="flex flex-col gap-1 items-center">
                              <div className={`w-8 h-12 rounded-md ${court === 3 ? 'bg-white/10 border border-white/20' : 'bg-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.4)]'}`} />
                              <span className="text-[10px] text-white/50">P{court}</span>
                            </div>
                          ))}
                        </div>
                     </div>
                  </FloatingElement>
                </motion.div>
              </div>
            </motion.div>
          </section>

          {/* ── BENTO GRID FEATURES ── */}
          <section className="py-32 px-4 relative z-20 bg-[#030504]">
            <div className="max-w-7xl mx-auto">
              <div className="mb-20">
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
                  Alles, was du brauchst.<br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#CBBF9A] to-[#F9F8F4]">In einem System vereint.</span>
                </h2>
                <p className="text-lg text-white/50 max-w-2xl">
                  Keine Insellösungen mehr. Avaimo verbindet Platzbuchung, Mitgliederverwaltung und Finanzen nahtlos miteinander.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
                
                {/* Feature 1: Large Booking */}
                <SpotlightCard className="md:col-span-2 row-span-2 p-8 md:p-12 flex flex-col justify-between group">
                  <div className="max-w-md relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-[#10B981]/10 flex items-center justify-center mb-6">
                      <CalendarDays className="w-7 h-7 text-[#34D399]" />
                    </div>
                    <h3 className="text-3xl font-bold mb-4">Intelligentes Buchungssystem</h3>
                    <p className="text-white/50 text-lg leading-relaxed">
                      Egal ob Tennis, Padel oder Squash. Verwalte Plätze mit flexiblen Preisregeln, Gastbuchungen und automatischer Flutlicht-Ansteuerung.
                    </p>
                  </div>
                  {/* Decorative element */}
                  <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 w-96 h-96 bg-[#10B981]/10 rounded-full blur-[80px] group-hover:bg-[#10B981]/20 transition-colors duration-500" />
                  <div className="absolute -right-10 bottom-10 rotate-[-10deg] opacity-50 group-hover:opacity-100 transition-all duration-500 group-hover:rotate-[-5deg]">
                     <div className="bg-[#0A0D0C] border border-white/10 p-4 rounded-xl shadow-2xl w-64">
                       <div className="flex gap-2 mb-3">
                         <div className="w-10 h-10 rounded bg-white/5" />
                         <div className="flex-1 space-y-2 py-1">
                           <div className="h-3 bg-white/20 rounded w-full" />
                           <div className="h-3 bg-white/10 rounded w-2/3" />
                         </div>
                       </div>
                       <div className="h-8 bg-[#10B981] rounded w-full mt-4" />
                     </div>
                  </div>
                </SpotlightCard>

                {/* Feature 2: Members */}
                <SpotlightCard className="p-8 flex flex-col justify-between group">
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6">
                      <Users className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Mitgliederverwaltung</h3>
                    <p className="text-white/50">
                      Digitale Akten, Familienaccounts und automatischer Rechnungsversand. Immer aktuell.
                    </p>
                  </div>
                  <div className="absolute right-0 bottom-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[60px] group-hover:bg-blue-500/20 transition-colors" />
                </SpotlightCard>

                {/* Feature 3: Payments */}
                <SpotlightCard className="p-8 flex flex-col justify-between group">
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-[#CBBF9A]/10 flex items-center justify-center mb-6">
                      <CreditCard className="w-6 h-6 text-[#CBBF9A]" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Stripe Integration</h3>
                    <p className="text-white/50">
                      SEPA, Kreditkarte, Apple Pay. 100% automatisierter Geldeingang ohne Mahnwesen.
                    </p>
                  </div>
                  <div className="absolute right-0 bottom-0 w-48 h-48 bg-[#CBBF9A]/10 rounded-full blur-[60px] group-hover:bg-[#CBBF9A]/20 transition-colors" />
                </SpotlightCard>

                {/* Feature 4: Training */}
                <SpotlightCard className="p-8 flex flex-col justify-between group">
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-6">
                      <Trophy className="w-6 h-6 text-rose-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Trainer & Kurse</h3>
                    <p className="text-white/50">
                      Camp-Anmeldungen, Trainerstunden und Abrechnung in einem flüssigen Workflow.
                    </p>
                  </div>
                  <div className="absolute right-0 bottom-0 w-48 h-48 bg-rose-500/10 rounded-full blur-[60px] group-hover:bg-rose-500/20 transition-colors" />
                </SpotlightCard>

                {/* Feature 5: Wide stats */}
                <SpotlightCard className="md:col-span-2 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 group">
                  <div className="max-w-sm relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6">
                      <BarChart3 className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Echtzeit-Statistiken</h3>
                    <p className="text-white/50 leading-relaxed">
                      Behalte den Überblick über Finanzen, Auslastung und Mitgliederwachstum auf Knopfdruck. Perfekt für die nächste Vorstandssitzung.
                    </p>
                  </div>
                  <div className="flex-1 w-full relative h-40">
                     <div className="absolute inset-0 bg-gradient-to-t from-[#030504] to-transparent z-10" />
                     <div className="flex items-end gap-2 h-full opacity-60 group-hover:opacity-100 transition-opacity duration-500">
                       {[20, 35, 25, 45, 30, 60, 50, 75, 65, 85, 80, 100].map((h, i) => (
                         <div key={i} className="flex-1 bg-gradient-to-t from-purple-500/20 to-purple-400 rounded-t-sm" style={{ height: `${h}%` }} />
                       ))}
                     </div>
                  </div>
                </SpotlightCard>

              </div>
            </div>
          </section>

          {/* ── METRICS & TRUST ── */}
          <section className="py-24 border-y border-white/5 bg-white/[0.01]">
            <div className="max-w-7xl mx-auto px-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                {[
                  { label: "Zeitersparnis", value: "15h/Wo" },
                  { label: "Mehr Umsatz", value: "+22%" },
                  { label: "Zufriedenheit", value: "99%" },
                  { label: "Setup-Zeit", value: "< 48h" },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex flex-col items-center justify-center text-center space-y-3 relative"
                  >
                    <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">
                      {stat.value}
                    </div>
                    <div className="text-sm md:text-base font-medium text-[#CBBF9A] uppercase tracking-widest">
                      {stat.label}
                    </div>
                    {i !== 3 && <div className="hidden md:block absolute right-[-24px] md:right-[-32px] top-1/2 -translate-y-1/2 w-px h-12 bg-white/10" />}
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* ── HOW IT WORKS ── */}
          <section className="py-32 px-4 relative">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-24">
                <span className="text-[#10B981] font-bold text-sm tracking-widest uppercase mb-4 block">
                  Simpel. Schnell. Sicher.
                </span>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                  Dein Verein. Digital in Rekordzeit.
                </h2>
              </div>

              <div className="grid lg:grid-cols-3 gap-8 relative">
                {/* Connecting Line Desktop */}
                <div className="absolute top-12 left-20 right-20 h-px bg-gradient-to-r from-transparent via-[#CBBF9A]/30 to-transparent hidden lg:block" />

                {[
                  {
                    step: "01",
                    title: "Konto erstellen",
                    desc: "Registriere deinen Verein und konfiguriere Plätze, Preise und Mitgliedschaften in unserer intuitiven Oberfläche.",
                    icon: Globe2
                  },
                  {
                    step: "02",
                    title: "Mitglieder einladen",
                    desc: "Importiere bestehende Listen per CSV oder lade Mitglieder per magischem Link ein. Ohne Passwort-Chaos.",
                    icon: Users
                  },
                  {
                    step: "03",
                    title: "Zurücklehnen",
                    desc: "Ab jetzt laufen Buchungen, Abrechnungen und Erinnerungen vollautomatisch im Hintergrund.",
                    icon: Zap
                  }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ delay: i * 0.2, duration: 0.6 }}
                    className="relative p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors text-center flex flex-col items-center group"
                  >
                    <div className="w-24 h-24 rounded-full bg-[#030504] border border-white/10 flex items-center justify-center mb-8 relative z-10 group-hover:scale-110 transition-transform duration-500">
                      <div className="absolute inset-0 rounded-full bg-[#CBBF9A]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                      <item.icon className="w-10 h-10 text-[#CBBF9A]" />
                    </div>
                    <div className="text-6xl font-black text-white/[0.03] absolute top-4 right-8 select-none">
                      {item.step}
                    </div>
                    <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                    <p className="text-white/50 leading-relaxed">
                      {item.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* ── MASSIVE CTA ── */}
          <section className="py-32 px-4">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 40 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative rounded-[3rem] p-12 md:p-24 overflow-hidden text-center isolate"
              >
                {/* Deep glowing background */}
                <div className="absolute inset-0 bg-[#0A1410]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#10B981]/20 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[#CBBF9A]/10 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute inset-0 border border-white/10 rounded-[3rem] pointer-events-none" />

                <div className="relative z-10 max-w-3xl mx-auto">
                  <Shield className="w-16 h-16 text-[#CBBF9A] mx-auto mb-8" />
                  <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight">
                    Bereit für den nächsten Schritt?
                  </h2>
                  <p className="text-xl text-white/60 mb-12 font-light">
                    Schließe dich hunderten innovativen Vereinen an. Teste Avaimo unverbindlich oder lass dich von unseren Experten beraten.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                    <Link
                      href={`/${lang}/demo`}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-5 bg-[#CBBF9A] text-[#030504] rounded-full font-bold text-lg transition-transform hover:scale-105 hover:shadow-[0_0_40px_rgba(203,191,154,0.4)]"
                    >
                      Kostenlos Demo anfordern
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link
                      href={`/${lang}/contact`}
                      className="w-full sm:w-auto inline-flex items-center justify-center px-10 py-5 bg-white/5 text-white border border-white/10 rounded-full font-bold text-lg backdrop-blur-sm hover:bg-white/10 transition-colors"
                    >
                      Zum Beratungsgespräch
                    </Link>
                  </div>
                  <p className="mt-8 text-sm text-white/40 flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                    Keine Kreditkarte erforderlich. 100% DSGVO-konform.
                  </p>
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
