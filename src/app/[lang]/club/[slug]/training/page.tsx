"use client"

import { createClient } from "@/lib/supabase/client"
import { notFound, useParams } from "next/navigation"
import { TrainerBookingCard } from "@/components/training/trainer-booking-card"
import { CourseGrid } from "@/components/training/course-grid"
import { TourLauncher } from "@/components/tours/tour-launcher"
import { Suspense, useEffect, useState, useRef } from "react"
import Link from "next/link"
import { useI18n } from "@/components/i18n/locale-provider"
import { motion } from "motion/react"
import { ChevronLeft, Dumbbell, Sparkles, Loader2, Trophy, Zap, MapPin } from "lucide-react"

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

export default function PublicTrainingPage() {
  const params = useParams()
  const slug = params?.slug as string
  const lang = params?.lang as string
  const { t } = useI18n()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    async function load() {
      const { data: { user: u } } = await supabase.auth.getUser()
      setUser(u)

      const { data: club } = await supabase.from("clubs").select("*").eq("slug", slug).single()
      if (!club) {
        setLoading(false)
        return
      }

      const [
        { data: trainers },
        { data: courses },
        { data: sessions },
        { data: participants },
        { data: sessionParticipants }
      ] = await Promise.all([
        supabase.from("trainers").select("*").eq("club_id", club.id).eq("is_active", true).order("last_name"),
        supabase.from("courses").select("*, trainers(first_name, last_name)").eq("club_id", club.id).eq("is_published", true).order("created_at", { ascending: false }),
        supabase.from("course_sessions").select("*, courts(name)").order("start_time", { ascending: true }),
        supabase.from("course_participants").select("course_id, status"),
        supabase.from("course_session_participants").select("course_session_id, status")
      ])

      const counts = new Map<string, number>()
      for (const p of participants || []) {
        if (p.status !== "confirmed") continue
        counts.set(p.course_id, (counts.get(p.course_id) || 0) + 1)
      }

      const sessionsByCourse = new Map<string, any[]>()
      for (const s of sessions || []) {
        const list = sessionsByCourse.get(s.course_id) || []
        list.push(s)
        sessionsByCourse.set(s.course_id, list)
      }

      const bookedBySession = new Map<string, number>()
      for (const b of sessionParticipants || []) {
        if (b.status === "cancelled") continue
        bookedBySession.set(b.course_session_id, (bookedBySession.get(b.course_session_id) || 0) + 1)
      }

      setData({ club, trainers, courses, sessionsByCourse, counts, bookedBySession })
      setLoading(false)
    }
    load()
  }, [slug])

  if (loading) return (
    <div className="min-h-screen bg-[#030504] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
    </div>
  )

  if (!data?.club) return notFound()

  const { club, trainers, courses, sessionsByCourse, counts, bookedBySession } = data
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
          animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.15, 0.05] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[600px] rounded-full blur-[140px]"
          style={{ background: `rgba(${primaryRGB}, 0.2)` }}
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 py-4 bg-[#030504]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/${lang}/club/${slug}`} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors group">
              <ChevronLeft className="w-5 h-5 text-white/40 group-hover:text-white" />
            </Link>
            <div>
              <h1 className="text-xl font-black tracking-tight">{t("training.hero.title")}</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#CBBF9A]">{club.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <Suspense fallback={null}>
                <TourLauncher tour="training" storageKey="tour_training_seen" label={t("training.hero.guide")} autoStart />
             </Suspense>
             <div className="w-10 h-10 rounded-xl bg-[#CBBF9A]/10 border border-[#CBBF9A]/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#CBBF9A]" />
             </div>
          </div>
        </div>
      </header>

      <main className="px-6 max-w-7xl mx-auto pt-12 space-y-20">
        
        {/* Intro Section */}
        <section className="relative">
           <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-[0.2em] text-[#CBBF9A] mb-8">
                <Zap className="w-3 h-3" fill="currentColor" /> Pro-Level Coaching
              </div>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-8">
                Hebe dein Spiel auf das <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#CBBF9A] to-[#E2D8B9]">nächste Level.</span>
              </h2>
              <p className="text-xl text-white/40 font-light leading-relaxed">
                {t("training.hero.subtitle")} Ob Einzeltraining oder Intensivkurs – unsere Trainer begleiten dich auf deinem Weg zum Erfolg.
              </p>
           </div>
        </section>

        {/* Trainers Grid */}
        <section className="space-y-10">
          <div className="flex items-center justify-between border-b border-white/5 pb-6">
             <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 text-[#CBBF9A]" />
                <h3 className="text-2xl font-bold tracking-tight">{t("training.trainers.title")}</h3>
             </div>
             {!user && (
               <div className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-widest">
                  {t("training.trainers.login_required")}
               </div>
             )}
          </div>
          
          {(trainers || []).length === 0 ? (
            <SpotlightCard className="p-16 text-center border-dashed">
              <p className="text-white/20 text-lg font-medium">{t("training.trainers.empty")}</p>
            </SpotlightCard>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {(trainers || []).map((trainer: any, idx: number) => (
                <motion.div key={trainer.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}>
                   <TrainerBookingCard clubSlug={slug} trainer={trainer} />
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Courses Section */}
        <section className="space-y-10">
          <div className="flex items-center gap-3 border-b border-white/5 pb-6">
             <Dumbbell className="w-6 h-6 text-[#CBBF9A]" />
             <h3 className="text-2xl font-bold tracking-tight">{t("training.courses.title")}</h3>
          </div>

          {(courses || []).length === 0 ? (
            <SpotlightCard className="p-16 text-center border-dashed">
              <p className="text-white/20 text-lg font-medium">{t("training.courses.empty")}</p>
            </SpotlightCard>
          ) : (
            <CourseGrid
              clubSlug={slug}
              courses={(courses || []).map((course: any) => ({
                ...course,
                confirmed_count: counts.get(course.id) || 0,
                trainer_name: course.trainers ? `${course.trainers.first_name} ${course.trainers.last_name}` : "",
                sessions: (sessionsByCourse.get(course.id) || []).map((s: any) => ({
                  ...s,
                  booked_count: bookedBySession.get(s.id) || 0,
                })),
              }))}
            />
          )}
        </section>

      </main>

      {/* Footer Branding */}
      <footer className="mt-20 pt-20 pb-10 px-6 border-t border-white/5 text-center">
         <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/10 mb-4">Powered by Avaimo</p>
         <Link href="https://avaimo.com" className="text-sm text-white/20 hover:text-[#CBBF9A] transition-colors">avaimo.com</Link>
      </footer>
    </div>
  )
}
