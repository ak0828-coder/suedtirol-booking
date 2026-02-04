import { useAdminContext } from "@/components/admin/admin-context"
import { ExportManager } from "@/components/admin/export-manager"

export const dynamic = "force-dynamic"

export default async function AdminExportPage() {
  const { slug } = useAdminContext()

  return (
    <>
      <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm">
        <h2 className="text-2xl md:text-3xl font-semibold">Export</h2>
        <p className="text-slate-500 text-sm">Daten als CSV herunterladen.</p>
      </div>
      <ExportManager clubSlug={slug} />
    </>
  )
}
