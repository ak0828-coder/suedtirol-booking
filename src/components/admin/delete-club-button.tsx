"use client"

import { deleteClub } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { useState, useTransition } from "react"
import { useI18n } from "@/components/i18n/locale-provider"
import { toast } from "sonner"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function DeleteClubButton({ clubId }: { clubId: string }) {
  const [pending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const { t } = useI18n()

  const handleDelete = () => {
    setOpen(false)
    startTransition(async () => {
      const res = await deleteClub(clubId)
      if (res?.error) {
        toast.error(t("admin_delete.error", "Fehler beim Löschen: ") + res.error)
      }
    })
  }

  return (
    <>
      <Button
        variant="destructive"
        disabled={pending}
        onClick={() => setOpen(true)}
        title={t("admin_delete.title", "Verein löschen")}
      >
        {t("admin_delete.title", "Verein löschen")}
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ACHTUNG: Verein löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Alle Daten (Buchungen, Plätze, Admin-Account) werden unwiderruflich gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Endgültig löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
