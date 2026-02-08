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
  const nextSession = upcoming[0] || sortedSessions[0] || null

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

  const miniCalendar = (() => {
    if (!nextSession) return null
    const toDateKey = (d: Date) => {
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, "0")
      const dayNum = String(d.getDate()).padStart(2, "0")
      return `${y}-${m}-${dayNum}`
    }
    const base = new Date(nextSession.start_time)
    const dayNames = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]
    const weekStart = new Date(base)
    const day = weekStart.getDay()
    const diff = (day + 6) % 7
    weekStart.setDate(weekStart.getDate() - diff)
    const days = Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date(weekStart)
      d.setDate(weekStart.getDate() + idx)
      const dateKey = toDateKey(d)
      const daySessions = sortedSessions.filter((s: any) => toDateKey(new Date(s.start_time)) === dateKey)
      return { d, daySessions }
    })
    return { dayNames, days, toDateKey }
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
      {nextSession ? (
        <div className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/70 px-3 py-2 text-xs">
          <div className="text-emerald-700 font-semibold">Naechster Termin</div>
          <div className="text-emerald-700">
            {new Date(nextSession.start_time).toLocaleDateString("de-DE")}{" "}
            {new Date(nextSession.start_time).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
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
      {miniCalendar ? (
        <div className="rounded-xl border border-slate-200/60 bg-white p-3">
          <div className="text-[11px] font-semibold text-slate-500 mb-2">Kalender (Woche)</div>
          <div className="grid grid-cols-7 gap-2 text-[10px]">
            {miniCalendar.dayNames.map((d) => (
              <div key={d} className="text-center font-semibold text-slate-400">{d}</div>
            ))}
            {miniCalendar.days.map(({ d, daySessions }) => {
              const isNext = nextSession && miniCalendar.toDateKey(d) === miniCalendar.toDateKey(new Date(nextSession.start_time))
              return (
                <div
                  key={d.toISOString()}
                  className={`rounded-lg border p-2 min-h-[52px] text-center ${
                    daySessions.length > 0 ? "bg-slate-50 border-slate-200/60" : "bg-white border-slate-100"
                  } ${isNext ? "ring-2 ring-emerald-200" : ""}`}
                >
                  <div className="text-[10px] text-slate-500">{d.getDate().toString().padStart(2, "0")}</div>
                  {daySessions.length > 0 ? (
                    <div className="mt-1 text-[10px] text-slate-600">
                      {new Date(daySessions[0].start_time).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  ) : (
                    <div className="mt-1 text-[10px] text-slate-300">-</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ) : null}
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
                    const isNext = nextSession && s.id === nextSession.id
                    return (
                      <div
                        key={s.id}
                        className={`flex items-center justify-between border-b border-slate-100 py-1 ${
                          isNext ? "text-emerald-700 font-semibold" : ""
                        }`}
                      >
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

