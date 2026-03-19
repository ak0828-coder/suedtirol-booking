"use client"

import { useMemo, useState } from "react"
import { CourseEnrollCard } from "@/components/training/course-enroll-card"
import { useI18n } from "@/components/i18n/locale-provider"
import { Filter } from "lucide-react"

export function CourseGrid({
  clubSlug,
  courses,
}: {
  clubSlug: string
  courses: any[]
}) {
  const [onlyAvailable, setOnlyAvailable] = useState(false)
  const { t } = useI18n()

  const filtered = useMemo(() => {
    if (!onlyAvailable) return courses
    return (courses || []).filter((c: any) => {
      const max = Number(c.max_participants || 0)
      const confirmed = Number(c.confirmed_count || 0)
      const pricingMode = c.pricing_mode || "full_course"
      if (pricingMode === "per_session") {
        const sessions = Array.isArray(c.sessions) ? c.sessions : []
        if (sessions.length === 0) return false
        if (!max) return true
        return sessions.some((s: any) => Number(s.booked_count || 0) < max)
      }
      if (!max) return true
      return confirmed < max
    })
  }, [onlyAvailable, courses])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4 px-2">
        <div className="flex items-center gap-2 text-white/40">
           <Filter className="w-4 h-4" />
           <span className="text-xs font-bold uppercase tracking-widest">Filter</span>
        </div>
        <button
          onClick={() => setOnlyAvailable((v) => !v)}
          className={`h-10 px-6 rounded-xl text-xs font-bold transition-all active:scale-95 ${
            onlyAvailable 
              ? 'bg-[#CBBF9A] text-[#030504]' 
              : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
          }`}
        >
          {onlyAvailable ? t("training.filter.show_all") : t("training.filter.show_available")}
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {filtered.map((course: any, idx: number) => (
          <CourseEnrollCard
            key={course.id}
            clubSlug={clubSlug}
            course={course}
            cardId={idx === 0 ? "tour-training-course-card" : undefined}
          />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-20 text-center rounded-3xl border border-dashed border-white/10">
             <p className="text-white/20 text-sm font-medium">{t("training.filter.empty")}</p>
          </div>
        )}
      </div>
    </div>
  )
}
