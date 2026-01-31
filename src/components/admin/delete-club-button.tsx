"use client"

import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"
import { deleteClub } from "@/app/actions"
import { useState } from "react"
import { useRouter } from "next/navigation"

export function DeleteClubButton({ clubId }: { clubId: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    // Sicherheitsabfrage (Best Practice)
    if (!confirm("ACHTUNG: Willst du diesen Verein wirklich löschen? \nAlle Daten (Buchungen, Plätze, Admin-Account) werden unwiderruflich gelöscht!")) return

    setIsDeleting(true)
    
    // Server Action aufrufen
    const res = await deleteClub(clubId)
    
    if (res.success) {
        // Liste aktualisieren
        router.refresh()
    } else {
        alert("Fehler beim Löschen: " + res.error)
    }
    
    setIsDeleting(false)
  }

  return (
    <Button 
      variant="ghost" 
      size="icon"
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-slate-400 hover:text-red-600 hover:bg-red-50"
      title="Verein löschen"
    >
      {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  )
}