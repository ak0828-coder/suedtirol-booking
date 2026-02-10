"use client"

import { useTransition, useState } from "react"
import { updateProfile } from "@/app/actions"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useI18n } from "@/components/i18n/locale-provider"

export function ProfileForm({ profile }: { profile: any }) {
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const { t } = useI18n()

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault()
        setMessage(null)
        const formData = new FormData(event.currentTarget)
        startTransition(async () => {
          const res = await updateProfile(formData)
          if (res?.success) {
            setMessage(t("profile.saved", "Profil aktualisiert."))
          } else {
            setMessage(res?.error || t("profile.error", "Profil konnte nicht gespeichert werden."))
          }
        })
      }}
    >
      <div className="grid gap-3">
        <div className="space-y-1">
          <Label htmlFor="first_name">{t("profile.first_name", "Vorname")}</Label>
          <Input id="first_name" name="first_name" defaultValue={profile.first_name || ""} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="last_name">{t("profile.last_name", "Nachname")}</Label>
          <Input id="last_name" name="last_name" defaultValue={profile.last_name || ""} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="phone">{t("profile.phone", "Telefonnummer (für Rückfragen)")}</Label>
          <Input id="phone" name="phone" defaultValue={profile.phone || ""} />
        </div>
      </div>

      <Button className="rounded-full" type="submit" disabled={pending}>
        {pending ? t("profile.saving", "Speichern...") : t("profile.save", "Speichern")}
      </Button>

      {message && <div className="text-xs text-slate-500">{message}</div>}
    </form>
  )
}
