import { ClubSettings } from "@/components/admin/club-settings"
import { getAdminContext } from "../_lib/get-admin-context"

export const dynamic = "force-dynamic"

export default async function AdminSettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { club } = await getAdminContext(slug)

  return (
    <>
      <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm">
        <h2 className="text-2xl md:text-3xl font-semibold">Einstellungen</h2>
        <p className="text-slate-500 text-sm">Vereinsdaten und Branding anpassen.</p>
      </div>
      <ClubSettings club={club} />
    </>
  )
}
