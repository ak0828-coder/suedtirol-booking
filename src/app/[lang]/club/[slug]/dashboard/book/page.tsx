"use client"

import { createClient } from "@/lib/supabase/client"
import { notFound, useParams } from "next/navigation"
import { BookingModal } from "@/components/booking-modal"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { useI18n } from "@/components/i18n/locale-provider"
import { ChevronLeft, CalendarDays, Zap, Loader2 } from "lucide-react"
import Link from "next/link"
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

export default function DashboardBookPage() {
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

      const [{ data: member }, { data: courts }] = await Promise.all([
        supabase.from("club_members").select("id, status, valid_until").eq("club_id", club.id).eq("user_id", user.id).single(),
        supabase.from("courts").select("*").eq("club_id", club.id).order("name")
      ])

      setData({ club, member, courts })
      setLoading(false)
    }
    load()
  }, [slug])

  if (loading) return (
    <div className="min-h-screen bg-[#030504] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
    </div>
  )

  const { club, member, courts } = data
  const isMember = member?.status === "active" && (!member?.valid_until || new Date(member.valid_until) > new Date())
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
              <h1 className="text-xl font-black tracking-tight">{t("book.title")}</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#CBBF9A]">{club.name}</p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#CBBF9A]/10 border border-[#CBBF9A]/20 flex items-center justify-center">
             <CalendarDays className="w-5 h-5 text-[#CBBF9A]" />
          </div>
        </div>
      </header>

      <main className="px-4 max-w-5xl mx-auto pt-8 space-y-6">
        {!courts || courts.length === 0 ? (
          <SpotlightCard className="p-12 text-center flex flex-col items-center gap-4 border-dashed">
             <CalendarDays className="w-12 h-12 text-white/10" />
             <p className="text-white/30 font-medium">{t("book.no_courts")}</p>
          </SpotlightCard>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {courts.map((court: any, idx: number) => {
              const duration = court.duration_minutes || 60
              const mode = club.member_booking_pricing_mode
              const val = club.member_booking_pricing_value || 0
              const base = court.price_per_hour
              let memberPrice = base
              if (isMember && mode === "discount_percent") memberPrice = Math.max(0, base * (1 - val / 100))
              else if (isMember && mode === "member_price") memberPrice = Math.max(0, val)
              const hasDiscount = isMember && memberPrice < base

              return (
                <motion.div key={court.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                  <SpotlightCard className="p-6 h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-8">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                             <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                             <p className="text-[10px] font-black uppercase tracking-widest text-white/30">{court.sport_type || 'Sport'}</p>
                          </div>
                          <h3 className="text-2xl font-black text-white tracking-tight">{court.name}</h3>
                          {hasDiscount && (
                            <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#CBBF9A]/10 border border-[#CBBF9A]/20">
                               <Zap className="w-3 h-3 text-[#CBBF9A]" fill="currentColor" />
                               <span className="text-[10px] font-black uppercase tracking-widest text-[#CBBF9A]">Mitglieder-Vorteil</span>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          {hasDiscount && (
                            <p className="text-xs font-bold text-white/20 line-through mb-1">{base}€</p>
                          )}
                          <p className="text-3xl font-black text-white leading-none">
                            {hasDiscount ? memberPrice : base}€
                          </p>
                          <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-2">/ {duration} Min</p>
                        </div>
                      </div>
                    </div>

                    <BookingModal
                      courtId={court.id}
                      courtName={court.name}
                      price={court.price_per_hour}
                      clubSlug={club.slug}
                      durationMinutes={duration}
                      startHour={court.start_hour}
                      endHour={court.end_hour}
                      isMember={isMember}
                      memberPricingMode={club.member_booking_pricing_mode || "full_price"}
                      memberPricingValue={club.member_booking_pricing_value || 0}
                    />
                  </SpotlightCard>
                </motion.div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
  )
}
