import { createClient } from "@/lib/supabase/server"
import { getAdminContext } from "@/app/club/[slug]/admin/_lib/get-admin-context"
import { FeatureGateToggle } from "@/components/admin/feature-gate-toggle"
import { CourseManager } from "@/components/admin/course-manager"

export const dynamic = "force-dynamic"

export default async function SuperAdminCoursesPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { club, features, locks } = await getAdminContext(slug)
  const supabase = await createClient()

  const { data: courses } = await supabase
    .from("courses")
    .select("*, trainers(first_name, last_name)")
    .eq("club_id", club.id)
    .order("created_at", { ascending: false })

  const courseIds = (courses || []).map((c: any) => c.id)
  const { data: sessions } = courseIds.length
    ? await supabase
        .from("course_sessions")
        .select("id, course_id, court_id, start_time, end_time")
        .in("course_id", courseIds)
    : { data: [] as any[] }

  const { data: courts } = await supabase
    .from("courts")
    .select("id, name")
    .eq("club_id", club.id)
    .order("name")

  const { data: trainers } = await supabase
    .from("trainers")
    .select("id, first_name, last_name")
    .eq("club_id", club.id)
    .order("last_name")

  return (
    <>
      <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold">Kurse & Camps</h2>
            <p className="text-slate-500 text-sm">Kurse planen, Termine blockieren und Teilnehmer verwalten.</p>
          </div>
          <FeatureGateToggle
            clubId={club.id}
            slug={slug}
            path={["admin", "courses"]}
            lockPath={["locks", "admin", "courses"]}
            label="Tab aktiv"
            enabled={features.admin.courses}
            locked={locks.admin.courses}
          />
        </div>
      </div>

      <CourseManager
        clubSlug={slug}
        courses={courses || []}
        courts={courts || []}
        trainers={trainers || []}
        sessions={sessions || []}
      />
    </>
  )
}
