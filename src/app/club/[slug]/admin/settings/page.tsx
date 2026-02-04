import { useAdminContext } from "@/components/admin/admin-context"
import { ClubSettings } from "@/components/admin/club-settings"

export const dynamic = "force-dynamic"

export default async function AdminSettingsPage() {
  const { club } = useAdminContext()

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
