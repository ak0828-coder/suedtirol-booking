import { createClient } from "@/lib/supabase/server"
import { useAdminContext } from "@/components/admin/admin-context"
import { CourtManager } from "@/components/admin/court-manager"

export const dynamic = "force-dynamic"

export default async function AdminCourtsPage() {
  const { club, slug } = useAdminContext()
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
