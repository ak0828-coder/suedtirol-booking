import { createClient } from "@/lib/supabase/server"
import { BlockManager } from "@/components/admin/block-manager"
import { getAdminContext } from "@/app/club/[slug]/admin/_lib/get-admin-context"

export const dynamic = "force-dynamic"

export default async function SuperAdminBlocksPage({
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

  const { data: blockedPeriods } = await supabase
    .from("blocked_periods")
    .select("*")
    .eq("club_id", club.id)
    .order("start_date", { ascending: true })

  return (
    <>
      <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm">
        <h2 className="text-2xl md:text-3xl font-semibold">Sperrzeiten</h2>
        <p className="text-slate-500 text-sm">Verwaltung von Blockierungen und Wartungsfenstern.</p>
      </div>
      <BlockManager clubSlug={slug} courts={courts || []} initialBlocks={blockedPeriods || []} />
    </>
  )
}
