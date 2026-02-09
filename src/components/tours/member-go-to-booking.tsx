"use client"

import { usePathname, useRouter } from "next/navigation"
import { useNextStep } from "nextstepjs"
import { Button } from "@/components/ui/button"

export function MemberGoToBooking() {
  const router = useRouter()
  const pathname = usePathname()
  const { startNextStep } = useNextStep()

  const handleNext = () => {
    const base = pathname.replace(/\/dashboard.*$/, "")
    const target = base
    if (typeof window !== "undefined") {
      window.localStorage.setItem("tour_member_booking_seen", "1")
    }
    router.push(target)
    setTimeout(() => startNextStep("member-booking"), 600)
  }

  return (
    <div className="mt-2">
      <Button className="rounded-full" onClick={handleNext}>
        Weiter zur Buchung
      </Button>
    </div>
  )
}
