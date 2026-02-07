import { getAdminContext } from "@/app/club/[slug]/admin/_lib/get-admin-context"
import { FeatureGateToggle } from "@/components/admin/feature-gate-toggle"
import { getTrainerPayoutSummary } from "@/app/actions"
import { TrainerPayouts } from "@/components/admin/trainer-payouts"

export const dynamic = "force-dynamic"

export default async function SuperAdminFinancePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { club, features, locks } = await getAdminContext(slug)
  const rows = await getTrainerPayoutSummary(slug)

  return (
    <>
      <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold">Finanzen</h2>
            <p className="text-slate-500 text-sm">Trainer-Auszahlungen und Uebersichten.</p>
          </div>
          <FeatureGateToggle
            clubId={club.id}
            slug={slug}
            path={["admin", "finance"]}
            lockPath={["locks", "admin", "finance"]}
            label="Tab aktiv"
            enabled={features.admin.finance}
            locked={locks.admin.finance}
          />
        </div>
      </div>

      <TrainerPayouts clubSlug={slug} rows={rows} />
    </>
  )
}
