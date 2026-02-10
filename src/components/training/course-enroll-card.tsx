"use client"

import { useTransition, useState } from "react"
import { createCourseCheckoutSession } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { useParams } from "next/navigation"
import { useI18n } from "@/components/i18n/locale-provider"

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
  const { t } = useI18n()
  const params = useParams()
  const langRaw = params?.lang
  const lang = typeof langRaw === "string" ? langRaw : Array.isArray(langRaw) ? langRaw[0] : "de"
  const locale = lang === "it" ? "it-IT" : lang === "en" ? "en-US" : "de-DE"

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
      const start = d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })
      const end = new Date(s.end_time).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })
      keys.add(`${day}-${start}-${end}`)
    }
    if (keys.size !== 1) return ""
    const dayNames = [
      t("days.short.0", "So"),
      t("days.short.1", "Mo"),
      t("days.short.2", "Di"),
      t("days.short.3", "Mi"),
      t("days.short.4", "Do"),
      t("days.short.5", "Fr"),
      t("days.short.6", "Sa"),
    ]
    const [key] = Array.from(keys)
    const [day, start, end] = key.split("-")
    return `${t("training.course.weekly", "Wöchentlich")} ${dayNames[Number(day)]} ${start}-${end}`
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
    const dayNames = [
      t("days.short.1", "Mo"),
      t("days.short.2", "Di"),
      t("days.short.3", "Mi"),
      t("days.short.4", "Do"),
      t("days.short.5", "Fr"),
      t("days.short.6", "Sa"),
      t("days.short.0", "So"),
    ]
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
    <div id={cardId} className="rounded-3xl border border-slate-200/60 bg-white p-5 shadow-sm space-y-4">
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="text-lg font-semibold text-slate-900 tracking-tight">{course.title}</div>
          {isCourseFull ? (
            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
              {t("training.course.sold_out", "Ausgebucht")}
            </span>
          ) : null}
        </div>
        <div className="text-sm text-slate-500">{course.description || t("training.course.description_fallback", "Kursbeschreibung")}</div>
      </div>
      <div className="text-sm text-slate-600">
        {t("training.course.price", "Preis")}: {course.price ? `${course.price} EUR` : t("training.course.free", "Kostenlos")}
        {pricingMode === "per_session" ? ` ${t("training.course.per_session", "pro Termin")}` : ""}
      </div>
      {sessionSignature ? (
        <div className="text-xs text-slate-500">{sessionSignature}</div>
      ) : null}
      {nextSession ? (
        <div className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/70 px-3 py-2 text-xs">
          <div className="text-emerald-700 font-semibold">{t("training.course.next", "Nächster Termin")}</div>
          <div className="text-emerald-700">
            {new Date(nextSession.start_time).toLocaleDateString(locale)}{" "}
            {new Date(nextSession.start_time).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      ) : null}
      {displaySessions.length > 0 ? (
        <div className="text-xs text-slate-500">
          {t("training.course.upcoming", "Nächste Termine")}: {" "}
          {displaySessions.map((s: any, idx: number) => {
            const d = new Date(s.start_time)
            const dateStr = d.toLocaleDateString(locale, { day: "2-digit", month: "2-digit" })
            const start = d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })
            const end = new Date(s.end_time).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })
            return `${dateStr} ${start}-${end}${idx < displaySessions.length - 1 ? " | " : ""}`
          })}
          {sortedSessions.length > displaySessions.length
            ? ` (+${sortedSessions.length - displaySessions.length} ${t("training.course.more", "weitere")})`
            : ""}
        </div>
      ) : (
        <div className="text-xs text-slate-500">{t("training.course.upcoming_empty", "Termine folgen")}</div>
      )}
      {miniCalendar ? (
        <div className="rounded-xl border border-slate-200/60 bg-white p-3">
          <div className="text-[11px] font-semibold text-slate-500 mb-2">
            {t("training.course.calendar_week", "Kalender (Woche)")}
          </div>
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
                      {new Date(daySessions[0].start_time).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}
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
        {t("training.course.cta", "Details & anmelden")}
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-5xl rounded-3xl bg-white shadow-xl p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xl font-semibold text-slate-900">{course.title}</div>
                <div className="text-sm text-slate-500">{course.description || t("training.course.description_fallback", "Kursbeschreibung")}</div>
                {pricingMode === "per_session" ? (
                  <div className="mt-2 text-xs text-slate-500">
                    {t("training.course.selection", "Auswahl")}: {selected.length} {t("training.course.of", "von")} {sortedSessions.length} {t("training.course.sessions", "Terminen")}
                  </div>
                ) : null}
              </div>
              <button
                className="text-slate-400 hover:text-slate-600"
                onClick={() => {
                  setOpen(false)
                  setSelected([])
                }}
              >
                {t("training.course.close", "Schließen")}
              </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl border border-slate-200/60 bg-slate-50 p-3">
                    <div className="text-xs text-slate-500">{t("training.course.seats", "Plätze")}</div>
                    <div className="font-semibold text-slate-900">
                      {course.confirmed_count ?? 0}/{course.max_participants ?? "-"}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {t("training.course.seats_left", "Noch")} {Math.max(0, (course.max_participants ?? 0) - (course.confirmed_count ?? 0))} {t("training.course.seats_free", "frei")}
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200/60 bg-slate-50 p-3">
                    <div className="text-xs text-slate-500">{t("training.course.price", "Preis")}</div>
                    <div className="font-semibold text-slate-900">
                      {course.price ? `${course.price} EUR` : t("training.course.free", "Kostenlos")}
                      {pricingMode === "per_session" ? ` / ${t("training.course.session", "Termin")}` : ""}
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200/60 bg-slate-50 p-3">
                    <div className="text-xs text-slate-500">{t("training.course.lead", "Leitung")}</div>
                    <div className="font-semibold text-slate-900">
                      {course.trainer_name || t("training.course.club_fallback", "Verein")}
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200/60 bg-slate-50 p-3">
                    <div className="text-xs text-slate-500">{t("training.course.period", "Zeitraum")}</div>
                    <div className="font-semibold text-slate-900">
                      {course.start_date || "-"} {t("training.course.to", "bis")} {course.end_date || "-"}
                    </div>
                  </div>
                </div>

                {miniCalendar ? (
                  <div className="rounded-xl border border-slate-200/60 bg-white p-3">
                    <div className="text-[11px] font-semibold text-slate-500 mb-2">
                      {t("training.course.calendar_week", "Kalender (Woche)")}
                    </div>
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
                                {new Date(daySessions[0].start_time).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}
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

                <div className="space-y-2">
                  <div className="text-sm font-semibold text-slate-900">{t("training.course.all_sessions", "Alle Termine")}</div>
                  {sortedSessions.length === 0 ? (
                    <div className="text-sm text-slate-500">{t("training.course.upcoming_empty", "Termine folgen")}</div>
                  ) : (
                    <div className="max-h-48 overflow-auto space-y-1 text-sm">
                      {sortedSessions.map((s: any) => {
                        const d = new Date(s.start_time)
                        const dateStr = d.toLocaleDateString(locale)
                        const start = d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })
                        const end = new Date(s.end_time).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })
                        const court = s.courts?.name || t("training.course.court", "Platz")
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
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-slate-200/60 bg-white p-4">
                  <div className="text-sm font-semibold text-slate-900">{t("training.course.selection_title", "Deine Auswahl")}</div>
                  <div className="text-xs text-slate-500 mb-3">
                    {pricingMode === "per_session"
                      ? t("training.course.selection_hint", "Wähle die Termine, an denen du teilnehmen möchtest.")
                      : t("training.course.selection_full", "Dieser Kurs wird als Gesamtpaket gebucht.")}
                  </div>
                  {pricingMode === "per_session" ? (
                    <div className="text-xs font-semibold text-slate-700 mb-2">
                      {selected.length} {t("training.course.of", "von")} {sortedSessions.length} {t("training.course.selected", "Terminen ausgewählt")}
                    </div>
                  ) : null}

                  {pricingMode === "per_session" ? (
                    <div className="flex items-center gap-2 mb-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-full text-xs"
                        onClick={() => {
                          const selectable = sortedSessions.filter((s: any) => {
                            const max = Number(course.max_participants || 0)
                            const booked = Number(s.booked_count || 0)
                            return !max || booked < max
                          })
                          setSelected(selectable.map((s: any) => s.id))
                        }}
                      >
                        {t("training.course.select_available", "Alle freien")}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-full text-xs"
                        onClick={() => setSelected([])}
                      >
                        {t("training.course.clear_selection", "Auswahl leeren")}
                      </Button>
                    </div>
                  ) : null}

                  <div className="max-h-80 overflow-auto space-y-2">
                    {sortedSessions.map((s: any) => {
                      const d = new Date(s.start_time)
                      const dateStr = d.toLocaleDateString(locale)
                      const start = d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })
                      const end = new Date(s.end_time).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })
                      const court = s.courts?.name || t("training.course.court", "Platz")
                      const max = Number(course.max_participants || 0)
                      const booked = Number(s.booked_count || 0)
                      const remaining = max ? Math.max(0, max - booked) : null
                      const isFull = remaining === 0
                      const isSelected = selected.includes(s.id)
                      return (
                        <label
                          key={s.id}
                          className={`flex items-center justify-between gap-3 rounded-xl border p-3 text-sm ${
                            isSelected ? "border-emerald-200 bg-emerald-50/60" : "border-slate-200/60 bg-white"
                          } ${isFull && pricingMode === "per_session" ? "opacity-50" : ""}`}
                        >
                          <div>
                            <div className="font-medium text-slate-900">{dateStr}</div>
                            <div className="text-xs text-slate-500">{start}-{end} · {court}</div>
                            <div className="text-xs text-slate-500">
                              {max ? `${remaining} ${t("training.course.seats_free", "frei")}` : t("training.course.no_limit", "Keine Begrenzung")}
                            </div>
                          </div>
                          {pricingMode === "per_session" ? (
                            <input
                              type="checkbox"
                              disabled={isFull && !isSelected}
                              checked={isSelected}
                              onChange={() => {
                                setSelected((prev) =>
                                  prev.includes(s.id) ? prev.filter((id) => id !== s.id) : [...prev, s.id]
                                )
                              }}
                            />
                          ) : (
                            <div className="text-xs text-slate-500">{t("training.course.included", "Im Paket")}</div>
                          )}
                        </label>
                      )
                    })}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200/60 bg-slate-50 p-4 sticky top-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-slate-600">{t("training.course.selected_label", "ausgewählt")}</div>
                    <div className="font-semibold text-slate-900">
                      {pricingMode === "per_session"
                        ? `${selected.length} ${t("training.course.sessions_short", "Termin(e)")}`
                        : `${sortedSessions.length} ${t("training.course.sessions_label", "Termine")}`}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <div className="text-slate-600">{t("training.course.total", "Gesamt")}</div>
                    <div className="font-semibold text-slate-900">
                      {totalPrice > 0 ? `${totalPrice.toFixed(2).replace(".", ",")} EUR` : t("training.course.free", "Kostenlos")}
                    </div>
                  </div>
                  {pricingMode === "per_session" && selected.length === 0 ? (
                    <div className="text-xs text-rose-600 mt-2">{t("training.course.select_min", "Bitte mindestens einen Termin wählen.")}</div>
                  ) : null}
                </div>
              </div>
            </div>

            {error ? <div className="text-xs text-red-500">{error}</div> : null}

            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => {
                  setOpen(false)
                  setSelected([])
                }}
              >
                {t("training.course.cancel", "Abbrechen")}
              </Button>
              <Button
                className="rounded-full"
                onClick={handleEnroll}
                disabled={pending || (pricingMode === "per_session" && selected.length === 0)}
              >
                {pending
                  ? t("training.course.loading", "Weiter...")
                  : pricingMode === "per_session"
                    ? t("training.course.book_sessions", "Termine buchen")
                    : t("training.course.book_course", "Kurs buchen")}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
