import { getAdminContext } from "../_lib/get-admin-context"
import { notFound } from "next/navigation"
import { FeatureLockWrapper } from "@/components/admin/feature-lock-wrapper"
import { getTrainerPayoutSummary } from "@/app/actions"
import { TrainerPayouts } from "@/components/admin/trainer-payouts"

export const dynamic = "force-dynamic"

export default async function AdminFinancePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { features, locks } = await getAdminContext(slug)
  if (!features.admin.finance && !locks.admin.finance) return notFound()
  const locked = !features.admin.finance && locks.admin.finance

  const rows = await getTrainerPayoutSummary(slug)

  return (
    <FeatureLockWrapper locked={locked}>
      <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm mb-6">
        <h2 className="text-2xl md:text-3xl font-semibold">Finanzen</h2>
        <p className="text-slate-500 text-sm">Trainer-Auszahlungen und Uebersichten.</p>
      </div>
      <TrainerPayouts clubSlug={slug} rows={rows} />
    </FeatureLockWrapper>
  )
}
