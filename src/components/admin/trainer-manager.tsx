"use client"

import { useState, useTransition } from "react"
import { createTrainer, deleteTrainer, updateTrainer } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"

const dayLabels = [
  { day: 1, label: "Mo" },
  { day: 2, label: "Di" },
  { day: 3, label: "Mi" },
  { day: 4, label: "Do" },
  { day: 5, label: "Fr" },
  { day: 6, label: "Sa" },
  { day: 0, label: "So" },
]

export function TrainerManager({
  clubSlug,
  trainers,
}: {
  clubSlug: string
  trainers: any[]
}) {
  const [pending, startTransition] = useTransition()
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingTrainer, setEditingTrainer] = useState<any | null>(null)
  const [formKey, setFormKey] = useState(0)
  const [availability, setAvailability] = useState(
    dayLabels.map((d) => ({ day: d.day, start: "", end: "" }))
  )

  const normalizeAvailability = (value: any[]) => {
    const base = dayLabels.map((d) => ({ day: d.day, start: "", end: "" }))
    if (!Array.isArray(value)) return base
    for (const slot of value) {
      const idx = base.findIndex((d) => d.day === Number(slot.day))
      if (idx >= 0) {
        base[idx] = {
          day: base[idx].day,
          start: String(slot.start || ""),
          end: String(slot.end || ""),
        }
      }
    }
    return base
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Trainer</h3>
        <Button
          className="rounded-full"
          onClick={() => {
            if (!showForm) {
              setEditingTrainer(null)
              setAvailability(dayLabels.map((d) => ({ day: d.day, start: "", end: "" })))
              setFormKey((k) => k + 1)
            }
            setShowForm((v) => !v)
          }}
        >
          {showForm ? "Schließen" : "Trainer hinzufuegen"}
        </Button>
      </div>

      {showForm ? (
        <Card className="p-6 space-y-4">
          <form
            key={formKey}
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              const form = e.currentTarget as HTMLFormElement
              setError(null)
              const formData = new FormData(e.currentTarget)
              startTransition(async () => {
                const res = editingTrainer ? await updateTrainer(formData) : await createTrainer(formData)
                if (res?.error) {
                  setError(res.error)
                } else {
                  setShowForm(false)
                  setEditingTrainer(null)
                  setAvailability(dayLabels.map((d) => ({ day: d.day, start: "", end: "" })))
                  setFormKey((k) => k + 1)
                  form?.reset?.()
                }
              })
            }}
          >
            <input type="hidden" name="clubSlug" value={clubSlug} />
            {editingTrainer ? <input type="hidden" name="trainerId" value={editingTrainer.id} /> : null}
            <input type="hidden" name="imageUrl" value={editingTrainer?.image_url || ""} readOnly />
            <input type="hidden" name="availability" value={JSON.stringify(availability.filter((a) => a.start && a.end))} readOnly />
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Vorname</Label>
                <Input name="firstName" required defaultValue={editingTrainer?.first_name || ""} />
              </div>
              <div className="space-y-2">
                <Label>Nachname</Label>
                <Input name="lastName" required defaultValue={editingTrainer?.last_name || ""} />
              </div>
              <div className="space-y-2">
                <Label>E-Mail</Label>
                <Input name="email" type="email" required defaultValue={editingTrainer?.email || ""} />
              </div>
              <div className="space-y-2">
                <Label>Telefon</Label>
                <Input name="phone" defaultValue={editingTrainer?.phone || ""} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Trainer Foto</Label>
                <Input name="image" type="file" accept="image/*" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Verfügbarkeit (Woche)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {dayLabels.map((d, idx) => (
                    <div key={d.day} className="flex items-center gap-2 text-sm">
                      <div className="w-8 font-semibold text-slate-600">{d.label}</div>
                      <Input
                        type="time"
                        value={availability[idx].start}
                        onChange={(e) => {
                          const next = [...availability]
                          next[idx] = { ...next[idx], start: e.target.value }
                          setAvailability(next)
                        }}
                      />
                      <span className="text-xs text-slate-500">bis</span>
                      <Input
                        type="time"
                        value={availability[idx].end}
                        onChange={(e) => {
                          const next = [...availability]
                          next[idx] = { ...next[idx], end: e.target.value }
                          setAvailability(next)
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Stundensatz (EUR)</Label>
                <Input name="hourlyRate" type="number" step="0.01" defaultValue={editingTrainer?.hourly_rate ?? ""} />
              </div>
              <div className="space-y-2">
                <Label>Verguetungstyp</Label>
                <select
                  name="salaryType"
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  defaultValue={editingTrainer?.salary_type || "hourly"}
                >
                  <option value="hourly">Stundenlohn</option>
                  <option value="commission">Provision (%)</option>
                  <option value="free">Ehrenamtlich (0)</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Standardrate (EUR oder %)</Label>
                <Input name="defaultRate" type="number" step="0.01" defaultValue={editingTrainer?.default_rate ?? ""} />
              </div>
              <div className="space-y-2">
                <Label>Auszahlung</Label>
                <select
                  name="payoutMethod"
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  defaultValue={editingTrainer?.payout_method || "manual"}
                >
                  <option value="manual">Manuell</option>
                  <option value="iban">IBAN</option>
                  <option value="stripe_connect">Stripe Connect</option>
                  <option value="cash">Bar</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>IBAN</Label>
                <Input name="iban" defaultValue={editingTrainer?.iban || ""} />
              </div>
              <div className="space-y-2">
                <Label>Stripe Account ID</Label>
                <Input name="stripeAccountId" defaultValue={editingTrainer?.stripe_account_id || ""} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-600 flex items-center gap-2">
                <input type="checkbox" name="includeCourtFee" defaultChecked={editingTrainer ? !!editingTrainer.include_court_fee : true} />
                Platzgebuehr einrechnen
              </label>
              <label className="text-sm text-slate-600 flex items-center gap-2">
                <input type="checkbox" name="isActive" defaultChecked={editingTrainer ? !!editingTrainer.is_active : true} />
                Aktiv
              </label>
            </div>
            {error ? <div className="text-sm text-red-600">{error}</div> : null}
            <Button type="submit" className="rounded-full">
              {editingTrainer ? "Aktualisieren" : "Speichern"}
            </Button>
          </form>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {trainers.map((t) => (
          <Card key={t.id} className="p-5 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="font-semibold text-slate-900">{t.first_name} {t.last_name}</div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  disabled={pending}
                  onClick={() => {
                    setEditingTrainer(t)
                    setAvailability(normalizeAvailability(t.availability))
                    setFormKey((k) => k + 1)
                    setShowForm(true)
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
                      await deleteTrainer(clubSlug, t.id)
                    })
                  }
                >
                  Löschen
                </Button>
              </div>
            </div>
            {t.image_url ? (
              <img src={t.image_url} alt={t.first_name} className="w-full h-36 object-cover rounded-xl" />
            ) : null}
            <div className="text-sm text-slate-600">
              {t.hourly_rate ? `${t.hourly_rate} EUR/h` : "Preis nach Vereinbarung"}
            </div>
            <div className="text-xs text-slate-500">Auszahlung: {t.payout_method}</div>
          </Card>
        ))}
        {trainers.length === 0 ? (
          <div className="text-sm text-slate-500">Noch keine Trainer angelegt.</div>
        ) : null}
      </div>
    </div>
  )
}

