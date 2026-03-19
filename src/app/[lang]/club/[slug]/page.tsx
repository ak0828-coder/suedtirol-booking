"use client"

import { createClient } from "@/lib/supabase/client"
import { notFound, redirect, useParams } from "next/navigation"
import { MapPin, Check, LogIn, User, Sparkles, ChevronRight, CalendarDays, ArrowRight, ShieldCheck, Zap, Loader2 } from "lucide-react"
import { BookingModal } from "@/components/booking-modal"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MembershipPlans } from "@/components/membership-plans"
import { applyClubDefaults, mergeClubContent } from "@/lib/club-content"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { getReadableTextColor } from "@/lib/color"
import { TourLauncher } from "@/components/tours/tour-launcher"
import { Suspense, useEffect, useState, useRef } from "react"
import { useI18n } from "@/components/i18n/locale-provider"
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

export default function ClubPage() {
  const params = useParams()
  const slug = params?.slug as string
  const lang = params?.lang as string
  const { t } = useI18n()
  const [data, setData] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isMember, setIsMember] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user: u } } = await supabase.auth.getUser()
      setUser(u)

      const { data: club } = await supabase
        .from("clubs")
        .select("*")
        .eq("slug", slug)
        .single()

      if (!club) {
        setLoading(false)
        return
      }

      const [{ data: courts }, { data: plans }, { data: contentRows }] = await Promise.all([
        supabase.from("courts").select("*").eq("club_id", club.id).order("name"),
        supabase.from("membership_plans").select("*").eq("club_id", club.id).order("price", { ascending: true }),
        supabase.from("club_content").select("content").eq("club_id", club.id).limit(1)
      ])

      const storedContent = contentRows?.[0]?.content ?? null
      const content = applyClubDefaults(mergeClubContent(storedContent), club.name)

      if (u) {
        const { data: member } = await supabase
          .from("club_members")
          .select("id, status, valid_until")
          .eq("club_id", club.id)
          .eq("user_id", u.id)
          .eq("status", "active")
          .single()

        if (member && (!member.valid_until || new Date(member.valid_until) > new Date())) {
          setIsMember(true)
          // redirect happens in a separate effect or just render different UI
        }
      }

      setData({ club, courts, plans, content })
      setLoading(false)
    }
    load()
  }, [slug])

  if (loading) return (
    <div className="min-h-screen bg-[#030504] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
    </div>
  )
  if (!data) return notFound()
  if (isMember) redirect(`/${lang}/club/${slug}/dashboard`)

  const { club, courts, plans, content } = data
  const primary = club.primary_color || "#1F3D2B"
  const primaryRGB = hexToRgb(primary)
  const primaryFg = getReadableTextColor(primary)
  const courtCount = courts?.length || 0
  const minPrice = courts && courts.length > 0 ? Math.min(...courts.map((c: any) => c.price_per_hour || 0)) : null

  return (
    <div
      className="min-h-screen bg-[#030504] text-[#F9F8F4] selection:bg-[#CBBF9A] selection:text-[#030504] overflow-x-hidden"
      style={{
        ["--club-primary" as any]: primary,
        ["--primary-rgb" as any]: primaryRGB,
        ["--club-primary-foreground" as any]: primaryFg,
      }}
    >
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#0A1410] via-[#030504] to-[#030504]" />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -top-[10%] left-1/2 -translate-x-1/2 w-full max-w-5xl h-[600px] rounded-full blur-[120px]"
          style={{ background: `rgba(${primaryRGB}, 0.3)` }}
        />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)`, backgroundSize: "4rem 4rem" }} />
      </div>

      <div className="relative z-10">
        {/* ── HEADER ── */}
        <header className="sticky top-0 z-50 py-4 bg-[#030504]/80 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
            <Link href={`/${lang}/club/${slug}`} className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl overflow-hidden ring-1 ring-white/10 group-hover:scale-110 transition-transform shadow-2xl" style={{ backgroundColor: primary }}>
                {club.logo_url ? <img src={club.logo_url} alt={club.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white font-bold">{club.name.substring(0, 2).toUpperCase()}</div>}
              </div>
              <span className="text-xl font-bold tracking-tighter group-hover:text-[#CBBF9A] transition-colors">{club.name}</span>
            </Link>

            <div className="flex items-center gap-4">
              <Link href={`/${lang}/club/${slug}/training`} className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition-colors">
                <Sparkles className="w-4 h-4 text-[#CBBF9A]" /> {t("club.nav.training")}
              </Link>
              <Link href={`/${lang}/club/${slug}/login`} className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-[#030504] text-sm font-bold hover:scale-105 transition-all shadow-lg shadow-white/5">
                <LogIn className="w-4 h-4" /> {t("club.nav.login")}
              </Link>
            </div>
          </div>
        </header>

        <main>
          {/* ── HERO ── */}
          <section className="pt-24 pb-32 px-6 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-[0.2em] text-[#CBBF9A] mb-8">
                <MapPin className="w-3 h-3" /> {content.badges.locationText}
              </div>
              <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] mb-8">
                <span className="block text-white">{content.hero.title.split(' ')[0]}</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#CBBF9A] via-[#E2D8B9] to-[#CBBF9A]">{content.hero.title.split(' ').slice(1).join(' ')}</span>
              </h1>
              <p className="text-xl text-white/50 max-w-lg mb-12 font-light leading-relaxed">
                {content.hero.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="#courts" className="px-8 py-4 bg-[#CBBF9A] text-[#030504] rounded-full font-bold text-lg hover:scale-105 transition-transform text-center flex items-center justify-center gap-2">
                  {content.hero.primaryCtaText} <ArrowRight className="w-5 h-5" />
                </Link>
                {plans?.length > 0 && (
                  <Link href="#membership" className="px-8 py-4 bg-white/5 border border-white/10 rounded-full font-bold text-lg hover:bg-white/10 transition-colors text-center">
                    {content.hero.secondaryCtaText}
                  </Link>
                )}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}>
              <SpotlightCard className="p-10 relative group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                   <Zap className="w-32 h-32 text-[#CBBF9A]" />
                </div>
                <div className="relative z-10 space-y-8">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#CBBF9A] mb-2">{content.overview.title}</p>
                    <div className="h-1 w-12 bg-[#CBBF9A] rounded-full" />
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-sm text-white/40 mb-1">{content.overview.labelCourts}</p>
                      <p className="text-4xl font-black text-white">{courtCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/40 mb-1">{content.overview.labelFromPrice}</p>
                      <p className="text-4xl font-black text-white">{minPrice ? `${minPrice}€` : '—'}</p>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-white/5 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                    <span className="text-sm font-medium text-white/60">{content.badges.statusText}</span>
                  </div>
                </div>
              </SpotlightCard>
            </motion.div>
          </section>

          {/* ── COURTS ── */}
          <section id="courts" className="py-32 px-6 max-w-7xl mx-auto scroll-mt-24">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">{content.sections.courts.title}</h2>
              <p className="text-white/40 text-lg">{content.sections.courts.subtitle}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {courts?.map((court: any, idx: number) => (
                <motion.div
                  key={court.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <SpotlightCard className="p-8 h-full flex flex-col justify-between group">
                    <div className="flex justify-between items-start mb-12">
                      <div>
                        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                          <CalendarDays className="w-7 h-7 text-[#CBBF9A]" />
                        </div>
                        <h3 className="text-3xl font-bold mb-2 group-hover:text-[#CBBF9A] transition-colors">{court.name}</h3>
                        <p className="text-xs font-bold uppercase tracking-widest text-white/30">{court.sport_type || 'Tennis'}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-4xl font-black text-white">{court.price_per_hour}€</div>
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-tighter">Pro {court.duration_minutes || 60} Min</p>
                      </div>
                    </div>
                    
                    <BookingModal
                      courtId={court.id}
                      courtName={court.name}
                      price={court.price_per_hour}
                      clubSlug={club.slug}
                      durationMinutes={court.duration_minutes || 60}
                      startHour={court.start_hour}
                      endHour={court.end_hour}
                      isMember={isMember}
                      memberPricingMode={club.member_booking_pricing_mode || "full_price"}
                      memberPricingValue={club.member_booking_pricing_value || 0}
                    />
                  </SpotlightCard>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ── MEMBERSHIP ── */}
          {plans?.length > 0 && (
            <section id="membership" className="py-32 px-6 bg-white/[0.01] border-y border-white/5 scroll-mt-24">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-20">
                  <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">{content.sections.membership.title}</h2>
                  <p className="text-white/40 text-lg">{content.sections.membership.subtitle}</p>
                </div>
                <MembershipPlans
                  plans={plans}
                  clubSlug={slug}
                  title={content.sections.membership.title}
                  subtitle={content.sections.membership.subtitle}
                  ctaLabel={content.sections.membership.ctaLabel}
                />
              </div>
            </section>
          )}
        </main>

        <footer className="py-20 px-6 border-t border-white/5">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="space-y-4 text-center md:text-left">
              <p className="text-sm text-white/20">{content.footer.smallText}</p>
              <p className="text-xs text-white/10">© {new Date().getFullYear()} {club.name}. Powered by Avaimo.</p>
            </div>
            <div className="flex gap-8">
              <Link href={`/${lang}/club/${slug}/impressum`} className="text-sm text-white/30 hover:text-[#CBBF9A] transition-colors">{content.footer.impressumLinkText}</Link>
              <Link href="https://avaimo.com" className="text-sm text-white/30 hover:text-[#CBBF9A] transition-colors">avaimo.com</Link>
            </div>
          </div>
        </footer>
      </div>

      {user && <MobileBottomNav slug={club.slug} active="home" />}
    </div>
  )
}
