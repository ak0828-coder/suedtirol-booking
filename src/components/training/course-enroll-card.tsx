"use client"

import { useTransition, useState, useRef } from "react"
import { createCourseCheckoutSession, joinCourseWaitlist } from "@/app/actions"
import { useParams } from "next/navigation"
import { useI18n } from "@/components/i18n/locale-provider"
import { motion, AnimatePresence } from "motion/react"
import { CalendarDays, Clock, Users, ArrowRight, X, Check, Loader2, Info, ChevronRight } from "lucide-react"

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
          background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(var(--primary-rgb), 0.1), transparent 40%)`,
        }}
      />
      {children}
    </div>
  )
}

export function CourseEnrollCard({
  clubSlug,
  course,
  cardId,
}: {
  clubSlug: string
  course: any
  cardId?: string
}) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [waitlistStatus, setWaitlistStatus] = useState<"idle" | "joined">("idle")
  const { t } = useI18n()
  const params = useParams()
  const lang = (params?.lang as string) || "de"
  const locale = lang === "it" ? "it-IT" : lang === "en" ? "en-US" : "de-DE"

  const sessions = Array.isArray(course.sessions) ? course.sessions : []
  const now = new Date()
  const sortedSessions = sessions
    .slice()
    .sort((a: any, b: any) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
  const upcoming = sortedSessions.filter((s: any) => new Date(s.start_time) >= now)
  const nextSession = upcoming[0] || sortedSessions[0] || null

  const pricingMode = course.pricing_mode || "full_course"
  const totalPrice = pricingMode === "per_session"
    ? (Number(course.price || 0) * selected.length)
    : Number(course.price || 0)
  const maxParticipants = Number(course.max_participants || 0)
  const confirmedCount = Number(course.confirmed_count || 0)
  const isCourseFull = maxParticipants > 0 && confirmedCount >= maxParticipants

  const handleEnroll = () => {
    setError(null)
    startTransition(async () => {
      const res = await createCourseCheckoutSession(
        clubSlug,
        course.id,
        pricingMode === "per_session" ? selected : undefined
      )
      if (res?.url) {
        window.location.href = res.url
      } else if (res?.success) {
        setOpen(false)
        setSelected([])
      } else if (res?.error) {
        setError(res.error)
      }
    })
  }

  return (
    <>
      <SpotlightCard className="p-6 h-full flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
               <h3 className="text-xl font-bold text-white tracking-tight">{course.title}</h3>
               <p className="text-sm text-white/40 line-clamp-2">{course.description || t("training.course.description_fallback")}</p>
            </div>
            {isCourseFull && (
              <span className="px-2 py-1 rounded-lg bg-red-500/10 text-red-400 text-[9px] font-black uppercase tracking-widest border border-red-500/20">
                {t("training.course.sold_out")}
              </span>
            )}
          </div>

          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-white/20" />
                <span className="text-xs font-bold text-white/60">{confirmedCount}/{maxParticipants || '∞'}</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="text-xs font-black text-[#CBBF9A]">
                   {course.price ? `${course.price}€` : t("training.course.free")}
                </div>
                {pricingMode === "per_session" && <span className="text-[9px] font-bold text-white/20 uppercase tracking-tighter">/ Termin</span>}
             </div>
          </div>

          {nextSession && (
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#10B981]/10 flex items-center justify-center">
                     <CalendarDays className="w-4 h-4 text-[#34D399]" />
                  </div>
                  <div>
                     <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">{t("training.course.next")}</p>
                     <p className="text-xs font-bold text-white">{new Date(nextSession.start_time).toLocaleDateString(locale)}</p>
                  </div>
               </div>
               <div className="text-right">
                  <p className="text-xs font-mono text-white/60">{new Date(nextSession.start_time).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}</p>
               </div>
            </div>
          )}
        </div>

        <div className="mt-8">
          {isCourseFull ? (
            <button
              onClick={() => {
                if (waitlistStatus === "joined") return
                startTransition(async () => {
                  const res = await joinCourseWaitlist(clubSlug, course.id)
                  if (res?.success) setWaitlistStatus("joined")
                })
              }}
              className={`w-full h-12 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                waitlistStatus === "joined" ? 'bg-[#10B981]/10 text-[#34D399]' : 'bg-white/5 text-white hover:bg-white/10'
              }`}
            >
              {waitlistStatus === "joined" ? <><Check className="w-4 h-4" /> Warteliste beigetreten</> : t("training.course.join_waitlist")}
            </button>
          ) : (
            <button
              onClick={() => setOpen(true)}
              className="w-full h-12 bg-white text-[#030504] rounded-xl text-sm font-bold hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-xl shadow-white/5"
            >
              {t("training.course.cta")}
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </SpotlightCard>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} className="absolute inset-0 bg-[#030504]/90 backdrop-blur-md" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-[#0A0D0C] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-8 md:p-12 overflow-y-auto">
                <div className="flex justify-between items-start mb-12">
                   <div>
                      <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">{course.title}</h2>
                      <p className="text-white/40 text-lg font-light max-w-2xl">{course.description}</p>
                   </div>
                   <button onClick={() => setOpen(false)} className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors">
                      <X className="w-6 h-6" />
                   </button>
                </div>

                <div className="grid lg:grid-cols-[1fr_0.8fr] gap-12">
                   <div className="space-y-8">
                      <div className="grid grid-cols-2 gap-4">
                         <SpotlightCard className="p-5">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">Preis</p>
                            <p className="text-2xl font-black text-white">{course.price ? `${course.price}€` : 'Gratis'}</p>
                            <p className="text-[10px] font-bold text-[#CBBF9A] uppercase tracking-tighter">{pricingMode === 'per_session' ? 'Pro Termin' : 'Gesamtpaket'}</p>
                         </SpotlightCard>
                         <SpotlightCard className="p-5">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">Leitung</p>
                            <p className="text-xl font-bold text-white truncate">{course.trainer_name || 'Club Team'}</p>
                         </SpotlightCard>
                      </div>

                      <div className="space-y-4">
                         <h4 className="text-sm font-bold uppercase tracking-widest text-white/60 px-2">Termine</h4>
                         <div className="space-y-3">
                            {sortedSessions.map((s: any) => {
                               const isSelected = selected.includes(s.id)
                               const isFull = Number(s.booked_count || 0) >= maxParticipants
                               return (
                                 <div 
                                  key={s.id} 
                                  onClick={() => {
                                    if (pricingMode !== 'per_session' || (isFull && !isSelected)) return
                                    setSelected(prev => isSelected ? prev.filter(id => id !== s.id) : [...prev, s.id])
                                  }}
                                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                                    isSelected ? 'bg-[#CBBF9A]/10 border-[#CBBF9A]/40' : 'bg-white/5 border-white/5 hover:border-white/10'
                                  } ${isFull && pricingMode === 'per_session' ? 'opacity-40 cursor-not-allowed' : ''}`}
                                 >
                                    <div className="flex items-center gap-4">
                                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? 'bg-[#CBBF9A] text-[#030504]' : 'bg-white/5 text-white/20'}`}>
                                          {isSelected ? <Check className="w-5 h-5" /> : <CalendarDays className="w-5 h-5" />}
                                       </div>
                                       <div>
                                          <p className="text-sm font-bold text-white">{new Date(s.start_time).toLocaleDateString(locale, { weekday: 'long', day: '2-digit', month: 'long' })}</p>
                                          <p className="text-xs text-white/40">{new Date(s.start_time).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })} · {s.courts?.name}</p>
                                       </div>
                                    </div>
                                    {pricingMode === 'full_course' && <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest px-3">Inklusive</span>}
                                 </div>
                               )
                            })}
                         </div>
                      </div>
                   </div>

                   <div className="space-y-8">
                      <SpotlightCard className="p-8 sticky top-0 bg-[#CBBF9A] border-none text-[#030504]">
                         <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 opacity-40">Zusammenfassung</h4>
                         <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-end border-b border-black/5 pb-4">
                               <p className="text-sm font-bold">Auswahl</p>
                               <p className="text-xl font-black">{pricingMode === 'per_session' ? `${selected.length} Termine` : 'Gesamter Kurs'}</p>
                            </div>
                            <div className="flex justify-between items-end">
                               <p className="text-sm font-bold">Gesamtpreis</p>
                               <p className="text-4xl font-black">{totalPrice.toFixed(2).replace('.', ',')}€</p>
                            </div>
                         </div>
                         <button
                          onClick={handleEnroll}
                          disabled={pending || (pricingMode === "per_session" && selected.length === 0)}
                          className="w-full h-16 rounded-2xl bg-[#030504] text-white font-black text-lg hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                         >
                            {pending ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Anmeldung abschließen <ArrowRight className="w-5 h-5" /></>}
                         </button>
                         <p className="mt-6 text-[10px] font-bold text-center opacity-40 uppercase tracking-widest flex items-center justify-center gap-2">
                            <ShieldCheck className="w-3 h-3" /> Sichere Zahlung via Stripe
                         </p>
                      </SpotlightCard>
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
