"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { updateClubAiSettings } from "@/app/actions"

type AiDocumentSettingsProps = {
  clubSlug: string
  initialEnabled: boolean
  initialMode: "buffer_30" | "ai_only"
}

export function AiDocumentSettings({ clubSlug, initialEnabled, initialMode }: AiDocumentSettingsProps) {
  const [enabled, setEnabled] = useState(initialEnabled)
  const [mode, setMode] = useState<"buffer_30" | "ai_only">(initialMode)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const save = async (nextEnabled: boolean, nextMode: "buffer_30" | "ai_only") => {
    setSaving(true)
    setMessage(null)
    const res = await updateClubAiSettings(clubSlug, nextEnabled, nextMode)
    if (res?.success) {
      setEnabled(nextEnabled)
      setMode(nextMode)
      setMessage("Einstellungen gespeichert.")
    } else {
      setMessage(res?.error || "Speichern fehlgeschlagen.")
    }
    setSaving(false)
  }

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white/90 p-6 shadow-sm space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">KI‑Prüfung</h3>
        <p className="text-sm text-slate-500">
          Steuere, ob die KI Dokumente vorprüft und wie die Gültigkeit gesetzt wird.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/60 bg-white/90 px-4 py-3">
        <div>
          <div className="text-sm font-medium text-slate-800">KI aktiv</div>
          <div className="text-xs text-slate-500">Wenn deaktiviert, nur manuelle Bestätigung.</div>
        </div>
        <Button
          variant={enabled ? "default" : "outline"}
          className="rounded-full"
          disabled={saving}
          onClick={() => save(!enabled, mode)}
        >
          {enabled ? "Aktiv" : "Inaktiv"}
        </Button>
      </div>

      {enabled && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/60 bg-white/90 px-4 py-3">
          <div>
            <div className="text-sm font-medium text-slate-800">Modus</div>
            <div className="text-xs text-slate-500">
              „30 Tage“ = KI‑Vorprüfung + manuelle Bestätigung. „Unendlich“ = KI‑Only (365 Tage).
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={mode === "buffer_30" ? "default" : "outline"}
              className="rounded-full"
              disabled={saving}
              onClick={() => save(true, "buffer_30")}
            >
              30 Tage
            </Button>
            <Button
              variant={mode === "ai_only" ? "default" : "outline"}
              className="rounded-full"
              disabled={saving}
              onClick={() => save(true, "ai_only")}
            >
              Unendlich
            </Button>
          </div>
        </div>
      )}

      {message && <div className="text-xs text-slate-500">{message}</div>}
    </div>
  )
}
