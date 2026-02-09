"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { useNextStep } from "nextstepjs"
import { Button } from "@/components/ui/button"

export function AdminTourButton() {
  const pathname = usePathname()
  const { startNextStep } = useNextStep()

  const isOverview = pathname.endsWith("/admin")
  const isCourses = pathname.includes("/admin/courses")
  const tour = isCourses ? "admin-courses" : "admin-overview"
  const storageKey = isCourses ? "tour_admin_courses_seen" : "tour_admin_overview_seen"
  const autoStart = isOverview || isCourses

  if (!autoStart) return null

  useEffect(() => {
    if (!autoStart) return
    if (typeof window === "undefined") return
    const seen = window.localStorage.getItem(storageKey)
    if (!seen) {
      window.localStorage.setItem(storageKey, "1")
      const timer = window.setTimeout(() => startNextStep(tour), 400)
      return () => window.clearTimeout(timer)
    }
  }, [autoStart, startNextStep, storageKey, tour])

  return (
    <Button variant="outline" className="rounded-full" onClick={() => startNextStep(tour)}>
      Guide
    </Button>
  )
}
