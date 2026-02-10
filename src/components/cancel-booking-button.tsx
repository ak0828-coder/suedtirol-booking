"use client"

import { useState } from "react"
import { cancelBooking } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Loader2, XCircle } from "lucide-react"
import { useI18n } from "@/components/i18n/locale-provider"

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const [loading, setLoading] = useState(false)
  const { t } = useI18n()

  async function handleCancel() {
    if (!confirm(t("booking.cancel.confirm", "Möchtest du diesen Termin wirklich stornieren?"))) return

    setLoading(true)
    const res = await cancelBooking(bookingId)
    setLoading(false)

    if (res.success) {
      alert(res.message)
    } else {
      alert(res.error)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-red-500 hover:text-red-700 hover:bg-red-50"
      onClick={handleCancel}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <XCircle className="w-4 h-4 mr-1" />
      )}
      {t("booking.cancel.label", "Stornieren")}
    </Button>
  )
}
