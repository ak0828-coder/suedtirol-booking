"use client"

import { useState, useTransition, useRef } from "react"
import { createTrainerCheckoutSession } from "@/app/actions"
import { useI18n } from "@/components/i18n/locale-provider"
import { motion, AnimatePresence } from "motion/react"
import { CalendarDays, Clock, User, CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react"

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

export function TrainerBookingCard({
  clubSlug,
  trainer,
  cardId,
}: {
  clubSlug: string
  trainer: any
  cardId?: string
}) {
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [duration, setDuration] = useState(60)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const { t } = useI18n()

  const imageUrl = trainer.image_url || trainer.imageUrl || trainer.image || ""

  const handleBooking = () => {
    if (!date || !time) {
      setError(t("trainer.booking.error_missing"))
      return
    }
    setError(null)
    setSuccess(null)
    startTransition(async () => {
      const res = await createTrainerCheckoutSession(clubSlug, trainer.id, date, time, duration)
      if (res?.url) {
        window.location.href = res.url
      } else if (res?.success) {
        setSuccess(t("trainer.booking.success"))
        setDate("")
        setTime("")
        setTimeout(() => setOpen(false), 2000)
      } else if (res?.error) {
        setError(res.error)
      }
    })
  }

  const inputClasses = "w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-white/20 outline-none focus:border-[#CBBF9A]/40 focus:ring-4 focus:ring-[#CBBF9A]/5 transition-all text-sm"
  const labelClasses = "text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2 block px-1"

  return (
    <>
      <SpotlightCard className="p-6">
        <div className="flex items-center gap-5 mb-6">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`${trainer.first_name} ${trainer.last_name}`}
              className="w-16 h-16 rounded-2xl object-cover border border-white/10 shadow-2xl"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <User className="w-8 h-8 text-white/20" />
            </div>
          )}
          <div>
            <h3 className="text-xl font-bold text-white leading-tight">
              {trainer.first_name} {trainer.last_name}
            </h3>
            <p className="text-sm text-white/40 mt-1 line-clamp-1">{trainer.bio || t("trainer.card.profile")}</p>
          </div>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="w-full h-12 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-white hover:bg-white/10 hover:border-[#CBBF9A]/30 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          {t("trainer.card.cta")}
          <ArrowRight className="w-4 h-4 text-[#CBBF9A]" />
        </button>
      </SpotlightCard>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-[#030504]/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#0A0D0C] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 md:p-10">
                <div className="flex items-center gap-4 mb-8">
                   <div className="w-12 h-12 rounded-2xl bg-[#CBBF9A]/10 border border-[#CBBF9A]/20 flex items-center justify-center">
                      <CalendarDays className="w-6 h-6 text-[#CBBF9A]" />
                   </div>
                   <div>
                      <h2 className="text-2xl font-black text-white">{t("trainer.modal.title")}</h2>
                      <p className="text-sm text-white/40">{trainer.first_name} {trainer.last_name}</p>
                   </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClasses}>{t("trainer.modal.date")}</label>
                      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClasses} />
                    </div>
                    <div>
                      <label className={labelClasses}>{t("trainer.modal.time")}</label>
                      <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={inputClasses} />
                    </div>
                  </div>

                  <div>
                    <label className={labelClasses}>{t("trainer.modal.duration")}</label>
                    <div className="relative">
                       <input 
                        type="number" 
                        value={duration} 
                        min={30} 
                        step={30} 
                        onChange={(e) => setDuration(Number(e.target.value))} 
                        className={inputClasses} 
                       />
                       <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-white/20 uppercase tracking-widest">Min</div>
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> {error}
                    </div>
                  )}

                  {success && (
                    <div className="p-4 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 text-[#34D399] text-xs font-medium flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> {success}
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setOpen(false)}
                      className="flex-1 h-14 rounded-2xl bg-white/5 text-white font-bold text-sm hover:bg-white/10 transition-colors"
                    >
                      {t("training.course.cancel")}
                    </button>
                    <button
                      onClick={handleBooking}
                      disabled={pending}
                      className="flex-[2] h-14 rounded-2xl bg-[#CBBF9A] text-[#030504] font-bold text-sm hover:scale-105 transition-transform shadow-xl shadow-[#CBBF9A]/10 flex items-center justify-center gap-2"
                    >
                      {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : t("trainer.modal.cta")}
                    </button>
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
