"use client"

import { useState, useRef } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Eye, EyeOff, Lock, Mail, ChevronLeft, ShieldCheck, AlertCircle } from "lucide-react"
import { getMemberAccessForClub } from "@/app/actions"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"

type Props = {
  clubName: string
  clubLogoUrl: string | null
  primaryColor: string
}

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
      className={`relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.02] group/spotlight ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover/spotlight:opacity-100"
        style={{
          background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(var(--primary-rgb), 0.1), transparent 40%)`,
        }}
      />
      {children}
    </div>
  )
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : "31, 61, 43"
}

export default function MemberLoginClient({ clubName, clubLogoUrl, primaryColor }: Props) {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const lang = typeof params?.lang === "string" ? params.lang : "de"
  const slug = typeof params?.slug === "string" ? params.slug : ""
  const nextParam = searchParams?.get("next")
  const safeNext = nextParam && /^\/(?!\/)/.test(nextParam) ? nextParam : null

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setErrorMessage("Falsche E-Mail oder Passwort.")
      setIsLoading(false)
      return
    }

    const access = await getMemberAccessForClub(slug)
    if (!access?.ok) {
      await supabase.auth.signOut()
      setErrorMessage("Zugriff verweigert: Dieses Konto ist kein aktives Mitglied in diesem Verein.")
      setIsLoading(false)
      return
    }

    router.refresh()
    router.push(safeNext || `/${lang}/club/${slug}/dashboard`)
  }

  const primaryRGB = hexToRgb(primaryColor)

  return (
    <div
      className="relative min-h-screen bg-[#030504] text-[#F9F8F4] flex items-center justify-center p-6 overflow-hidden"
      style={{
        ["--club-primary" as any]: primaryColor,
        ["--primary-rgb" as any]: primaryRGB,
      }}
    >
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#0A1410] via-[#030504] to-[#030504]" />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-full max-w-5xl h-[600px] rounded-full blur-[140px]"
          style={{ background: `rgba(${primaryRGB}, 0.3)` }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header Branding */}
          <div className="flex flex-col items-center mb-10 text-center">
            <Link href={`/${lang}/club/${slug}`} className="group relative mb-6">
              <div className="absolute inset-0 rounded-[2rem] blur-2xl opacity-40 group-hover:opacity-60 transition-opacity" style={{ backgroundColor: primaryColor }} />
              <div className="relative w-24 h-24 rounded-[2rem] bg-[#030504] border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl">
                {clubLogoUrl ? (
                  <img src={clubLogoUrl} alt={clubName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-black text-white">{clubName.substring(0, 2).toUpperCase()}</span>
                )}
              </div>
            </Link>
            <h1 className="text-3xl font-black tracking-tight mb-2">{clubName}</h1>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/40">
               <ShieldCheck className="w-3 h-3 text-[#CBBF9A]" /> Mitglieder-Bereich
            </div>
          </div>

          <SpotlightCard className="p-8 md:p-10 shadow-2xl shadow-black/50">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 px-1">E-Mail Adresse</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="name@beispiel.de"
                      className="w-full h-14 bg-white/[0.07] border border-white/20 rounded-2xl pl-12 pr-4 text-white placeholder:text-white/20 outline-none focus:border-[#CBBF9A]/60 focus:ring-4 focus:ring-[#CBBF9A]/10 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Passwort</label>
                    <Link href={`/${lang}/forgot-password?after=/${lang}/club/${slug}/dashboard`} className="text-[10px] font-bold text-[#CBBF9A] hover:underline">Vergessen?</Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full h-14 bg-white/[0.07] border border-white/20 rounded-2xl pl-12 pr-12 text-white placeholder:text-white/20 outline-none focus:border-[#CBBF9A]/60 focus:ring-4 focus:ring-[#CBBF9A]/10 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold flex items-start gap-3"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    {errorMessage}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-16 rounded-2xl font-black text-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl"
                style={{
                  backgroundColor: primaryColor,
                  color: "#030504",
                  boxShadow: `0 10px 30px rgba(${primaryRGB}, 0.2)`
                }}
              >
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Anmelden"}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-white/5 text-center">
               <Link href={`/${lang}/club/${slug}`} className="inline-flex items-center gap-2 text-xs font-bold text-white/30 hover:text-white transition-colors">
                  <ChevronLeft className="w-4 h-4" /> Zurück zum Club
               </Link>
            </div>
          </SpotlightCard>
        </motion.div>
      </div>
    </div>
  )
}
