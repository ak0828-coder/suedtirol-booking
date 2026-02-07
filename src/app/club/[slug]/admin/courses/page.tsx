import { createClient } from "@/lib/supabase/server"
import { getAdminContext } from "../_lib/get-admin-context"
import { notFound } from "next/navigation"
import { FeatureLockWrapper } from "@/components/admin/feature-lock-wrapper"
import { CourseManager } from "@/components/admin/course-manager"

export const dynamic = "force-dynamic"

export default async function AdminCoursesPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { club, features, locks } = await getAdminContext(slug)
  if (!features.admin.courses && !locks.admin.courses) return notFound()
  const locked = !features.admin.courses && locks.admin.courses

  const supabase = await createClient()
  const { data: courses } = await supabase
    .from("courses")
    .select("*, trainers(first_name, last_name)")
    .eq("club_id", club.id)
    .order("created_at", { ascending: false })

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
    <FeatureLockWrapper locked={locked}>
      <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm mb-6">
        <h2 className="text-2xl md:text-3xl font-semibold">Kurse & Camps</h2>
        <p className="text-slate-500 text-sm">Kurse planen, Termine blockieren und Teilnehmer verwalten.</p>
      </div>
      <CourseManager clubSlug={slug} courses={courses || []} courts={courts || []} trainers={trainers || []} />
    </FeatureLockWrapper>
  )
}
