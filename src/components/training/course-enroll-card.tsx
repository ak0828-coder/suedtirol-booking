"use client"

import { useTransition, useState } from "react"
import { createCourseCheckoutSession } from "@/app/actions"
import { Button } from "@/components/ui/button"

export function CourseEnrollCard({
  clubSlug,
  course,
}: {
  clubSlug: string
  course: any
}) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  const sessions = Array.isArray(course.sessions) ? course.sessions : []
  const now = new Date()
  const sortedSessions = sessions
    .slice()
    .sort((a: any, b: any) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
  const upcoming = sortedSessions.filter((s: any) => new Date(s.start_time) >= now)
  const displaySessions = (upcoming.length > 0 ? upcoming : sortedSessions).slice(0, 3)

  const sessionSignature = (() => {
    if (sortedSessions.length < 2) return ""
    const keys = new Set<string>()
    for (const s of sortedSessions) {
      const d = new Date(s.start_time)
      const day = d.getDay()
      const start = d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
      const end = new Date(s.end_time).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
      keys.add(`${day}-${start}-${end}`)
    }
    if (keys.size !== 1) return ""
    const dayNames = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"]
    const [key] = Array.from(keys)
    const [day, start, end] = key.split("-")
    return `Woechentlich ${dayNames[Number(day)]} ${start}-${end}`
  })()

  const handleEnroll = () => {
    setError(null)
    startTransition(async () => {
      const res = await createCourseCheckoutSession(clubSlug, course.id)
      if (res?.url) {
        window.location.href = res.url
      } else if (res?.error) {
        setError(res.error)
      }
    })
  }

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-5 shadow-sm space-y-3">
      <div>
        <div className="text-lg font-semibold text-slate-900">{course.title}</div>
        <div className="text-sm text-slate-500">{course.description || "Kursbeschreibung"}</div>
      </div>
      <div className="text-sm text-slate-600">
        Preis: {course.price ? `${course.price} EUR` : "Kostenlos"}
      </div>
      {sessionSignature ? (
        <div className="text-xs text-slate-500">{sessionSignature}</div>
      ) : null}
      {displaySessions.length > 0 ? (
        <div className="text-xs text-slate-500">
          Naechste Termine:{" "}
          {displaySessions.map((s: any, idx: number) => {
            const d = new Date(s.start_time)
            const dateStr = d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })
            const start = d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
            const end = new Date(s.end_time).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
            return `${dateStr} ${start}-${end}${idx < displaySessions.length - 1 ? " | " : ""}`
          })}
          {sortedSessions.length > displaySessions.length ? ` (+${sortedSessions.length - displaySessions.length} weitere)` : ""}
        </div>
      ) : (
        <div className="text-xs text-slate-500">Termine folgen</div>
      )}
      {error ? <div className="text-xs text-red-500">{error}</div> : null}
      <Button className="rounded-full w-full" onClick={() => setOpen(true)}>
        Details & Anmelden
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xl font-semibold text-slate-900">{course.title}</div>
                <div className="text-sm text-slate-500">{course.description || "Kursbeschreibung"}</div>
              </div>
              <button
                className="text-slate-400 hover:text-slate-600"
                onClick={() => setOpen(false)}
              >
                Schliessen
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border border-slate-200/60 bg-slate-50 p-3">
                <div className="text-xs text-slate-500">Plaetze</div>
                <div className="font-semibold text-slate-900">
                  {course.confirmed_count ?? 0}/{course.max_participants ?? "-"}
                </div>
                <div className="text-[11px] text-slate-500">
                  Noch {Math.max(0, (course.max_participants ?? 0) - (course.confirmed_count ?? 0))} frei
                </div>
              </div>
              <div className="rounded-xl border border-slate-200/60 bg-slate-50 p-3">
                <div className="text-xs text-slate-500">Preis</div>
                <div className="font-semibold text-slate-900">
                  {course.price ? `${course.price} EUR` : "Kostenlos"}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200/60 bg-slate-50 p-3">
                <div className="text-xs text-slate-500">Leitung</div>
                <div className="font-semibold text-slate-900">
                  {course.trainer_name || "Verein"}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200/60 bg-slate-50 p-3">
                <div className="text-xs text-slate-500">Zeitraum</div>
                <div className="font-semibold text-slate-900">
                  {course.start_date || "-"} bis {course.end_date || "-"}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-semibold text-slate-900">Alle Termine</div>
              {sortedSessions.length === 0 ? (
                <div className="text-sm text-slate-500">Termine folgen</div>
              ) : (
                <div className="max-h-48 overflow-auto space-y-1 text-sm">
                  {sortedSessions.map((s: any) => {
                    const d = new Date(s.start_time)
                    const dateStr = d.toLocaleDateString("de-DE")
                    const start = d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
                    const end = new Date(s.end_time).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
                    const court = s.courts?.name || "Platz"
                    return (
                      <div key={s.id} className="flex items-center justify-between border-b border-slate-100 py-1">
                        <div>{dateStr}</div>
                        <div className="text-slate-500">{start}-{end}</div>
                        <div className="text-slate-500">{court}</div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {error ? <div className="text-xs text-red-500">{error}</div> : null}

            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" className="rounded-full" onClick={() => setOpen(false)}>
                Abbrechen
              </Button>
              <Button className="rounded-full" onClick={handleEnroll} disabled={pending}>
                {pending ? "Weiter..." : "Anmelden"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

