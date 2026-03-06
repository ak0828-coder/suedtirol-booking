import { createClient } from "@/lib/supabase/server"
import { getAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import { TrainerBookingCard } from "@/components/training/trainer-booking-card"
import { CourseGrid } from "@/components/training/course-grid"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { getDictionary } from "@/lib/dictionaries"
import { createTranslator } from "@/lib/translator"
import type { Locale } from "@/lib/i18n"

export const dynamic = "force-dynamic"

export default async function DashboardTrainingPage({
  params,
}: {
  params: Promise<{ lang: Locale; slug: string }>
}) {
  const { slug, lang } = await params
  const dict = await getDictionary(lang)
  const t = createTranslator(dict)
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${lang}/club/${slug}/login?next=/${lang}/club/${slug}/dashboard/training`)

  const adminClient = getAdminClient()
  const { data: club } = await supabase.from("clubs").select("id, name").eq("slug", slug).single()
  if (!club) redirect(`/${lang}`)

  const { data: member } = await adminClient
    .from("club_members")
    .select("id")
    .eq("user_id", user.id)
    .eq("club_id", club.id)
    .single()
  if (!member) redirect(`/${lang}/club/${slug}`)

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

  return (
    <div className="min-h-screen bg-[#f5f5f7] pb-24 safe-bottom">
      <div className="max-w-4xl mx-auto space-y-8 px-4 py-6">
        <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-5 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">{t("training.hero.title", "Training")}</h1>
          <p className="text-slate-500 text-sm mt-1">{t("training.hero.subtitle", "Trainerstunden buchen und Kurse auswählen.")}</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">{t("training.trainers.title", "Trainer")}</h2>
          {(trainers || []).length === 0 ? (
            <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-6 text-center">
              <p className="text-sm text-slate-500">{t("training.trainers.empty", "Aktuell sind keine Trainer verfügbar.")}</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {(trainers || []).map((trainer) => (
                <TrainerBookingCard key={trainer.id} clubSlug={slug} trainer={trainer} />
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">{t("training.courses.title", "Kurse & Camps")}</h2>
          {(courses || []).length === 0 ? (
            <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-6 text-center">
              <p className="text-sm text-slate-500">{t("training.courses.empty", "Aktuell sind keine Kurse veröffentlicht.")}</p>
            </div>
          ) : (
            <CourseGrid
              clubSlug={slug}
              courses={(courses || []).map((course: any) => ({
                ...course,
                confirmed_count: counts.get(course.id) || 0,
                trainer_name: course.trainers ? `${course.trainers.first_name} ${course.trainers.last_name}` : "",
                sessions: (sessionsByCourse.get(course.id) || []),
              }))}
            />
          )}
        </section>
      </div>
      <MobileBottomNav slug={slug} active="training" />
    </div>
  )
}
