import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { TrainerBookingCard } from "@/components/training/trainer-booking-card"
import { CourseGrid } from "@/components/training/course-grid"
import { TourLauncher } from "@/components/tours/tour-launcher"
import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function TrainingPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: club } = await supabase
    .from("clubs")
    .select("id, name")
    .eq("slug", slug)
    .single()
  if (!club) return notFound()

  const { data: trainers } = await supabase
    .from("trainers")
    .select("id, first_name, last_name, bio, hourly_rate, image_url, availability")
    .eq("club_id", club.id)
    .eq("is_active", true)
    .order("last_name")

  const { data: courses } = await supabase
    .from("courses")
    .select("id, title, description, price, pricing_mode, is_published, max_participants, start_date, end_date, trainers(first_name, last_name)")
    .eq("club_id", club.id)
    .eq("is_published", true)
    .order("created_at", { ascending: false })

  const courseIds = (courses || []).map((c: any) => c.id)
  const { data: sessions } = courseIds.length
    ? await supabase
        .from("course_sessions")
        .select("id, course_id, start_time, end_time, courts(name)")
        .in("course_id", courseIds)
        .order("start_time", { ascending: true })
    : { data: [] as any[] }

  const sessionIds = (sessions || []).map((s: any) => s.id)
  const { data: sessionParticipants } = sessionIds.length
    ? await supabase
        .from("course_session_participants")
        .select("course_session_id, status, payment_status")
        .in("course_session_id", sessionIds)
    : { data: [] as any[] }

  const { data: participants } = courseIds.length
    ? await supabase
        .from("course_participants")
        .select("course_id, status")
        .in("course_id", courseIds)
    : { data: [] as any[] }

  const counts = new Map<string, number>()
  for (const p of participants || []) {
    if (p.status !== "confirmed") continue
    counts.set(p.course_id, (counts.get(p.course_id) || 0) + 1)
  }

  const sessionsByCourse = new Map<string, any[]>()
  for (const s of sessions || []) {
    const list = sessionsByCourse.get(s.course_id) || []
    list.push(s)
    sessionsByCourse.set(s.course_id, list)
  }

  const bookedBySession = new Map<string, number>()
  for (const b of sessionParticipants || []) {
    if (b.status === "cancelled") continue
    const key = b.course_session_id
    if (!key) continue
    bookedBySession.set(key, (bookedBySession.get(key) || 0) + 1)
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <div className="mx-auto max-w-6xl px-6 py-10 space-y-10">
        <div
          id="tour-training-header"
          className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-sm flex flex-wrap items-center justify-between gap-3"
        >
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Training</h1>
            <p className="text-slate-500">Trainerstunden buchen und Kurse auswählen.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/club/${slug}`}>
              <Button variant="outline" className="rounded-full">Zur Startseite</Button>
            </Link>
            <Suspense fallback={null}>
              <TourLauncher tour="training" storageKey="tour_training_seen" label="Guide" autoStart />
            </Suspense>
          </div>
        </div>

        <section id="tour-training-trainers" className="space-y-4">
          <div className="flex items-end justify-between gap-3">
            <h2 className="text-xl font-semibold text-slate-900">Trainer</h2>
            {!user ? (
              <div className="text-xs text-slate-500">Login nötig, um zu buchen.</div>
            ) : null}
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(trainers || []).map((trainer, idx) => (
              <TrainerBookingCard
                key={trainer.id}
                clubSlug={slug}
                trainer={trainer}
                cardId={idx === 0 ? "tour-training-trainer-card" : undefined}
              />
            ))}
            {(trainers || []).length === 0 ? (
              <div className="text-sm text-slate-500">Aktuell sind keine Trainer verfügbar.</div>
            ) : null}
          </div>
        </section>

        <section id="tour-training-courses" className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Kurse & Camps</h2>
          {(courses || []).length === 0 ? (
            <div className="text-sm text-slate-500">Aktuell sind keine Kurse veröffentlicht.</div>
          ) : (
            <CourseGrid
              clubSlug={slug}
              courses={(courses || []).map((course: any) => ({
                ...course,
                confirmed_count: counts.get(course.id) || 0,
                trainer_name: course.trainers ? `${course.trainers.first_name} ${course.trainers.last_name}` : "",
                sessions: (sessionsByCourse.get(course.id) || []).map((s: any) => ({
                  ...s,
                  booked_count: bookedBySession.get(s.id) || 0,
                })),
              }))}
            />
          )}
        </section>
      </div>
    </div>
  )
}

