"use client"

import { useState, useEffect, useRef } from "react"
import { 
  Smartphone, 
  Clock, 
  Award, 
  ArrowRight, 
  Check, 
  Loader2, 
  Users, 
  Zap, 
  ShieldCheck, 
  Trophy,
  CalendarDays,
  Activity,
  ChevronRight,
  Globe2
} from "lucide-react"
import { submitWaitlistEmail } from "./actions"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"

// --- Reusable Components from Avaimo 2.0 Design System ---

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

function AnimatedCounter({ target }: { target: number }) {
  const [value, setValue] = useState(target)
  const prevRef = useRef(target)

  useEffect(() => {
    if (target === prevRef.current) return
    const start = prevRef.current
    const end = target
    const duration = 1200
    const startTime = performance.now()

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 4)
      setValue(Math.round(start + (end - start) * eased))
      if (progress < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
    prevRef.current = target
  }, [target])

  return <>{value}</>
}

function EmailForm({ onSuccess, buttonLabel = "Warteliste beitreten" }: { onSuccess: () => void; buttonLabel?: string }) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const res = await submitWaitlistEmail(email)
    setLoading(false)
    if (res.ok) {
      setDone(true)
      onSuccess()
    } else {
      setError(res.error || "Fehler")
    }
  }

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-4 rounded-2xl px-6 py-5 bg-[#10B981]/10 border border-[#10B981]/20 backdrop-blur-xl"
          >
            <div className="w-12 h-12 rounded-full bg-[#10B981]/20 flex items-center justify-center shrink-0">
              <Check className="w-6 h-6 text-[#34D399]" />
            </div>
            <div>
              <p className="text-lg font-bold text-white leading-tight">Willkommen im Club!</p>
              <p className="text-sm text-white/50 mt-1">Du erhältst in Kürze eine Bestätigung.</p>
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Deine E-Mail Adresse"
                className="flex-1 h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-white placeholder:text-white/20 outline-none focus:border-[#CBBF9A]/40 focus:ring-4 focus:ring-[#CBBF9A]/5 transition-all"
              />
              <button
                type="submit"
                disabled={loading}
                className="h-14 px-8 bg-[#CBBF9A] text-[#030504] rounded-2xl font-bold transition-all hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(203,191,154,0.3)] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{buttonLabel} <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
            {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-400 font-medium px-2">{error}</motion.p>}
          </form>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function BozenerClient({ initialCount }: { initialCount: number }) {
  const [count, setCount] = useState(initialCount)

  const handleSuccess = () => {
    setCount((c) => c + 1)
  }

  const features = [
    {
      icon: Smartphone,
      title: "App-Only Access",
      text: "Vollautomatische Steuerung. Check-in, Licht und Türen – alles über dein Smartphone.",
      color: "bg-blue-500/10 text-blue-400"
    },
    {
      icon: Clock,
      title: "24/7 Betrieb",
      text: "Keine Rezeption, keine Grenzen. Trainiere wann immer du willst, 365 Tage im Jahr.",
      color: "bg-[#10B981]/10 text-[#34D399]"
    },
    {
      icon: Award,
      title: "Premium Equipment",
      text: "Panorama Padel Courts, High-End Pilates Reformer und modernstes Gym-Equipment.",
      color: "bg-[#CBBF9A]/10 text-[#CBBF9A]"
    },
  ]

  const benefits = [
    "20% Rabatt auf alle Abos im 1. Jahr",
    "5% Extra Rabatt auf Padel Buchungen",
    "Exklusiver Vorabzugang vor Eröffnung",
    "Einladung zum Pre-Opening Event",
  ]

  return (
    <div className="min-h-screen bg-[#030504] text-[#F9F8F4] selection:bg-[#CBBF9A] selection:text-[#030504] overflow-x-hidden">
      
      {/* --- Background Effects --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#0A1410] via-[#030504] to-[#030504]" />
        
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-[#1F3D2B] blur-[140px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-[#CBBF9A] blur-[120px]"
        />
        
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: "4rem 4rem",
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col">
        {/* Simple Header */}
        <header className="py-8 px-6">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
             <Link href="https://avaimo.com" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-lg bg-[#1F3D2B] flex items-center justify-center text-[#CBBF9A] font-bold text-sm">A</div>
                <span className="text-xl font-bold tracking-tight group-hover:text-[#CBBF9A] transition-colors">Avaimo</span>
             </Link>
             <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-[#CBBF9A]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                South Tyrol · Coming 2027
             </div>
          </div>
        </header>

        <main className="flex-1">
          {/* ── HERO ── */}
          <section className="min-h-[85vh] flex flex-col items-center justify-center px-6 pt-12 pb-24 text-center max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <h1 className="text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] font-black tracking-tighter leading-[0.85] mb-8">
                <span className="block text-white">AVAÍMO.</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white/20 via-white/40 to-white/20">BOZEN SÜD.</span>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-white/50 max-w-2xl mx-auto leading-relaxed font-light">
                Der erste vollautomatische <span className="text-[#CBBF9A] font-medium">24/7 Premium Sportclub</span> Südtirols.
                Padel, Pilates & Gym – gesteuert über dein Smartphone.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full max-w-lg mb-16"
            >
              <EmailForm onSuccess={handleSuccess} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="flex flex-col items-center"
            >
              <div className="text-6xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#CBBF9A] to-[#8A7B4D] leading-none mb-4">
                <AnimatedCounter target={count} />
              </div>
              <div className="text-xs sm:text-sm font-bold uppercase tracking-[0.3em] text-white/30">
                Pioniere auf der Warteliste
              </div>
            </motion.div>
          </section>

          {/* ── FEATURES BENTO ── */}
          <section className="py-32 px-6 border-t border-white/5 bg-white/[0.01]">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-20">
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Ein Club. Keine Grenzen.</h2>
                <p className="text-white/40">Das AVAÍMO Konzept für Bozen Süd.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {features.map((f, i) => (
                  <SpotlightCard key={i} className="p-10 flex flex-col items-start gap-6">
                    <div className={`w-14 h-14 rounded-2xl ${f.color} flex items-center justify-center`}>
                      <f.icon className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-3">{f.title}</h3>
                      <p className="text-white/40 leading-relaxed">{f.text}</p>
                    </div>
                  </SpotlightCard>
                ))}
              </div>
            </div>
          </section>

          {/* ── FOUNDER STATUS ── */}
          <section className="py-32 px-6 relative overflow-hidden">
            <div className="max-w-4xl mx-auto relative z-10">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div>
                  <span className="text-[#CBBF9A] font-bold text-sm tracking-widest uppercase mb-4 block">Limitiert</span>
                  <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">
                    Werde AVAÍMO<br/>Founder.
                  </h2>
                  <p className="text-lg text-white/50 mb-10 leading-relaxed">
                    Sichere dir jetzt deinen Platz und profitiere von lebenslangen Vorteilen, die nur für unsere ersten Mitglieder in Bozen Süd verfügbar sind.
                  </p>
                  <div className="space-y-5">
                    {benefits.map((b, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="w-6 h-6 rounded-full bg-[#10B981]/10 flex items-center justify-center border border-[#10B981]/20">
                          <Check className="w-3.5 h-3.5 text-[#34D399]" />
                        </div>
                        <span className="font-medium text-white/80">{b}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <SpotlightCard className="p-8 md:p-12 relative overflow-hidden bg-white/[0.03]">
                  <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#CBBF9A]/10 blur-[60px] rounded-full" />
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-8">Jetzt Status sichern</h3>
                    <EmailForm onSuccess={handleSuccess} buttonLabel="Jetzt eintragen" />
                    <p className="mt-6 text-center text-xs text-white/30 font-medium">
                      Nur noch wenige Founder-Plätze verfügbar.
                    </p>
                  </div>
                </SpotlightCard>
              </div>
            </div>
          </section>
        </main>

        <footer className="py-12 px-6 border-t border-white/5 text-center">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm text-white/20">© 2027 Avaimo Bozen Süd. Alle Rechte vorbehalten.</p>
            <div className="flex gap-8">
               <Link href="https://avaimo.com" className="text-sm text-white/20 hover:text-[#CBBF9A] transition-colors">Hauptseite</Link>
               <Link href="https://avaimo.com/de/impressum" className="text-sm text-white/20 hover:text-[#CBBF9A] transition-colors">Impressum</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
