import { createClient } from "@/lib/supabase/server"
import { CourtManager } from "@/components/admin/court-manager"
import { getAdminContext } from "../_lib/get-admin-context"
import { notFound } from "next/navigation"
import { FeatureLockWrapper } from "@/components/admin/feature-lock-wrapper"

export const dynamic = "force-dynamic"

export default async function AdminCourtsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { club, features, locks } = await getAdminContext(slug)
  if (!features.admin.courts && !locks.admin.courts) return notFound()
  const locked = !features.admin.courts && locks.admin.courts
  const supabase = await createClient()

  const { data: courts } = await supabase
    .from("courts")
    .select("*")
    .eq("club_id", club.id)
    .order("name")

  return (
    <FeatureLockWrapper locked={locked}>
      <div className="rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-sm">
        <h2 className="text-2xl md:text-3xl font-semibold">Plätze</h2>
        <p className="text-slate-500 text-sm">Plätze anlegen, bearbeiten und organisieren.</p>
      </div>
      <CourtManager initialCourts={courts || []} clubSlug={slug} />
    </FeatureLockWrapper>
  )
}
