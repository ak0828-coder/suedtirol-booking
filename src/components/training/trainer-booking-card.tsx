"use client"

import { useState, useTransition } from "react"
import { createTrainerCheckoutSession } from "@/app/actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useI18n } from "@/components/i18n/locale-provider"

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

  const availabilityText = Array.isArray(trainer.availability) && trainer.availability.length > 0
    ? trainer.availability
        .map((slot: any) => {
          const dayMap: Record<number, string> = {
            0: t("days.short.0", "So"),
            1: t("days.short.1", "Mo"),
            2: t("days.short.2", "Di"),
            3: t("days.short.3", "Mi"),
            4: t("days.short.4", "Do"),
            5: t("days.short.5", "Fr"),
            6: t("days.short.6", "Sa"),
          }
          const label = dayMap[Number(slot.day)] || ""
          if (!label || !slot.start || !slot.end) return ""
          return `${label} ${slot.start}-${slot.end}`
        })
        .filter(Boolean)
        .join(" · ")
    : ""
  const imageUrl = trainer.image_url || trainer.imageUrl || trainer.image || ""

  const handleBooking = () => {
    if (!date || !time) {
      setError(t("trainer.booking.error_missing", "Bitte Datum und Zeit wählen."))
      setSuccess(null)
      return
    }
    setError(null)
    setSuccess(null)
    startTransition(async () => {
      const res = await createTrainerCheckoutSession(clubSlug, trainer.id, date, time, duration)
      if (res?.url) {
        window.location.href = res.url
      } else if (res?.success) {
        setSuccess(t("trainer.booking.success", "Traineranfrage gesendet. Du bekommst eine Bestätigung per E-Mail."))
        setDate("")
        setTime("")
      } else if (res?.error) {
        setError(res.error)
      }
    })
  }

  return (
    <div id={cardId} className="rounded-3xl border border-slate-200/60 bg-white p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-4">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${trainer.first_name} ${trainer.last_name}`}
            className="w-14 h-14 rounded-2xl object-cover border border-slate-200/60"
          />
        ) : (
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-600">
            {trainer.first_name?.[0]}
            {trainer.last_name?.[0]}
          </div>
        )}
        <div>
          <div className="text-lg font-semibold text-slate-900 leading-tight">
            {trainer.first_name} {trainer.last_name}
          </div>
          <div className="text-sm text-slate-500">{trainer.bio || t("trainer.card.profile", "Trainerprofil")}</div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="rounded-full w-full">{t("trainer.card.cta", "Trainer buchen")}</Button>
        </DialogTrigger>
        <DialogContent className="w-[calc(100%-1rem)] max-w-[calc(100%-1rem)] sm:max-w-[520px] bg-white text-slate-900 max-h-[92vh] overflow-y-auto overflow-x-hidden rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {t("trainer.modal.title", "Trainerstunde buchen")} – {trainer.first_name} {trainer.last_name}
            </DialogTitle>
            <DialogDescription>
              {t("trainer.modal.subtitle", "Wähle Datum, Uhrzeit und Dauer. Die Buchung wird erst nach Trainerbestätigung fix.")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {availabilityText ? (
              <div className="rounded-xl border border-slate-200/60 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                {t("trainer.modal.available", "Verfügbar:")} {availabilityText}
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="space-y-1">
                <div className="text-xs text-slate-500">{t("trainer.modal.date", "Datum")}</div>
                <input
                  type="date"
                  className="border rounded-xl px-3 py-2 w-full bg-white"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-slate-500">{t("trainer.modal.time", "Uhrzeit")}</div>
                <input
                  type="time"
                  className="border rounded-xl px-3 py-2 w-full bg-white"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-slate-500">{t("trainer.modal.duration", "Dauer (Min)")}</div>
                <input
                  type="number"
                  className="border rounded-xl px-3 py-2 w-full bg-white"
                  value={duration}
                  min={30}
                  step={30}
                  onChange={(e) => setDuration(Number(e.target.value))}
                />
              </div>
              <div className="text-xs text-slate-500 flex items-end">{t("trainer.modal.step", "Schritte à 30 Min")}</div>
            </div>

            {error ? <div className="text-xs text-red-500">{error}</div> : null}
            {success ? <div className="text-xs text-emerald-600">{success}</div> : null}

            <Button className="rounded-full w-full" onClick={handleBooking} disabled={pending}>
              {pending ? t("trainer.modal.loading", "Weiter...") : t("trainer.modal.cta", "Training buchen")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
