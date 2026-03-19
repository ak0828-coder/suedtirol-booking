"use client"

import { createClient } from "@/lib/supabase/client"
import { notFound, redirect, useParams } from "next/navigation"
import { TrainerBookingCard } from "@/components/training/trainer-booking-card"
import { CourseGrid } from "@/components/training/course-grid"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { useI18n } from "@/components/i18n/locale-provider"
import { useEffect, useState, useRef } from "react"
import { motion } from "motion/react"
import { ChevronLeft, Dumbbell, Sparkles, Loader2, Trophy, Zap } from "lucide-react"
import Link from "next/link"

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

export default function DashboardTrainingPage() {
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
      if (!user) {
        redirect(`/${lang}/club/${slug}/login?next=/${lang}/club/${slug}/dashboard/training`)
        return
      }

      const { data: club } = await supabase.from("clubs").select("*").eq("slug", slug).single()
      if (!club) return

      const [
        { data: trainers },
        { data: courses },
        { data: sessions },
        { data: participants }
      ] = await Promise.all([
        supabase.from("trainers").select("*").eq("club_id", club.id).eq("is_active", true).order("last_name"),
        supabase.from("courses").select("*, trainers(first_name, last_name)").eq("club_id", club.id).eq("is_published", true).order("created_at", { ascending: false }),
        supabase.from("course_sessions").select("*, courts(name)").order("start_time", { ascending: true }),
        supabase.from("course_participants").select("course_id, status")
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

      setData({ club, trainers, courses, sessionsByCourse, counts })
      setLoading(false)
    }
    load()
  }, [slug])

  if (loading) return (
    <div className="min-h-screen bg-[#030504] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
    </div>
  )

  const { club, trainers, courses, sessionsByCourse, counts } = data
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
        <div className="max-w-xl mx-auto px-6 flex items-center gap-4">
          <Link href={`/${lang}/club/${slug}/dashboard`} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors group">
            <ChevronLeft className="w-5 h-5 text-white/40 group-hover:text-white" />
          </Link>
          <div>
            <h1 className="text-xl font-black tracking-tight">{t("training.hero.title")}</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#CBBF9A]">{club.name}</p>
          </div>
        </div>
      </header>

      <main className="px-4 max-w-xl mx-auto pt-8 space-y-12">
        
        {/* Intro */}
        <section>
           <SpotlightCard className="p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                 <Zap className="w-32 h-32 text-[#CBBF9A]" />
              </div>
              <div className="relative z-10">
                 <div className="w-12 h-12 rounded-2xl bg-[#CBBF9A]/10 border border-[#CBBF9A]/20 flex items-center justify-center mb-6">
                    <Sparkles className="w-6 h-6 text-[#CBBF9A]" />
                 </div>
                 <h2 className="text-3xl font-black text-white mb-2">{t("training.hero.title")}</h2>
                 <p className="text-white/40 font-light leading-relaxed">{t("training.hero.subtitle")}</p>
              </div>
           </SpotlightCard>
        </section>

        {/* Trainers */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 px-2">
             <Trophy className="w-4 h-4 text-[#CBBF9A]" />
             <h2 className="text-lg font-bold uppercase tracking-widest text-white/60">{t("training.trainers.title")}</h2>
          </div>
          
          {(trainers || []).length === 0 ? (
            <SpotlightCard className="p-8 text-center border-dashed">
              <p className="text-white/20 text-sm">{t("training.trainers.empty")}</p>
            </SpotlightCard>
          ) : (
            <div className="grid gap-4">
              {(trainers || []).map((trainer: any, idx: number) => (
                <motion.div key={trainer.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                   <TrainerBookingCard clubSlug={slug} trainer={trainer} />
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Courses */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 px-2">
             <Dumbbell className="w-4 h-4 text-[#CBBF9A]" />
             <h2 className="text-lg font-bold uppercase tracking-widest text-white/60">{t("training.courses.title")}</h2>
          </div>

          {(courses || []).length === 0 ? (
            <SpotlightCard className="p-8 text-center border-dashed">
              <p className="text-white/20 text-sm">{t("training.courses.empty")}</p>
            </SpotlightCard>
          ) : (
            <CourseGrid
              clubSlug={slug}
              courses={(courses || []).map((course: any) => ({
                ...course,
                confirmed_count: counts.get(course.id) || 0,
                trainer_name: course.trainers ? `${course.trainers.first_name} ${course.trainers.last_name}` : "",
                sessions: (sessionsByCourse.get(course.id) || []),
              }))}
            />
          )}
        </section>

      </main>

      <MobileBottomNav slug={slug} active="training" />
    </div>
  )
}
