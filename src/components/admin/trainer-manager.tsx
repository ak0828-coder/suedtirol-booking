"use client"

import { useState, useTransition } from "react"
import { createTrainer, deleteTrainer, updateTrainer } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { useI18n } from "@/components/i18n/locale-provider"

export function TrainerManager({
  clubSlug,
  trainers,
}: {
  clubSlug: string
  trainers: any[]
}) {
  const { t } = useI18n()
  const dayLabels = [
    { day: 1, label: t("days.short.1", "Mo") },
    { day: 2, label: t("days.short.2", "Di") },
    { day: 3, label: t("days.short.3", "Mi") },
    { day: 4, label: t("days.short.4", "Do") },
    { day: 5, label: t("days.short.5", "Fr") },
    { day: 6, label: t("days.short.6", "Sa") },
    { day: 0, label: t("days.short.0", "So") },
  ]

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
        <h3 className="text-lg font-semibold text-slate-900">{t("admin_trainer.title", "Trainer")}</h3>
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
          {showForm ? t("admin_trainer.close", "Schließen") : t("admin_trainer.add", "Trainer hinzufügen")}
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
                <Label>{t("admin_trainer.first_name", "Vorname")}</Label>
                <Input name="firstName" required defaultValue={editingTrainer?.first_name || ""} />
              </div>
              <div className="space-y-2">
                <Label>{t("admin_trainer.last_name", "Nachname")}</Label>
                <Input name="lastName" required defaultValue={editingTrainer?.last_name || ""} />
              </div>
              <div className="space-y-2">
                <Label>{t("admin_trainer.email", "E-Mail")}</Label>
                <Input name="email" type="email" required defaultValue={editingTrainer?.email || ""} />
              </div>
              <div className="space-y-2">
                <Label>{t("admin_trainer.phone", "Telefon")}</Label>
                <Input name="phone" defaultValue={editingTrainer?.phone || ""} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>{t("admin_trainer.photo", "Trainer Foto")}</Label>
                <Input name="image" type="file" accept="image/*" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>{t("admin_trainer.availability", "Verfügbarkeit (Woche)")}</Label>
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
                      <span className="text-xs text-slate-500">{t("admin_trainer.to", "bis")}</span>
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
                <Label>{t("admin_trainer.hourly", "Stundensatz (EUR)")}</Label>
                <Input name="hourlyRate" type="number" step="0.01" defaultValue={editingTrainer?.hourly_rate ?? ""} />
              </div>
              <div className="space-y-2">
                <Label>{t("admin_trainer.salary_type", "Vergütungstyp")}</Label>
                <select
                  name="salaryType"
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  defaultValue={editingTrainer?.salary_type || "hourly"}
                >
                  <option value="hourly">{t("admin_trainer.salary.hourly", "Stundenlohn")}</option>
                  <option value="commission">{t("admin_trainer.salary.commission", "Provision (%)")}</option>
                  <option value="free">{t("admin_trainer.salary.free", "Ehrenamtlich (0)")}</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>{t("admin_trainer.default_rate", "Standardrate (EUR oder %)")}</Label>
                <Input name="defaultRate" type="number" step="0.01" defaultValue={editingTrainer?.default_rate ?? ""} />
              </div>
              <div className="space-y-2">
                <Label>{t("admin_trainer.payout", "Auszahlung")}</Label>
                <select
                  name="payoutMethod"
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  defaultValue={editingTrainer?.payout_method || "manual"}
                >
                  <option value="manual">{t("admin_trainer.payout_manual", "Manuell")}</option>
                  <option value="iban">{t("admin_trainer.payout_iban", "IBAN")}</option>
                  <option value="stripe_connect">{t("admin_trainer.payout_stripe", "Stripe Connect")}</option>
                  <option value="cash">{t("admin_trainer.payout_cash", "Bar")}</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>{t("admin_trainer.iban", "IBAN")}</Label>
                <Input name="iban" defaultValue={editingTrainer?.iban || ""} />
              </div>
              <div className="space-y-2">
                <Label>{t("admin_trainer.stripe_account", "Stripe Account ID")}</Label>
                <Input name="stripeAccountId" defaultValue={editingTrainer?.stripe_account_id || ""} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-600 flex items-center gap-2">
                <input type="checkbox" name="includeCourtFee" defaultChecked={editingTrainer ? !!editingTrainer.include_court_fee : true} />
                {t("admin_trainer.include_court", "Platzgebühr einrechnen")}
              </label>
              <label className="text-sm text-slate-600 flex items-center gap-2">
                <input type="checkbox" name="isActive" defaultChecked={editingTrainer ? !!editingTrainer.is_active : true} />
                {t("admin_trainer.active", "Aktiv")}
              </label>
            </div>
            {error ? <div className="text-sm text-red-600">{error}</div> : null}
            <Button type="submit" className="rounded-full">
              {editingTrainer ? t("admin_trainer.update", "Aktualisieren") : t("admin_trainer.save", "Speichern")}
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
                  {t("admin_trainer.edit", "Bearbeiten")}
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
                  {t("admin_trainer.delete", "Löschen")}
                </Button>
              </div>
            </div>
            {t.image_url ? (
              <img src={t.image_url} alt={t.first_name} className="w-full h-36 object-cover rounded-xl" />
            ) : null}
            <div className="text-sm text-slate-600">
              {t.hourly_rate ? `${t.hourly_rate} EUR/h` : t("admin_trainer.rate_fallback", "Preis nach Vereinbarung")}
            </div>
            <div className="text-xs text-slate-500">{t("admin_trainer.payout_label", "Auszahlung")}: {t.payout_method}</div>
          </Card>
        ))}
        {trainers.length === 0 ? (
          <div className="text-sm text-slate-500">{t("admin_trainer.empty", "Noch keine Trainer angelegt.")}</div>
        ) : null}
      </div>
    </div>
  )
}
