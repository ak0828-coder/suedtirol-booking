import { getAdminContext } from "@/app/club/[slug]/admin/_lib/get-admin-context"
import { FeatureGateToggle } from "@/components/admin/feature-gate-toggle"
import { getTrainerPayoutSummary, getClubRevenueSummary } from "@/app/actions"
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
  const revenue = await getClubRevenueSummary(slug)

  return (
    <>
      <div className="rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold">Finanzen</h2>
            <p className="text-slate-500 text-sm">Trainer-Auszahlungen und Übersichten.</p>
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

      <div className="space-y-10">
        <section className="space-y-4">
          <h3 className="text-xl font-semibold text-slate-900">Trainerabrechnungen</h3>
          <TrainerPayouts clubSlug={slug} rows={rows} />
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-slate-900">Einnahmen</h3>
            <div className="text-sm text-slate-500">Gesamt: {revenue?.total ?? 0} EUR</div>
          </div>
          <div className="rounded-3xl border border-slate-200/60 bg-white/80 p-5 shadow-sm">
            <div className="grid grid-cols-4 gap-3 text-xs text-slate-500 uppercase tracking-wide">
              <div>Typ</div>
              <div>Bezeichnung</div>
              <div>Datum</div>
              <div>Betrag</div>
            </div>
            <div className="mt-3 space-y-3 text-sm">
              {(revenue?.rows || []).map((row: any, idx: number) => (
                <div key={`${row.type}-${idx}`} className="grid grid-cols-4 gap-3 rounded-xl border border-slate-200/60 bg-white px-3 py-2">
                  <div className="font-medium text-slate-700">{row.type}</div>
                  <div className="text-slate-600">{row.title}</div>
                  <div className="text-slate-500">{row.date ? new Date(row.date).toLocaleDateString("de-DE") : "-"}</div>
                  <div className="font-semibold text-slate-900">{Number(row.amount || 0)} EUR</div>
                </div>
              ))}
              {revenue?.rows?.length === 0 ? (
                <div className="text-sm text-slate-500">Noch keine Einnahmen erfasst.</div>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

