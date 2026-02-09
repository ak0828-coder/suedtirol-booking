import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { TrainerBookingCard } from "@/components/training/trainer-booking-card"
import { CourseGrid } from "@/components/training/course-grid"

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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 p-6">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm">
          <h1 className="text-3xl font-semibold text-slate-900">Training</h1>
          <p className="text-slate-500">Trainerstunden buchen und Kurse beitreten.</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Trainer</h2>
          {!user ? (
            <div className="text-sm text-slate-500">
              Bitte einloggen, um Trainerstunden zu buchen.
            </div>
          ) : null}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(trainers || []).map((trainer) => (
              <TrainerBookingCard key={trainer.id} clubSlug={slug} trainer={trainer} />
            ))}
            {(trainers || []).length === 0 ? (
              <div className="text-sm text-slate-500">Aktuell sind keine Trainer Verfügbar.</div>
            ) : null}
          </div>
        </section>

        <section className="space-y-4">
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

