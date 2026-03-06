"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { updateLeaderboardOptOut } from "@/app/actions"
import { useI18n } from "@/components/i18n/locale-provider"

type MemberSettingsFormProps = {
  clubSlug: string
  initialOptOut: boolean
}

export function MemberSettingsForm({ clubSlug, initialOptOut }: MemberSettingsFormProps) {
  const [optOut, setOptOut] = useState(initialOptOut)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const { t } = useI18n()

  const handleToggle = async () => {
    setSaving(true)
    setMessage(null)
    const next = !optOut
    const res = await updateLeaderboardOptOut(clubSlug, next)
    if (res?.success) {
      setOptOut(next)
      setMessage(next
        ? t("member_settings.opt_out_on", "Du bist jetzt aus der Rangliste ausgeblendet.")
        : t("member_settings.opt_out_off", "Du bist jetzt in der Rangliste sichtbar.")
      )
    } else {
      setMessage(res?.error || t("member_settings.save_error", "Fehler beim Speichern."))
    }
    setSaving(false)
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        {t("member_settings.leaderboard_desc", "Du kannst entscheiden, ob du in der Club-Rangliste sichtbar bist.")}
      </p>
      <div className="flex items-center justify-between rounded-xl border border-slate-200/60 bg-slate-50/80 px-4 py-3">
        <div>
          <div className="text-sm font-medium text-slate-800">
            {t("member_settings.visibility", "Sichtbarkeit")}
          </div>
          <div className="text-xs text-slate-500">
            {optOut
              ? t("member_settings.hidden", "Ausgeblendet")
              : t("member_settings.visible", "Sichtbar")}
          </div>
        </div>
        <Button
          variant={optOut ? "outline" : "default"}
          onClick={handleToggle}
          disabled={saving}
          className="rounded-full"
        >
          {optOut
            ? t("member_settings.activate", "Aktivieren")
            : t("member_settings.deactivate", "Deaktivieren")}
        </Button>
      </div>
      {message && <div className="text-xs text-slate-500">{message}</div>}
    </div>
  )
}
