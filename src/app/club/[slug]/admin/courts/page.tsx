import { createClient } from "@/lib/supabase/server"
import { CourtManager } from "@/components/admin/court-manager"
import { getAdminContext } from "../_lib/get-admin-context"

export const dynamic = "force-dynamic"

export default async function AdminCourtsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { club } = await getAdminContext(slug)
  const supabase = await createClient()

  const { data: courts } = await supabase
    .from("courts")
    .select("*")
    .eq("club_id", club.id)
    .order("name")

  return (
    <>
      <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm">
        <h2 className="text-2xl md:text-3xl font-semibold">Platze</h2>
        <p className="text-slate-500 text-sm">Platze anlegen, bearbeiten und organisieren.</p>
      </div>
      <CourtManager initialCourts={courts || []} clubSlug={slug} />
    </>
  )
}
