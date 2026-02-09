"use client"

import { usePathname, useRouter } from "next/navigation"
import { useNextStep } from "nextstepjs"
import { Button } from "@/components/ui/button"

export function AdminGoToCourses() {
  const router = useRouter()
  const pathname = usePathname()
  const { startNextStep } = useNextStep()

  const handleNext = () => {
    const base = pathname.replace(/\/admin.*$/, "/admin")
    const target = `${base}/courses`
    if (typeof window !== "undefined") {
      window.localStorage.setItem("tour_admin_courses_seen", "1")
    }
    router.push(target)
    setTimeout(() => startNextStep("admin-courses"), 600)
  }

  return (
    <div className="mt-2">
      <Button className="rounded-full" onClick={handleNext}>
        Weiter zu Kurse
      </Button>
    </div>
  )
}
