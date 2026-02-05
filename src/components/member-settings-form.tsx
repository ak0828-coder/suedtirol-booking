"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { updateLeaderboardOptOut } from "@/app/actions"

type MemberSettingsFormProps = {
  clubSlug: string
  initialOptOut: boolean
}

export function MemberSettingsForm({ clubSlug, initialOptOut }: MemberSettingsFormProps) {
  const [optOut, setOptOut] = useState(initialOptOut)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleToggle = async () => {
    setSaving(true)
    setMessage(null)
    const next = !optOut
    const res = await updateLeaderboardOptOut(clubSlug, next)
    if (res?.success) {
      setOptOut(next)
      setMessage(next ? "Du bist jetzt aus der Rangliste ausgeblendet." : "Du bist jetzt in der Rangliste sichtbar.")
    } else {
      setMessage(res?.error || "Fehler beim Speichern.")
    }
    setSaving(false)
  }

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white/90 p-6 shadow-sm space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Rangliste</h2>
        <p className="text-sm text-slate-500">
          Du kannst entscheiden, ob du in der Club‑Rangliste sichtbar bist.
        </p>
      </div>
      <div className="flex items-center justify-between rounded-xl border border-slate-200/60 bg-white/90 px-4 py-3">
        <div>
          <div className="text-sm font-medium text-slate-800">
            Sichtbarkeit
          </div>
          <div className="text-xs text-slate-500">
            {optOut ? "Ausgeblendet" : "Sichtbar"}
          </div>
        </div>
        <Button
          variant={optOut ? "outline" : "default"}
          onClick={handleToggle}
          disabled={saving}
          className="rounded-full"
        >
          {optOut ? "Aktivieren" : "Deaktivieren"}
        </Button>
      </div>
      {message && <div className="text-xs text-slate-500">{message}</div>}
    </div>
  )
}
