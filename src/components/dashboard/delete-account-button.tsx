"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteMyAccount } from "@/app/actions"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"

export function DeleteAccountButton({ lang }: { lang: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setLoading(true)
    try {
      const res = await deleteMyAccount()
      if (res.success) {
        toast.success("Account wurde gelöscht.")
        router.push(`/${lang}`)
      } else {
        toast.error(res.error || "Fehler beim Löschen.")
        setLoading(false)
      }
    } catch {
      toast.error("Unerwarteter Fehler.")
      setLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="rounded-full gap-2" disabled={loading}>
          <Trash2 className="w-4 h-4" />
          {loading ? "Wird gelöscht..." : "Account unwiderruflich löschen"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Account wirklich löschen?</AlertDialogTitle>
          <AlertDialogDescription>
            Diese Aktion ist unwiderruflich. Dein Account, alle Mitgliedschaften und
            persönliche Daten werden dauerhaft gelöscht. Aktive Abonnements werden sofort
            gekündigt und du erhältst keine Rückerstattung.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Ja, Account löschen
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
