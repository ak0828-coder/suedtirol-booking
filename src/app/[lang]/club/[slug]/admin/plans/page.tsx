import { createClient } from "@/lib/supabase/server"
import { PlanManager } from "@/components/admin/plan-manager"
import { getAdminContext } from "../_lib/get-admin-context"
import { notFound } from "next/navigation"
import { FeatureLockWrapper } from "@/components/admin/feature-lock-wrapper"

export const dynamic = "force-dynamic"

export default async function AdminPlansPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { club, features, locks } = await getAdminContext(slug)
  if (!features.admin.plans && !locks.admin.plans) return notFound()
  const locked = !features.admin.plans && locks.admin.plans
  const supabase = await createClient()

  const { data: plans } = await supabase
    .from("membership_plans")
    .select("*")
    .eq("club_id", club.id)

  return (
    <FeatureLockWrapper locked={locked}>
      <div className="rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-sm">
        <h2 className="text-2xl md:text-3xl font-semibold">Abos</h2>
        <p className="text-slate-500 text-sm">Mitgliedschaftspläne verwalten.</p>
      </div>
      <PlanManager clubSlug={slug} initialPlans={plans || []} />
    </FeatureLockWrapper>
  )
}
