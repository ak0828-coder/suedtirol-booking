"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { updateClubAiSettings } from "@/app/actions"
import { useI18n } from "@/components/i18n/locale-provider"

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
  const { t } = useI18n()

  const save = async (nextEnabled: boolean, nextMode: "buffer_30" | "ai_only") => {
    setSaving(true)
    setMessage(null)
    const res = await updateClubAiSettings(clubSlug, nextEnabled, nextMode)
    if (res?.success) {
      setEnabled(nextEnabled)
      setMode(nextMode)
      setMessage(t("admin_ai.saved", "Einstellungen gespeichert."))
    } else {
      setMessage(res?.error || t("admin_ai.error", "Speichern fehlgeschlagen."))
    }
    setSaving(false)
  }

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white/90 p-6 shadow-sm space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">{t("admin_ai.title", "KI-Prüfung")}</h3>
        <p className="text-sm text-slate-500">
          {t("admin_ai.subtitle", "Steuere, ob die KI Dokumente vorprüft und wie die Gültigkeit gesetzt wird.")}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/60 bg-white/90 px-4 py-3">
        <div>
          <div className="text-sm font-medium text-slate-800">{t("admin_ai.active_label", "KI aktiv")}</div>
          <div className="text-xs text-slate-500">{t("admin_ai.active_hint", "Wenn deaktiviert, nur manuelle Bestätigung.")}</div>
        </div>
        <Button
          variant={enabled ? "default" : "outline"}
          className="rounded-full"
          disabled={saving}
          onClick={() => save(!enabled, mode)}
        >
          {enabled ? t("admin_ai.active", "Aktiv") : t("admin_ai.inactive", "Inaktiv")}
        </Button>
      </div>

      {enabled && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/60 bg-white/90 px-4 py-3">
          <div>
            <div className="text-sm font-medium text-slate-800">{t("admin_ai.mode", "Modus")}</div>
            <div className="text-xs text-slate-500">
              {t("admin_ai.mode_hint", "30 Tage = KI-Vorprüfung + manuelle Bestätigung. Unendlich = KI-only (365 Tage).")}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={mode === "buffer_30" ? "default" : "outline"}
              className="rounded-full"
              disabled={saving}
              onClick={() => save(true, "buffer_30")}
            >
              {t("admin_ai.mode_30", "30 Tage")}
            </Button>
            <Button
              variant={mode === "ai_only" ? "default" : "outline"}
              className="rounded-full"
              disabled={saving}
              onClick={() => save(true, "ai_only")}
            >
              {t("admin_ai.mode_unlimited", "Unendlich")}
            </Button>
          </div>
        </div>
      )}

      {message && <div className="text-xs text-slate-500">{message}</div>}
    </div>
  )
}
