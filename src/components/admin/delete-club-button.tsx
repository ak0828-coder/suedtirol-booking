"use client"

import { deleteClub } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { useTransition } from "react"
import { useI18n } from "@/components/i18n/locale-provider"

export function DeleteClubButton({ clubId }: { clubId: string }) {
  const [pending, startTransition] = useTransition()
  const { t } = useI18n()

  return (
    <Button
      variant="destructive"
      disabled={pending}
      onClick={() => {
        if (!confirm(t("admin_delete.confirm", "ACHTUNG: Willst du diesen Verein wirklich löschen? \nAlle Daten (Buchungen, Plätze, Admin-Account) werden unwiderruflich gelöscht!"))) return
        startTransition(async () => {
          const res = await deleteClub(clubId)
          if (res?.error) {
            alert(t("admin_delete.error", "Fehler beim Löschen: ") + res.error)
          }
        })
      }}
      title={t("admin_delete.title", "Verein löschen")}
    >
      {t("admin_delete.title", "Verein löschen")}
    </Button>
  )
}
