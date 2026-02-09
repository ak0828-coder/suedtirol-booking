"use client"

import { useEffect } from "react"
import { useNextStep } from "nextstepjs"
import { Button } from "@/components/ui/button"

export function TourLauncher({
  tour,
  storageKey,
  label,
  autoStart,
}: {
  tour: string
  storageKey: string
  label?: string
  autoStart?: boolean
}) {
  const { startNextStep } = useNextStep()

  useEffect(() => {
    if (!autoStart) return
    if (typeof window === "undefined") return
    const seen = window.localStorage.getItem(storageKey)
    if (!seen) {
      window.localStorage.setItem(storageKey, "1")
      const timer = window.setTimeout(() => startNextStep(tour), 400)
      return () => window.clearTimeout(timer)
    }
  }, [autoStart, storageKey, startNextStep, tour])

  return (
    <Button
      variant="outline"
      className="rounded-full"
      onClick={() => startNextStep(tour)}
    >
      {label || "Guide starten"}
    </Button>
  )
}
