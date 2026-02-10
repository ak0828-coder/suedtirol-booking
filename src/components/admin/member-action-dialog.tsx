"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Trash, Ban, KeyRound, CheckCircle } from "lucide-react"
import { resetMemberPassword, blockMember, deleteMember } from "@/app/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface MemberActionDialogProps {
  memberId: string
  clubSlug: string
  isBlocked?: boolean
  userName: string
}

export function MemberActionDialog({ memberId, clubSlug, isBlocked, userName }: MemberActionDialogProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleResetPassword = async () => {
    setLoading(true)
    const res = await resetMemberPassword(clubSlug, memberId)
    setLoading(false)
    if (res.success) {
      toast.success(`Passwort-Reset für ${userName} gesendet`)
    } else {
      toast.error(res.error || "Fehler beim Senden")
    }
  }

  const handleBlock = async () => {
    setLoading(true)
    const res = await blockMember(clubSlug, memberId, !isBlocked)
    setLoading(false)
    if (res.success) {
      toast.success(isBlocked ? "Mitglied entsperrt" : "Mitglied gesperrt")
      router.refresh()
    } else {
      toast.error("Fehler beim Ändern des Status")
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Möchtest du ${userName} wirklich entfernen?`)) return
    
    setLoading(true)
    const res = await deleteMember(clubSlug, memberId)
    setLoading(false)
    
    if (res.success) {
      toast.success("Mitglied gelöscht")
      router.refresh()
    } else {
      toast.error("Löschen fehlgeschlagen")
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Menü öffnen</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Aktionen</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(memberId)}>
          ID kopieren
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleResetPassword} disabled={loading}>
          <KeyRound className="mr-2 h-4 w-4" /> Passwort Reset
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleBlock} disabled={loading}>
          {isBlocked ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Entsperren
            </>
          ) : (
            <>
              <Ban className="mr-2 h-4 w-4 text-amber-600" /> Sperren
            </>
          )}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleDelete} disabled={loading} className="text-red-600 focus:text-red-600">
          <Trash className="mr-2 h-4 w-4" /> Mitglied Löschen
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
