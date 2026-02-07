"use client"

import { useTransition } from "react"
import { updateClubFeaturePath } from "@/app/actions"

export function FeatureToggle({
  clubId,
  slug,
  path,
  label,
  checked,
}: {
  clubId: string
  slug: string
  path: string[]
  label: string
  checked: boolean
}) {
  const [pending, startTransition] = useTransition()

  return (
    <label className="inline-flex items-center gap-2 text-xs text-slate-600">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => {
          const formData = new FormData()
          formData.set("clubId", clubId)
          formData.set("slug", slug)
          formData.set("path", path.join("."))
          formData.set("value", e.target.checked ? "true" : "false")
          startTransition(async () => {
            await updateClubFeaturePath(formData)
          })
        }}
        disabled={pending}
      />
      {label}
    </label>
  )
}
