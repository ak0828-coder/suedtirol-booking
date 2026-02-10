"use client"

import { useMemo, useState } from "react"
import { CourseEnrollCard } from "@/components/training/course-enroll-card"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/components/i18n/locale-provider"

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
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-slate-500">
          {onlyAvailable ? t("training.filter.available", "Nur Kurse mit freien Plätzen") : t("training.filter.all", "Alle Kurse")}
        </div>
        <Button
          variant={onlyAvailable ? "default" : "outline"}
          className="rounded-full"
          onClick={() => setOnlyAvailable((v) => !v)}
        >
          {onlyAvailable ? t("training.filter.show_all", "Alle anzeigen") : t("training.filter.show_available", "Nur freie Plätze")}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((course: any, idx: number) => (
          <CourseEnrollCard
            key={course.id}
            clubSlug={clubSlug}
            course={course}
            cardId={idx === 0 ? "tour-training-course-card" : undefined}
          />
        ))}
        {filtered.length === 0 ? (
          <div className="text-sm text-slate-500">{t("training.filter.empty", "Keine passenden Kurse gefunden.")}</div>
        ) : null}
      </div>
    </div>
  )
}

