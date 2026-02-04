import { ClubSettings } from "@/components/admin/club-settings"
import { ClubCmsEditor } from "@/components/admin/club-cms-editor"
import { getClubContent } from "@/app/actions"
import { applyClubDefaults, mergeClubContent } from "@/lib/club-content"
import { getAdminContext } from "../_lib/get-admin-context"

export const dynamic = "force-dynamic"

export default async function AdminSettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { club } = await getAdminContext(slug)
  const storedContent = await getClubContent(slug)
  const initialContent = applyClubDefaults(mergeClubContent(storedContent), club.name)

  return (
    <>
      <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold">Einstellungen & CMS</h2>
            <p className="text-slate-500 text-sm">
              Branding, Vereinsdaten und alle Texte der Club-Seite zentral verwalten.
            </p>
          </div>
          <div className="text-xs text-slate-500">
            Tipp: Änderungen sind sofort live auf der Club-Seite.
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Vereins-Einstellungen</h3>
            <p className="mt-1 text-sm text-slate-500">Logo, Farben und Kontaktdaten.</p>
          </div>
          <ClubSettings club={club} />
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Seiten-Editor</h3>
            <p className="mt-1 text-sm text-slate-500">
              Texte, Buttons und Impressum der Club-Seite.
            </p>
          </div>
          <ClubCmsEditor clubSlug={slug} initialContent={initialContent} clubName={club.name} />
        </div>
      </div>
    </>
  )
}
