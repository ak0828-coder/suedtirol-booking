import { createClient } from "@/lib/supabase/server"
import { BlockManager } from "@/components/admin/block-manager"
import { getAdminContext } from "../_lib/get-admin-context"
import { notFound } from "next/navigation"
import { FeatureLockWrapper } from "@/components/admin/feature-lock-wrapper"

export const dynamic = "force-dynamic"

export default async function AdminBlocksPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { club, features, locks } = await getAdminContext(slug)
  if (!features.admin.blocks && !locks.admin.blocks) return notFound()
  const locked = !features.admin.blocks && locks.admin.blocks
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
    <FeatureLockWrapper locked={locked}>
      <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm">
        <h2 className="text-2xl md:text-3xl font-semibold">Sperrzeiten</h2>
        <p className="text-slate-500 text-sm">Verwaltung von Blockierungen und Wartungsfenstern.</p>
      </div>
      <BlockManager clubSlug={slug} courts={courts || []} initialBlocks={blockedPeriods || []} />
    </FeatureLockWrapper>
  )
}
