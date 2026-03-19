"use client"

import { createClient } from "@/lib/supabase/client"
import { notFound, redirect, useParams, useSearchParams } from "next/navigation"
import { 
  AlertTriangle, 
  ArrowRight, 
  CalendarCheck, 
  CalendarX, 
  CalendarDays,
  Clock, 
  Dumbbell, 
  Trophy, 
  Settings, 
  CreditCard, 
  FileText,
  Activity,
  Loader2,
  ChevronRight,
  Zap,
  Star
} from "lucide-react"
import { format } from "date-fns"
import { CancelBookingButton } from "@/components/cancel-booking-button"
import Link from "next/link"
import { getReadableTextColor } from "@/lib/color"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { useI18n } from "@/components/i18n/locale-provider"
import { BillingPortalButton, CancelMembershipButton } from "@/components/dashboard/subscription-actions"
import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"

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

export default function MemberDashboard() {
  const params = useParams()
  const searchParams = useSearchParams()
  const slug = params?.slug as string
  const lang = params?.lang as string
  const bookingStatus = searchParams.get("booking")
  
  const { t } = useI18n()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    async function load() {
      const { data: { user: u } } = await supabase.auth.getUser()
      if (!u) {
        redirect(`/${lang}/club/${slug}/login?next=/${lang}/club/${slug}/dashboard`)
        return
      }
      setUser(u)

      const { data: club } = await supabase.from("clubs").select("*").eq("slug", slug).single()
      if (!club) return

      // Fetch all dashboard data in parallel
      const [
        { data: member },
        { data: upcomingBookings },
        { data: pastBookings },
        { data: profile },
        { data: contractDocs }
      ] = await Promise.all([
        supabase.from("club_members").select("*, membership_plans(name)").eq("user_id", u.id).eq("club_id", club.id).single(),
        supabase.from("bookings").select("*, courts(name)").eq("club_id", club.id).eq("user_id", u.id).gte("start_time", new Date().toISOString()).order("start_time", { ascending: true }),
        supabase.from("bookings").select("*, courts(name)").eq("club_id", club.id).eq("user_id", u.id).lt("start_time", new Date().toISOString()).order("start_time", { ascending: false }).limit(5),
        supabase.from("profiles").select("*").eq("id", u.id).single(),
        supabase.from("member_documents").select("id").eq("club_id", club.id).eq("user_id", u.id).in("doc_type", ["membership_contract", "contract"]).limit(1)
      ])

      // Stats would normally come from a function, using fallback for now
      const stats = { wins: 0, losses: 0, win_streak: 0 } 

      setData({ club, member, upcomingBookings, pastBookings, profile, stats, hasContract: !!member?.contract_signed_at || (contractDocs?.length || 0) > 0 })
      setLoading(false)
    }
    load()
  }, [slug])

  if (loading) return (
    <div className="min-h-screen bg-[#030504] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
    </div>
  )

  if (!data?.member) {
    return (
      <div className="min-h-screen bg-[#030504] flex items-center justify-center p-6 text-center">
        <SpotlightCard className="max-w-sm p-10 space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
            <CalendarX className="w-10 h-10 text-white/20" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Kein Mitgliedskonto</h1>
            <p className="text-white/40">Für diesen Club existiert keine aktive Mitgliedschaft unter {user?.email}.</p>
          </div>
          <Link href={`/${lang}/club/${slug}`} className="block w-full py-4 bg-white text-[#030504] rounded-2xl font-bold hover:scale-105 transition-transform">Zurück zum Club</Link>
        </SpotlightCard>
      </div>
    )
  }

  const { club, member, upcomingBookings, pastBookings, profile, stats, hasContract } = data
  const primary = club.primary_color || "#1F3D2B"
  const primaryRGB = hexToRgb(primary)
  const nextBooking = upcomingBookings?.[0]
  const paymentPaid = ["paid", "paid_stripe", "paid_cash", "paid_member"].includes(member.payment_status)

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
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-full max-w-5xl h-[800px] rounded-full blur-[140px]"
          style={{ background: `rgba(${primaryRGB}, 0.2)` }}
        />
      </div>

      <div className="relative z-10">
        {/* ── TOP NAV / HEADER ── */}
        <header className="px-6 pt-12 pb-8 max-w-5xl mx-auto flex justify-between items-center">
           <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-[#CBBF9A] mb-3">
                 <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" /> {member.membership_plans?.name || "Member"}
              </div>
              <h1 className="text-4xl font-black tracking-tight leading-none">
                {t("dashboard.greeting")},<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">{profile?.first_name || user?.email?.split('@')[0]}</span>
              </h1>
           </div>
           <Link href={`/${lang}/club/${slug}/dashboard/settings`} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
              <Settings className="w-5 h-5 text-white/40" />
           </Link>
        </header>

        <main className="px-4 max-w-5xl mx-auto space-y-6">
          
          {/* Alerts Area */}
          <AnimatePresence>
            {!hasContract && (
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
                <Link href={`/${lang}/club/${slug}/onboarding?post_payment=1`}>
                  <SpotlightCard className="p-5 flex items-center gap-4 border-amber-500/20 bg-amber-500/5">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">Vertrag unterzeichnen</p>
                      <p className="text-xs text-amber-500/60 font-medium">Dein Vertrag ist noch ausstehend.</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/20" />
                  </SpotlightCard>
                </Link>
              </motion.div>
            )}
            {bookingStatus === "success" && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="rounded-3xl p-5 flex items-center gap-4 bg-[#10B981]/10 border border-[#10B981]/20">
                <div className="w-10 h-10 rounded-xl bg-[#10B981]/20 flex items-center justify-center shrink-0">
                  <CalendarCheck className="w-5 h-5 text-[#34D399]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Buchung erfolgreich!</p>
                  <p className="text-xs text-[#34D399]/60 font-medium">Wir haben dir eine Bestätigung geschickt.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── MAIN ACTION ── */}
          <div className="grid md:grid-cols-2 gap-6">
            <Link href={`/${lang}/club/${slug}/dashboard/book`} className="block group">
              <SpotlightCard className="p-8 h-full flex items-center justify-between bg-gradient-to-br from-[#CBBF9A] to-[#8A7B4D] border-none shadow-2xl shadow-[#CBBF9A]/10 group-hover:scale-[1.02] transition-transform">
                <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#030504]/40 mb-2">Ready to Play?</p>
                  <h2 className="text-3xl font-black text-[#030504] tracking-tight">Platz buchen</h2>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-[#030504]/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-7 h-7 text-[#030504]" />
                </div>
              </SpotlightCard>
            </Link>

            {/* ── NEXT BOOKING ── */}
            {nextBooking ? (
              <SpotlightCard className="p-6 relative group h-full">
                <div className="absolute top-0 right-0 p-6 opacity-5">
                   <CalendarDays className="w-24 h-24 text-white" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4">Nächster Termin</p>
                <div className="flex items-end justify-between relative z-10">
                  <div>
                    <p className="text-4xl font-black text-white mb-2">{format(new Date(nextBooking.start_time), "dd. MMMM")}</p>
                    <div className="flex items-center gap-3 text-sm font-medium text-white/50">
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/10">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="font-mono">{format(new Date(nextBooking.start_time), "HH:mm")}</span>
                      </div>
                      <span className="text-white/20">·</span>
                      <span className="text-[#CBBF9A]">{nextBooking.courts?.name}</span>
                    </div>
                  </div>
                  <CancelBookingButton bookingId={nextBooking.id} />
                </div>
              </SpotlightCard>
            ) : (
              <SpotlightCard className="p-8 text-center border-dashed border-white/5 flex items-center justify-center">
                 <p className="text-sm font-medium text-white/20">Keine anstehenden Buchungen</p>
              </SpotlightCard>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* STATS */}
            <div className="grid grid-cols-3 gap-4 md:col-span-1">
              {[
                { label: "Wins", value: stats.wins, icon: Trophy, color: "text-[#CBBF9A]" },
                { label: "Losses", value: stats.losses, icon: CalendarX, color: "text-white/20" },
                { label: "Streak", value: stats.win_streak, icon: Zap, color: "text-amber-400" },
              ].map((s, i) => (
                <SpotlightCard key={i} className="p-5 text-center flex flex-col items-center justify-center gap-2">
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                  <p className="text-2xl font-black text-white leading-none">{s.value}</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/30">{s.label}</p>
                </SpotlightCard>
              ))}
            </div>

            {/* QUICK TOOLS */}
            <div className="grid grid-cols-2 gap-4 md:col-span-2">
              <Link href={`/${lang}/club/${slug}/dashboard/training`}>
                <SpotlightCard className="p-5 h-full flex items-center gap-4 hover:bg-white/5 transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Dumbbell className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white leading-tight">Training</p>
                    <p className="text-[10px] text-white/30 font-medium">Kurse & Camps</p>
                  </div>
                </SpotlightCard>
              </Link>
              <Link href={`/${lang}/club/${slug}/dashboard/leaderboard`}>
                <SpotlightCard className="p-5 h-full flex items-center gap-4 hover:bg-white/5 transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Star className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white leading-tight">Leaderboard</p>
                    <p className="text-[10px] text-white/30 font-medium">Top Spieler</p>
                  </div>
                </SpotlightCard>
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* MEMBERSHIP DETAIL */}
            <SpotlightCard className="p-6 relative">
              <div className="flex items-center justify-between mb-6">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Mitgliedschaft</p>
                 <div className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${paymentPaid ? 'bg-[#10B981]/10 text-[#34D399] border border-[#10B981]/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                    {paymentPaid ? "Aktiv & Bezahlt" : "Zahlung offen"}
                 </div>
              </div>
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 rounded-2xl bg-[#CBBF9A]/10 border border-[#CBBF9A]/20 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-[#CBBF9A]" />
                 </div>
                 <div>
                    <p className="text-lg font-bold text-white">{member.membership_plans?.name}</p>
                    {member.valid_until && <p className="text-xs text-white/40">Gültig bis {format(new Date(member.valid_until), "dd.MM.yyyy")}</p>}
                 </div>
              </div>
              <div className="flex gap-3">
                 <BillingPortalButton clubSlug={slug} returnPath={`/${lang}/club/${slug}/dashboard`} hasStripeCustomer={!!profile?.stripe_customer_id} />
                 {member.stripe_subscription_id && member.payment_status !== "cancelled" && (
                   <CancelMembershipButton clubSlug={slug} />
                 )}
              </div>
            </SpotlightCard>

            {/* DOCUMENTS & HISTORY */}
            <div className="grid grid-cols-2 gap-4">
               <Link href={`/${lang}/club/${slug}/dashboard/documents`} className="block">
                  <SpotlightCard className="p-5 h-full flex flex-col gap-4 text-center items-center justify-center group">
                     <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[#CBBF9A]/10 group-hover:border-[#CBBF9A]/20 transition-all">
                        <FileText className="w-5 h-5 text-white/40 group-hover:text-[#CBBF9A]" />
                     </div>
                     <p className="text-xs font-bold text-white/60">Dokumente</p>
                  </SpotlightCard>
               </Link>
               <Link href={`/${lang}/club/${slug}/dashboard/history`} className="block">
                  <SpotlightCard className="p-5 h-full flex flex-col gap-4 text-center items-center justify-center group">
                     <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[#CBBF9A]/10 group-hover:border-[#CBBF9A]/20 transition-all">
                        <Activity className="w-5 h-5 text-white/40 group-hover:text-[#CBBF9A]" />
                     </div>
                     <p className="text-xs font-bold text-white/60">Aktivität</p>
                  </SpotlightCard>
               </Link>
            </div>
          </div>

        </main>
      </div>
    </div>
  )
}
  )
}
