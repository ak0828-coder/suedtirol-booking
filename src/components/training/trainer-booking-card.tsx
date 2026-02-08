"use client"

import { useState, useTransition } from "react"
import { createTrainerCheckoutSession } from "@/app/actions"
import { Button } from "@/components/ui/button"

export function TrainerBookingCard({
  clubSlug,
  trainer,
}: {
  clubSlug: string
  trainer: any
}) {
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [duration, setDuration] = useState(60)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const availabilityText = Array.isArray(trainer.availability) && trainer.availability.length > 0
    ? trainer.availability
        .map((slot: any) => {
          const dayMap: Record<number, string> = {
            0: "So",
            1: "Mo",
            2: "Di",
            3: "Mi",
            4: "Do",
            5: "Fr",
            6: "Sa",
          }
          const label = dayMap[Number(slot.day)] || ""
          if (!label || !slot.start || !slot.end) return ""
          return `${label} ${slot.start}-${slot.end}`
        })
        .filter(Boolean)
        .join(" | ")
    : ""

  const handleBooking = () => {
    if (!date || !time) {
      setError("Bitte Datum und Zeit waehlen.")
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
        setSuccess("Traineranfrage gesendet. Du bekommst eine Bestaetigung per E-Mail.")
        setDate("")
        setTime("")
      } else if (res?.error) {
        setError(res.error)
      }
    })
  }

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-5 shadow-sm space-y-3">
      <div>
        <div className="flex items-center gap-3">
          {trainer.image_url ? (
            <img
              src={trainer.image_url}
              alt={`${trainer.first_name} ${trainer.last_name}`}
              className="w-12 h-12 rounded-xl object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-600">
              {trainer.first_name?.[0]}
              {trainer.last_name?.[0]}
            </div>
          )}
          <div>
            <div className="text-lg font-semibold text-slate-900">
              {trainer.first_name} {trainer.last_name}
            </div>
            <div className="text-sm text-slate-500">{trainer.bio || "Trainerprofil"}</div>
          </div>
        </div>
        {availabilityText ? (
          <div className="text-xs text-slate-500 mt-2">Verfuegbar: {availabilityText}</div>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <input
          type="date"
          className="border rounded-md px-2 py-1"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <input
          type="time"
          className="border rounded-md px-2 py-1"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
        <input
          type="number"
          className="border rounded-md px-2 py-1"
          value={duration}
          min={30}
          step={30}
          onChange={(e) => setDuration(Number(e.target.value))}
        />
        <div className="text-xs text-slate-500 flex items-center">Minuten</div>
      </div>

      {error ? <div className="text-xs text-red-500">{error}</div> : null}
      {success ? <div className="text-xs text-emerald-600">{success}</div> : null}

      <Button className="rounded-full w-full" onClick={handleBooking} disabled={pending}>
        {pending ? "Weiter..." : "Trainer buchen"}
      </Button>
    </div>
  )
}

