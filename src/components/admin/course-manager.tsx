"use client"

import { useState, useTransition } from "react"
import { createCourseWithSessions, deleteCourse, updateCourseWithSessions, updateCourseParticipantStatus, exportCourseParticipantsCsv } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"

type SessionRow = { date: string; start: string; end: string; courtId: string }

export function CourseManager({
  clubSlug,
  courses,
  courts,
  trainers,
  sessions: sessionRows,
  participants,
}: {
  clubSlug: string
  courses: any[]
  courts: any[]
  trainers: any[]
  sessions: any[]
  participants: any[]
}) {
  const [showForm, setShowForm] = useState(false)
  const [sessions, setSessions] = useState<SessionRow[]>([])
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formValues, setFormValues] = useState({
    title: "",
    trainerId: "",
    price: "",
    pricingMode: "full_course",
    maxParticipants: "8",
    description: "",
    startDate: "",
    endDate: "",
    isPublished: true,
  })
  const [recurrence, setRecurrence] = useState({
    enabled: false,
    startDate: "",
    weeks: "10",
    weekday: "1",
    start: "18:00",
    end: "19:00",
    courtId: courts[0]?.id || "",
  })

  const courseSessions = (courseId: string) =>
    (sessionRows || [])
      .filter((s: any) => s.course_id === courseId)
      .map((s: any) => {
        const start = new Date(s.start_time)
        const end = new Date(s.end_time)
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null
        const pad = (n: number) => String(n).padStart(2, "0")
        return {
          date: start.toISOString().slice(0, 10),
          start: `${pad(start.getHours())}:${pad(start.getMinutes())}`,
          end: `${pad(end.getHours())}:${pad(end.getMinutes())}`,
          courtId: s.court_id || courts[0]?.id || "",
        } as SessionRow
      })
      .filter(Boolean) as SessionRow[]

  const isValidDate = (value: string) => {
    if (!value) return false
    const d = new Date(`${value}T00:00:00`)
    return !Number.isNaN(d.getTime())
  }

  const isSessionComplete = (s: SessionRow) =>
    !!s.date && isValidDate(s.date) && !!s.start && !!s.end && !!s.courtId

  const validSessions = sessions.filter(isSessionComplete)
  const hasIncompleteSessions = sessions.length > 0 && validSessions.length !== sessions.length

  const addSession = () => {
    setSessions((prev) => [...prev, { date: "", start: "", end: "", courtId: courts[0]?.id || "" }])
  }

  const updateSession = (idx: number, patch: Partial<SessionRow>) => {
    setSessions((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)))
  }

  const removeSession = (idx: number) => {
    setSessions((prev) => prev.filter((_, i) => i !== idx))
  }

  const generateWeeklySessions = () => {
    if (!recurrence.startDate || !isValidDate(recurrence.startDate)) {
      setError("Bitte ein gültiges Startdatum wählen.")
      return
    }
    const startDate = new Date(recurrence.startDate)
    const weeks = Math.max(1, Number(recurrence.weeks || 1))
    const weekday = Number(recurrence.weekday)
    const base = new Date(startDate)
    const dayDiff = (weekday + 7 - base.getDay()) % 7
    base.setDate(base.getDate() + dayDiff)

    const generated: SessionRow[] = []
    for (let i = 0; i < weeks; i++) {
      const d = new Date(base)
      d.setDate(base.getDate() + i * 7)
      const dateStr = d.toISOString().slice(0, 10)
      generated.push({
        date: dateStr,
        start: recurrence.start,
        end: recurrence.end,
        courtId: recurrence.courtId || courts[0]?.id || "",
      })
    }
    setSessions(generated)
  }

  const statusLabels: Record<string, string> = {
    confirmed: "Bestätigt",
    cancelled: "Storniert",
    waitlist: "Warteliste",
  }

  const toDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00")
    return d
  }

  const getWeekStart = (dateStr: string) => {
    const d = toDate(dateStr)
    const day = d.getDay()
    const diff = (day + 6) % 7
    d.setDate(d.getDate() - diff)
    return d
  }

  const dayNames = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 id="tour-courses-header" className="text-lg font-semibold text-slate-900">Kurse & Camps</h3>
        <Button id="tour-courses-create" className="rounded-full" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Schließen" : "Kurs anlegen"}
        </Button>
      </div>

      {showForm ? (
        <Card className="p-6 space-y-4">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              setError(null)
              const formData = new FormData(e.currentTarget)
              if (editingId) formData.set("courseId", editingId)
              if (hasIncompleteSessions) {
                setError("Bitte alle Termine mit Datum, Uhrzeit und Platz vollständig ausfüllen.")
                return
              }
              startTransition(async () => {
                const res = editingId
                  ? await updateCourseWithSessions(formData)
                  : await createCourseWithSessions(formData)
                if (res?.error) {
                  setError(res.error)
                } else {
                  setShowForm(false)
                  setSessions([])
                  setEditingId(null)
                  e.currentTarget.reset()
                }
              })
            }}
          >
            <input type="hidden" name="clubSlug" value={clubSlug} />
            <input type="hidden" name="sessions" value={JSON.stringify(validSessions)} readOnly />

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Titel</Label>
                <Input
                  name="title"
                  required
                  value={formValues.title}
                  onChange={(e) => setFormValues((v) => ({ ...v, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Trainer</Label>
                <select
                  name="trainerId"
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  value={formValues.trainerId}
                  onChange={(e) => setFormValues((v) => ({ ...v, trainerId: e.target.value }))}
                >
                  <option value="">Ohne Trainer</option>
                  {trainers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.first_name} {t.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Preis (EUR)</Label>
                <Input
                  name="price"
                  type="number"
                  step="0.01"
                  value={formValues.price}
                  onChange={(e) => setFormValues((v) => ({ ...v, price: e.target.value }))}
                />
                <div className="text-xs text-slate-500">
                  {formValues.pricingMode === "per_session"
                    ? "Preis pro Termin (Mehrfach-Auswahl multipliziert den Preis)"
                    : "Preis für den gesamten Kurs"}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Abrechnung</Label>
                <select
                  name="pricingMode"
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  value={formValues.pricingMode}
                  onChange={(e) => setFormValues((v) => ({ ...v, pricingMode: e.target.value }))}
                >
                  <option value="full_course">Gesamter Kurs (alle Termine)</option>
                  <option value="per_session">Einzeltermine (Auswahl & pro Termin)</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Max. Teilnehmer</Label>
                <Input
                  name="maxParticipants"
                  type="number"
                  value={formValues.maxParticipants}
                  onChange={(e) => setFormValues((v) => ({ ...v, maxParticipants: e.target.value }))}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Beschreibung</Label>
                <Input
                  name="description"
                  value={formValues.description}
                  onChange={(e) => setFormValues((v) => ({ ...v, description: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Startdatum</Label>
                <Input
                  name="startDate"
                  type="date"
                  value={formValues.startDate}
                  onChange={(e) => setFormValues((v) => ({ ...v, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Enddatum</Label>
                <Input
                  name="endDate"
                  type="date"
                  value={formValues.endDate}
                  onChange={(e) => setFormValues((v) => ({ ...v, endDate: e.target.value }))}
                />
              </div>
            </div>

            <div id="tour-courses-sessions" className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Termine</Label>
                <Button type="button" variant="outline" className="rounded-full" onClick={addSession}>
                  Termin hinzufuegen
                </Button>
              </div>
              <div id="tour-courses-series" className="rounded-xl border border-slate-200/60 bg-slate-50 p-3">
                <div className="text-xs font-semibold text-slate-600 mb-2">Serien-Termine</div>
                <div className="grid md:grid-cols-6 gap-2">
                  <Input
                    type="date"
                    value={recurrence.startDate}
                    onChange={(e) => setRecurrence((r) => ({ ...r, startDate: e.target.value }))}
                  />
                  <Input
                    type="number"
                    value={recurrence.weeks}
                    onChange={(e) => setRecurrence((r) => ({ ...r, weeks: e.target.value }))}
                    placeholder="Wochen"
                  />
                  <select
                    className="border rounded-md px-3 py-2 text-sm"
                    value={recurrence.weekday}
                    onChange={(e) => setRecurrence((r) => ({ ...r, weekday: e.target.value }))}
                  >
                    <option value="1">Montag</option>
                    <option value="2">Dienstag</option>
                    <option value="3">Mittwoch</option>
                    <option value="4">Donnerstag</option>
                    <option value="5">Freitag</option>
                    <option value="6">Samstag</option>
                    <option value="0">Sonntag</option>
                  </select>
                  <Input
                    type="time"
                    value={recurrence.start}
                    onChange={(e) => setRecurrence((r) => ({ ...r, start: e.target.value }))}
                  />
                  <Input
                    type="time"
                    value={recurrence.end}
                    onChange={(e) => setRecurrence((r) => ({ ...r, end: e.target.value }))}
                  />
                  <select
                    className="border rounded-md px-3 py-2 text-sm"
                    value={recurrence.courtId}
                    onChange={(e) => setRecurrence((r) => ({ ...r, courtId: e.target.value }))}
                  >
                    {courts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Button type="button" variant="outline" className="rounded-full mt-3" onClick={generateWeeklySessions}>
                  Serien-Termine erzeugen
                </Button>
              </div>
              <div className="space-y-3">
                {sessions.map((s, idx) => (
                  <div key={idx} className="grid md:grid-cols-5 gap-2">
                    <Input type="date" value={s.date} onChange={(e) => updateSession(idx, { date: e.target.value })} />
                    <Input type="time" value={s.start} onChange={(e) => updateSession(idx, { start: e.target.value })} />
                    <Input type="time" value={s.end} onChange={(e) => updateSession(idx, { end: e.target.value })} />
                    <select
                      className="border rounded-md px-3 py-2 text-sm"
                      value={s.courtId}
                      onChange={(e) => updateSession(idx, { courtId: e.target.value })}
                    >
                      {courts.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <Button type="button" variant="outline" onClick={() => removeSession(idx)}>
                      Entfernen
                    </Button>
                  </div>
                ))}
                {sessions.length === 0 ? (
                  <div className="text-sm text-slate-500">Noch keine Termine hinzugefuegt.</div>
                ) : null}
              </div>
            </div>

            {validSessions.length > 0 ? (
              <div id="tour-courses-preview" className="rounded-xl border border-slate-200/60 bg-white p-3">
                <div className="text-xs font-semibold text-slate-600 mb-2">Kalender-Vorschau</div>
                <div className="grid grid-cols-7 gap-2 text-[11px]">
                  {dayNames.map((d) => (
                    <div key={d} className="text-center font-semibold text-slate-500">{d}</div>
                  ))}
                  {(() => {
                    const sorted = validSessions
                      .slice()
                      .sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start))
                    const weekStart = getWeekStart(sorted[0].date)
                    return Array.from({ length: 7 }).map((_, idx) => {
                      const d = new Date(weekStart)
                      d.setDate(weekStart.getDate() + idx)
                      const dateStr = d.toISOString().slice(0, 10)
                      const daySessions = sorted.filter((s) => s.date === dateStr)
                      return (
                        <div key={dateStr} className="rounded-lg border border-slate-200/60 bg-slate-50 p-2 min-h-[72px]">
                          <div className="text-[10px] text-slate-500 mb-1">{dateStr.slice(5)}</div>
                          <div className="space-y-1">
                            {daySessions.slice(0, 3).map((s, idx2) => (
                              <div key={idx2} className="rounded bg-white px-1 py-0.5 text-[10px] text-slate-600">
                                {s.start}-{s.end}
                              </div>
                            ))}
                            {daySessions.length > 3 ? (
                              <div className="text-[10px] text-slate-400">+{daySessions.length - 3} mehr</div>
                            ) : null}
                          </div>
                        </div>
                      )
                    })
                  })()}
                </div>
                <div className="max-h-48 overflow-auto space-y-1 text-sm mt-3">
                  {validSessions
                    .slice()
                    .sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start))
                    .map((s, idx) => (
                      <div key={idx} className="flex items-center justify-between border-b border-slate-100 py-1">
                        <div>{s.date}</div>
                        <div className="text-slate-500">
                          {s.start} - {s.end}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ) : null}

            {hasIncompleteSessions ? (
              <div className="text-xs text-rose-600">
                Bitte alle Termine vollständig ausfüllen, sonst werden sie nicht gespeichert.
              </div>
            ) : null}
            <label className="text-sm text-slate-600 flex items-center gap-2">
              <input
                type="checkbox"
                name="isPublished"
                checked={formValues.isPublished}
                onChange={(e) => setFormValues((v) => ({ ...v, isPublished: e.target.checked }))}
              />
              Kurs veröffentlichen
            </label>

            {error ? <div className="text-sm text-red-600">{error}</div> : null}
            <Button type="submit" className="rounded-full">Speichern</Button>
          </form>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {courses.map((c) => (
          <Card key={c.id} className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-slate-900">{c.title}</div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => {
                    setEditingId(c.id)
                    setShowForm(true)
                    setError(null)
                    setFormValues({
                      title: c.title || "",
                      trainerId: c.trainer_id || "",
                      price: String(c.price ?? ""),
                      pricingMode: c.pricing_mode || "full_course",
                      maxParticipants: String(c.max_participants ?? 8),
                      description: c.description || "",
                      startDate: c.start_date || "",
                      endDate: c.end_date || "",
                      isPublished: !!c.is_published,
                    })
                    setSessions(courseSessions(c.id))
                  }}
                >
                  Bearbeiten
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      await deleteCourse(clubSlug, c.id)
                    })
                  }
                >
                  Löschen
                </Button>
              </div>
            </div>
            <div className="text-sm text-slate-600">
              {c.price ? `${c.price} EUR` : "Kostenlos"} Â· {c.max_participants} Teilnehmende
            </div>
            <div className="text-xs text-slate-500">
              Trainer: {c.trainers ? `${c.trainers.first_name} ${c.trainers.last_name}` : "â€”"}
            </div>

            <div className="rounded-xl border border-slate-200/60 bg-slate-50 p-3 space-y-2">
              <div className="text-xs font-semibold text-slate-600">Termine</div>
              <div className="text-xs text-slate-500">
                {courseSessions(c.id).length} Termine
              </div>
            </div>

            <div className="rounded-xl border border-slate-200/60 bg-slate-50 p-3 space-y-2">
              <div className="text-xs font-semibold text-slate-600">Teilnehmer</div>
              {(() => {
                const list = (participants || []).filter((p: any) => p.course_id === c.id)
                const capacity = Number(c.max_participants || 0)
                const confirmed = list.filter((p: any) => p.status === "confirmed").length
                const percent = capacity > 0 ? Math.min(100, Math.round((confirmed / capacity) * 100)) : 0
                return (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{confirmed}/{capacity} belegt</span>
                      <span>{percent}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white border border-slate-200/60 overflow-hidden">
                      <div className="h-full bg-slate-900/80" style={{ width: `${percent}%` }} />
                    </div>
                    <div className="flex items-center justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full text-[11px]"
                        onClick={() =>
                          startTransition(async () => {
                            const res = await exportCourseParticipantsCsv(c.id)
                            if (res?.success && res.csv) {
                              const blob = new Blob([res.csv], { type: "text/csv;charset=utf-8;" })
                              const url = URL.createObjectURL(blob)
                              const link = document.createElement("a")
                              link.href = url
                              link.download = res.filename || "kurs-teilnehmer.csv"
                              link.click()
                              URL.revokeObjectURL(url)
                            }
                          })
                        }
                      >
                        CSV Export
                      </Button>
                    </div>
                  </div>
                )
              })()}
              <div className="space-y-2">
                {(participants || [])
                  .filter((p: any) => p.course_id === c.id)
                  .map((p: any) => {
                    const profile = Array.isArray(p.profiles) ? p.profiles[0] : p.profiles
                    return (
                      <div key={p.id} className="flex items-center justify-between text-xs">
                        <div>
                          {profile?.first_name || "Mitglied"} {profile?.last_name || ""}
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            className="border rounded-md px-2 py-1 text-xs"
                            value={p.status}
                            onChange={(e) =>
                              startTransition(async () => {
                                await updateCourseParticipantStatus(c.id, p.id, e.target.value as any)
                              })
                            }
                          >
                            {Object.keys(statusLabels).map((k) => (
                              <option key={k} value={k}>
                                {statusLabels[k]}
                              </option>
                            ))}
                          </select>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                            onClick={() =>
                              startTransition(async () => {
                                await updateCourseParticipantStatus(c.id, p.id, "cancelled")
                              })
                            }
                          >
                            Entfernen
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                {(participants || []).filter((p: any) => p.course_id === c.id).length === 0 ? (
                  <div className="text-xs text-slate-500">Noch keine Teilnehmer.</div>
                ) : null}
              </div>
            </div>
          </Card>
        ))}
        {courses.length === 0 ? (
          <div className="text-sm text-slate-500">Noch keine Kurse angelegt.</div>
        ) : null}
      </div>
    </div>
  )
}

