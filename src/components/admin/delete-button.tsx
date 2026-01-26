"use client"

import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"
import { deleteBooking } from "@/app/actions"
import { useState } from "react"

export function DeleteBookingButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Willst du diese Buchung wirklich stornieren?")) return

    setIsDeleting(true)
    await deleteBooking(id)
    setIsDeleting(false)
  }

  return (
    <Button 
      variant="destructive" 
      size="icon"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  )
}