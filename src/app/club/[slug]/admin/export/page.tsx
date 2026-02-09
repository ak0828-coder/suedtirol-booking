import { ExportManager } from "@/components/admin/export-manager"
import { getAdminContext } from "../_lib/get-admin-context"
import { notFound } from "next/navigation"
import { FeatureLockWrapper } from "@/components/admin/feature-lock-wrapper"

export const dynamic = "force-dynamic"

export default async function AdminExportPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { features, locks } = await getAdminContext(slug)
  if (!features.admin.export && !locks.admin.export) return notFound()
  const locked = !features.admin.export && locks.admin.export

  return (
    <FeatureLockWrapper locked={locked}>
      <div className="rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-sm">
        <h2 className="text-2xl md:text-3xl font-semibold">Export</h2>
        <p className="text-slate-500 text-sm">Daten als CSV herunterladen.</p>
      </div>
      <ExportManager clubSlug={slug} />
    </FeatureLockWrapper>
  )
}
