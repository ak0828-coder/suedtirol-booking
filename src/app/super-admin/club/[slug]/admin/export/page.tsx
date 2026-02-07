import { ExportManager } from "@/components/admin/export-manager"
import { getAdminContext } from "@/app/club/[slug]/admin/_lib/get-admin-context"
import { FeatureGateToggle } from "@/components/admin/feature-gate-toggle"

export const dynamic = "force-dynamic"

export default async function SuperAdminExportPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { club, features, locks } = await getAdminContext(slug)

  return (
    <>
      <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold">Export</h2>
            <p className="text-slate-500 text-sm">Daten als CSV herunterladen.</p>
          </div>
          <FeatureGateToggle
            clubId={club.id}
            slug={slug}
            path={["admin", "export"]}
            lockPath={["locks", "admin", "export"]}
            label="Tab aktiv"
            enabled={features.admin.export}
            locked={locks.admin.export}
          />
        </div>
      </div>
      <ExportManager clubSlug={slug} />
    </>
  )
}
