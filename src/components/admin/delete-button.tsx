"use client"

import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"
import { deleteBooking } from "@/app/actions"
import { useState } from "react"
import { useRouter } from "next/navigation"

export function DeleteBookingButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm("Willst du diese Buchung wirklich stornieren?")) return

    setIsDeleting(true)
    const res = await deleteBooking(id)
    
    if (res.success) {
        router.refresh() // WICHTIG: Seite aktualisieren
    } else {
        alert("Fehler: " + res.error)
    }
    
    setIsDeleting(false)
  }

  return (
    <Button 
      variant="destructive" 
      size="icon"
      onClick={handleDelete}
      disabled={isDeleting}
      className="h-8 w-8 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border-0"
    >
      {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  )
}