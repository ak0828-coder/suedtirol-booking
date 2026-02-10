"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { resetMemberPassword, blockMember, deleteMember } from "@/app/actions"
import { toast } from "sonner"
import { Loader2, KeyRound, Ban, Trash2, CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"
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

export type AdminMemberQuickActionsProps = {
  clubSlug: string
  memberId: string
  isBlocked: boolean
  memberEmail?: string
  contractAvailable?: boolean
}

export function MemberQuickActions({
  clubSlug,
  memberId,
  isBlocked,
}: AdminMemberQuickActionsProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  const handleResetPassword = async () => {
    setLoading("reset")
    const res = await resetMemberPassword(clubSlug, memberId)
    setLoading(null)
    if (res.success) {
      toast.success("Passwort-Reset E-Mail gesendet.")
    } else {
      toast.error(res.error || "Fehler beim Senden.")
    }
  }

  const handleBlockToggle = async () => {
    setLoading("block")
    const res = await blockMember(clubSlug, memberId, !isBlocked)
    setLoading(null)
    if (res.success) {
      toast.success(isBlocked ? "Mitglied entsperrt." : "Mitglied gesperrt.")
      router.refresh()
    } else {
      toast.error(res.error || "Aktion fehlgeschlagen.")
    }
  }

  const handleDelete = async () => {
    setLoading("delete")
    const res = await deleteMember(clubSlug, memberId)
    setLoading(null)
    if (res.success) {
      toast.success("Mitglied gelöscht.")
      router.push(`/${clubSlug}/admin/members`)
    } else {
      toast.error(res.error || "Löschen fehlgeschlagen.")
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-800">Schnellaktionen</h3>
        <p className="text-xs text-slate-500">Verwalte den Zugang dieses Mitglieds.</p>
      </div>
      
      <div className="flex flex-col gap-2">
        <Button 
          variant="outline" 
          className="justify-start gap-2" 
          onClick={handleResetPassword}
          disabled={!!loading}
        >
          {loading === "reset" ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4 text-slate-500" />}
          Passwort zurücksetzen
        </Button>

        <Button 
          variant="outline" 
          className={`justify-start gap-2 ${isBlocked ? "text-green-600 hover:text-green-700 hover:bg-green-50" : "text-amber-600 hover:text-amber-700 hover:bg-amber-50"}`}
          onClick={handleBlockToggle}
          disabled={!!loading}
        >
          {loading === "block" ? <Loader2 className="h-4 w-4 animate-spin" /> : (
            isBlocked ? <CheckCircle2 className="h-4 w-4" /> : <Ban className="h-4 w-4" />
          )}
          {isBlocked ? "Entsperren" : "Sperren"}
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="ghost" 
              className="justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              disabled={!!loading}
            >
              {loading === "delete" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Mitglied löschen
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Mitglied wirklich löschen?</AlertDialogTitle>
              <AlertDialogDescription>
                Diese Aktion kann nicht rückgängig gemacht werden. Alle Daten und Buchungshistorie werden entfernt.
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
      </div>
    </div>
  )
}

export const AdminMemberQuickActions = MemberQuickActions



