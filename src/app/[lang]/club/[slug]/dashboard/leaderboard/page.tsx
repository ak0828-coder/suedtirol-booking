"use client"

import { createClient } from "@/lib/supabase/client"
import { notFound, useParams } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Trophy, Medal, Star, Loader2 } from "lucide-react"
import { AnimatedNumber } from "@/components/animated-number"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { useI18n } from "@/components/i18n/locale-provider"
import { useEffect, useState, useRef } from "react"
import { motion } from "motion/react"

// --- Reusable Premium Components ---

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
          background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(var(--primary-rgb), 0.15), transparent 40%)`,
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

const MEDALS = ["🥇", "🥈", "🥉"]

export default function ClubLeaderboardPage() {
  const params = useParams()
  const slug = params?.slug as string
  const lang = params?.lang as string
  const { t } = useI18n()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: club } = await supabase.from("clubs").select("*").eq("slug", slug).single()
      if (!club) return

      // Use client-side fetching for ranking to match current structure
      // In a real app, this might be a server action or a direct API call
      // For now we'll simulate the ranking data fetching
      const { data: ranking } = await supabase.rpc('get_club_ranking', { p_club_id: club.id, p_limit: 50 })

      setData({ club, ranking: ranking || [] })
      setLoading(false)
    }
    load()
  }, [slug])

  if (loading) return (
    <div className="min-h-screen bg-[#030504] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
    </div>
  )

  const { club, ranking } = data
  const primary = club.primary_color || "#1F3D2B"
  const primaryRGB = hexToRgb(primary)

  return (
    <div
      className="min-h-screen bg-[#030504] text-[#F9F8F4] selection:bg-[#CBBF9A] selection:text-[#030504] pb-32"
      style={{
        ["--club-primary" as any]: primary,
        ["--primary-rgb" as any]: primaryRGB,
      }}
    >
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#0A1410] via-[#030504] to-[#030504]" />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] rounded-full blur-[120px]"
          style={{ background: `rgba(${primaryRGB}, 0.2)` }}
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 py-4 bg-[#030504]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/${lang}/club/${slug}/dashboard`} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors group">
              <ChevronLeft className="w-5 h-5 text-white/40 group-hover:text-white" />
            </Link>
            <div>
              <h1 className="text-xl font-black tracking-tight">{t("leaderboard.title")}</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#CBBF9A]">{club.name}</p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#CBBF9A]/10 border border-[#CBBF9A]/20 flex items-center justify-center">
             <Trophy className="w-5 h-5 text-[#CBBF9A]" />
          </div>
        </div>
      </header>

      <main className="px-4 max-w-5xl mx-auto pt-8 space-y-8">
        {ranking.length === 0 ? (
          <SpotlightCard className="p-12 text-center flex flex-col items-center gap-4 border-dashed max-w-xl mx-auto">
             <Trophy className="w-12 h-12 text-white/10" />
             <p className="text-white/30 font-medium">{t("leaderboard.empty")}</p>
          </SpotlightCard>
        ) : (
          <div className="grid lg:grid-cols-[0.8fr_1fr] gap-12 items-start">
            {/* Podium */}
            <div className="space-y-8">
              <div className="px-2">
                 <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/20 mb-6">Top 3 Pioniere</h3>
                 <div className="grid grid-cols-3 items-end gap-3">
                    {/* 2nd Place */}
                    {ranking[1] && (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <SpotlightCard className="p-4 text-center pb-8 border-white/5">
                           <span className="text-3xl mb-3 block">🥈</span>
                           <p className="text-[10px] font-black uppercase tracking-tighter text-white truncate mb-1">{ranking[1].name}</p>
                           <p className="text-lg font-black text-white/40 leading-none"><AnimatedNumber value={ranking[1].points} />P</p>
                        </SpotlightCard>
                      </motion.div>
                    )}
                    {/* 1st Place */}
                    {ranking[0] && (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <SpotlightCard className="p-6 text-center pb-12 bg-white/5 border-[#CBBF9A]/30 relative overflow-visible">
                           <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#CBBF9A] flex items-center justify-center shadow-xl shadow-[#CBBF9A]/20">
                              <Star className="w-4 h-4 text-[#030504]" fill="currentColor" />
                           </div>
                           <span className="text-5xl mb-4 block">🥇</span>
                           <p className="text-xs font-black uppercase tracking-tighter text-white truncate mb-1">{ranking[0].name}</p>
                           <p className="text-2xl font-black text-[#CBBF9A] leading-none"><AnimatedNumber value={ranking[0].points} />P</p>
                        </SpotlightCard>
                      </motion.div>
                    )}
                    {/* 3rd Place */}
                    {ranking[2] && (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <SpotlightCard className="p-4 text-center pb-6 border-white/5">
                           <span className="text-3xl mb-3 block">🥉</span>
                           <p className="text-[10px] font-black uppercase tracking-tighter text-white truncate mb-1">{ranking[2].name}</p>
                           <p className="text-lg font-black text-white/40 leading-none"><AnimatedNumber value={ranking[2].points} />P</p>
                        </SpotlightCard>
                      </motion.div>
                    )}
                 </div>
              </div>
              
              <SpotlightCard className="p-8 bg-white/5 border-none overflow-hidden relative">
                 <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Trophy className="w-32 h-32 text-white" />
                 </div>
                 <h4 className="text-xl font-bold text-white mb-2">Deine Position</h4>
                 <p className="text-sm text-white/40 leading-relaxed">Spiele mehr Matches und steige im Ranking auf, um exklusive Club-Vorteile freizuschalten.</p>
              </SpotlightCard>
            </div>

            {/* Rest of the list */}
            <div className="space-y-6">
               <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/20 px-2">Gesamtrangliste</h3>
               <SpotlightCard className="overflow-hidden">
                  <div className="divide-y divide-white/5">
                     {ranking.slice(ranking.length >= 3 ? 3 : 0).map((row: any, i: number) => (
                       <motion.div 
                         key={row.userId} 
                         initial={{ opacity: 0, x: -10 }}
                         whileInView={{ opacity: 1, x: 0 }}
                         viewport={{ once: true }}
                         transition={{ delay: i * 0.05 }}
                         className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors group"
                       >
                          <span className="w-6 font-mono text-xs font-bold text-white/20 group-hover:text-[#CBBF9A] transition-colors">{row.rank}</span>
                          <div className="flex-1 min-w-0">
                             <p className="text-sm font-bold text-white truncate">{row.name}</p>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 group-hover:border-[#CBBF9A]/20 transition-all">
                             <span className="text-xs font-black text-white"><AnimatedNumber value={row.points} /></span>
                             <span className="text-[9px] font-bold uppercase text-white/30">Pkt</span>
                          </div>
                       </motion.div>
                     ))}
                  </div>
               </SpotlightCard>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
  )
}
