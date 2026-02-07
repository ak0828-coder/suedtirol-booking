import { createClient } from "@/lib/supabase/server"
import { PlanManager } from "@/components/admin/plan-manager"
import { getAdminContext } from "@/app/club/[slug]/admin/_lib/get-admin-context"
import { FeatureToggle } from "@/components/admin/feature-toggle"

export const dynamic = "force-dynamic"

export default async function SuperAdminPlansPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { club, features } = await getAdminContext(slug)
  const supabase = await createClient()

  const { data: plans } = await supabase
    .from("membership_plans")
    .select("*")
    .eq("club_id", club.id)

  return (
    <>
      <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold">Abos</h2>
            <p className="text-slate-500 text-sm">Mitgliedschaftsplane verwalten.</p>
          </div>
          <FeatureToggle
            clubId={club.id}
            slug={slug}
            path={["admin", "plans"]}
            label="Tab aktiv"
            checked={features.admin.plans}
          />
        </div>
      </div>
      <PlanManager clubSlug={slug} plans={plans || []} />
    </>
  )
}
