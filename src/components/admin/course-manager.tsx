"use client"

import { useState, useTransition } from "react"
import { createCourseWithSessions, deleteCourse } from "@/app/actions"
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
}: {
  clubSlug: string
  courses: any[]
  courts: any[]
  trainers: any[]
}) {
  const [showForm, setShowForm] = useState(false)
  const [sessions, setSessions] = useState<SessionRow[]>([])
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const addSession = () => {
    setSessions((prev) => [...prev, { date: "", start: "", end: "", courtId: courts[0]?.id || "" }])
  }

  const updateSession = (idx: number, patch: Partial<SessionRow>) => {
    setSessions((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)))
  }

  const removeSession = (idx: number) => {
    setSessions((prev) => prev.filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Kurse & Camps</h3>
        <Button className="rounded-full" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Schliessen" : "Kurs anlegen"}
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
              startTransition(async () => {
                const res = await createCourseWithSessions(formData)
                if (res?.error) {
                  setError(res.error)
                } else {
                  setShowForm(false)
                  setSessions([])
                  e.currentTarget.reset()
                }
              })
            }}
          >
            <input type="hidden" name="clubSlug" value={clubSlug} />
            <input type="hidden" name="sessions" value={JSON.stringify(sessions)} readOnly />

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Titel</Label>
                <Input name="title" required />
              </div>
              <div className="space-y-2">
                <Label>Trainer</Label>
                <select name="trainerId" className="w-full border rounded-md px-3 py-2 text-sm">
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
                <Input name="price" type="number" step="0.01" />
              </div>
              <div className="space-y-2">
                <Label>Max. Teilnehmer</Label>
                <Input name="maxParticipants" type="number" defaultValue={8} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Beschreibung</Label>
                <Input name="description" />
              </div>
              <div className="space-y-2">
                <Label>Startdatum</Label>
                <Input name="startDate" type="date" />
              </div>
              <div className="space-y-2">
                <Label>Enddatum</Label>
                <Input name="endDate" type="date" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Termine</Label>
                <Button type="button" variant="outline" className="rounded-full" onClick={addSession}>
                  Termin hinzufuegen
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

            <label className="text-sm text-slate-600 flex items-center gap-2">
              <input type="checkbox" name="isPublished" defaultChecked />
              Kurs veroeffentlichen
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
                Loeschen
              </Button>
            </div>
            <div className="text-sm text-slate-600">
              {c.price ? `${c.price} EUR` : "Kostenlos"} · {c.max_participants} Teilnehmende
            </div>
            <div className="text-xs text-slate-500">
              Trainer: {c.trainers ? `${c.trainers.first_name} ${c.trainers.last_name}` : "—"}
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
