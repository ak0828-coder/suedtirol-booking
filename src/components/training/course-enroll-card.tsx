"use client"

import { useTransition, useState } from "react"
import { createCourseCheckoutSession } from "@/app/actions"
import { Button } from "@/components/ui/button"

export function CourseEnrollCard({
  clubSlug,
  course,
}: {
  clubSlug: string
  course: any
}) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleEnroll = () => {
    setError(null)
    startTransition(async () => {
      const res = await createCourseCheckoutSession(clubSlug, course.id)
      if (res?.url) {
        window.location.href = res.url
      } else if (res?.error) {
        setError(res.error)
      }
    })
  }

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-5 shadow-sm space-y-3">
      <div>
        <div className="text-lg font-semibold text-slate-900">{course.title}</div>
        <div className="text-sm text-slate-500">{course.description || "Kursbeschreibung"}</div>
      </div>
      <div className="text-sm text-slate-600">
        Preis: {course.price ? `${course.price} EUR` : "Kostenlos"}
      </div>
      {error ? <div className="text-xs text-red-500">{error}</div> : null}
      <Button className="rounded-full w-full" onClick={handleEnroll} disabled={pending}>
        {pending ? "Weiter..." : "Anmelden"}
      </Button>
    </div>
  )
}
