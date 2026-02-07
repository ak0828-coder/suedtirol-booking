"use client"

import { useTransition } from "react"
import { updateClubFeatureGate } from "@/app/actions"

export function FeatureGateToggle({
  clubId,
  slug,
  path,
  lockPath,
  label,
  enabled,
  locked,
  lockedLabel = "Gesperrt anzeigen",
}: {
  clubId: string
  slug: string
  path: string[]
  lockPath: string[]
  label: string
  enabled: boolean
  locked: boolean
  lockedLabel?: string
}) {
  const [pending, startTransition] = useTransition()

  const apply = (nextEnabled: boolean, nextLocked: boolean) => {
    const formData = new FormData()
    formData.set("clubId", clubId)
    formData.set("slug", slug)
    formData.set("path", path.join("."))
    formData.set("value", nextEnabled ? "true" : "false")
    formData.set("lockPath", lockPath.join("."))
    formData.set("lockValue", nextLocked ? "true" : "false")
    startTransition(async () => {
      await updateClubFeatureGate(formData)
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
      <label className="inline-flex items-center gap-2">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => {
            const nextEnabled = e.target.checked
            apply(nextEnabled, nextEnabled ? false : false)
          }}
          disabled={pending}
        />
        {label}
      </label>
      {!enabled ? (
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={locked}
            onChange={(e) => apply(false, e.target.checked)}
            disabled={pending}
          />
          {lockedLabel}
        </label>
      ) : null}
    </div>
  )
}
