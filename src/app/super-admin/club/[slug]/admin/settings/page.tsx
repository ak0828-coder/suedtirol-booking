import { ClubSettings } from "@/components/admin/club-settings"
import { ClubCmsEditor } from "@/components/admin/club-cms-editor"
import { getClubAiSettings, getClubContent } from "@/app/actions"
import { applyClubDefaults, mergeClubContent } from "@/lib/club-content"
import { getAdminContext } from "@/app/club/[slug]/admin/_lib/get-admin-context"
import { AiDocumentSettings } from "@/components/admin/ai-document-settings"
import { FeatureGateToggle } from "@/components/admin/feature-gate-toggle"

export const dynamic = "force-dynamic"

export default async function SuperAdminSettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { club, features, locks, isSuperAdmin } = await getAdminContext(slug)
  const storedContent = await getClubContent(slug)
  const initialContent = applyClubDefaults(mergeClubContent(storedContent), club.name)
  const aiSettings = await getClubAiSettings(slug)

  return (
    <>
      <div className="rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold">Einstellungen</h2>
            <p className="text-slate-500 text-sm">
              Hier bearbeitest du Vereinsdaten und alle Texte der Club-Seite. Änderungen sind sofort live.
            </p>
          </div>
          <FeatureGateToggle
            clubId={club.id}
            slug={slug}
            path={["admin", "settings"]}
            lockPath={["locks", "admin", "settings"]}
            label="Tab aktiv"
            enabled={features.admin.settings}
            locked={locks.admin.settings}
          />
        </div>
        <div className="mt-4 rounded-xl border border-slate-200/60 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          So funktioniert's:
        </div>
        <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
          <span className="rounded-full border border-slate-200 bg-white px-2 py-1">1. Vereinsdaten prüfen</span>
          <span className="rounded-full border border-slate-200 bg-white px-2 py-1">2. Texte anpassen</span>
          <span className="rounded-full border border-slate-200 bg-white px-2 py-1">3. Speichern</span>
        </div>
      </div>

      <div className="space-y-8">
        <section className="rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">1</div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Vereinsdaten</h3>
              <p className="text-sm text-slate-500">Logo, Farben und grundlegende Infos.</p>
            </div>
            </div>
            <FeatureGateToggle
              clubId={club.id}
              slug={slug}
              path={["settings", "club"]}
              lockPath={["locks", "settings", "club"]}
              label="Bereich aktiv"
              enabled={features.settings.club}
              locked={locks.settings.club}
            />
          </div>
          <div className="mt-5">
            <ClubSettings club={club} isSuperAdmin={isSuperAdmin} />
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">3</div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Dokumenten-KI</h3>
              <p className="text-sm text-slate-500">Vorprüfung und Gültigkeitslogik steuern.</p>
            </div>
            </div>
            <FeatureGateToggle
              clubId={club.id}
              slug={slug}
              path={["settings", "ai"]}
              lockPath={["locks", "settings", "ai"]}
              label="Bereich aktiv"
              enabled={features.settings.ai}
              locked={locks.settings.ai}
            />
          </div>
          <div className="mt-5">
            <AiDocumentSettings
              clubSlug={slug}
              initialEnabled={aiSettings?.ai_doc_enabled ?? true}
              initialMode={(aiSettings?.ai_doc_mode as any) || "buffer_30"}
            />
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">4</div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Seiten-Inhalte</h3>
              <p className="text-sm text-slate-500">Hero, Texte, Buttons und Impressum.</p>
            </div>
            </div>
            <FeatureGateToggle
              clubId={club.id}
              slug={slug}
              path={["settings", "cms"]}
              lockPath={["locks", "settings", "cms"]}
              label="Bereich aktiv"
              enabled={features.settings.cms}
              locked={locks.settings.cms}
            />
          </div>
          <div className="mt-5">
            <ClubCmsEditor clubSlug={slug} initialContent={initialContent} clubName={club.name} />
          </div>
        </section>
      </div>
    </>
  )
}

