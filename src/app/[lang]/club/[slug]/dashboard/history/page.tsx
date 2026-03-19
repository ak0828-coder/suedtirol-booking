"use client"

import { createClient } from "@/lib/supabase/client"
import { notFound, useParams } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Activity, Loader2, CalendarDays, Clock, ArrowRight } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { motion } from "motion/react"
import { useI18n } from "@/components/i18n/locale-provider"
import { format } from "date-fns"

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

export default function MemberHistoryPage() {
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

      const { data: bookings } = await supabase
        .from("bookings")
        .select("*, courts(name)")
        .eq("club_id", club.id)
        .eq("user_id", user.id)
        .order("start_time", { ascending: false })
        .limit(20)

      setData({ club, bookings: bookings || [] })
      setLoading(false)
    }
    load()
  }, [slug])

  if (loading) return (
    <div className="min-h-screen bg-[#030504] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
    </div>
  )

  const { club, bookings } = data
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
        <div className="max-w-5xl mx-auto px-6 flex items-center gap-4">
          <Link href={`/${lang}/club/${slug}/dashboard`} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors group">
            <ChevronLeft className="w-5 h-5 text-white/40 group-hover:text-white" />
          </Link>
          <div>
            <h1 className="text-xl font-black tracking-tight">Aktivitätsverlauf</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#CBBF9A]">{club.name}</p>
          </div>
        </div>
      </header>

      <main className="px-4 max-w-2xl mx-auto pt-8 space-y-6">
        {bookings.length === 0 ? (
          <SpotlightCard className="p-16 text-center border-dashed">
            <Activity className="w-12 h-12 mx-auto mb-4 text-white/5" />
            <p className="text-sm font-medium text-white/20">Noch keine Aktivitäten vorhanden.</p>
          </SpotlightCard>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking: any, idx: number) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <SpotlightCard className="p-5 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#CBBF9A]">
                       <CalendarDays className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{booking.courts?.name || 'Platz'}</p>
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/20 mt-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(booking.start_time), "dd.MM.yyyy · HH:mm")}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                     <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${booking.payment_status?.includes('paid') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/5 text-white/40 border border-white/10'}`}>
                        {booking.payment_status?.includes('paid') ? 'Abgeschlossen' : 'Offen'}
                     </span>
                  </div>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
