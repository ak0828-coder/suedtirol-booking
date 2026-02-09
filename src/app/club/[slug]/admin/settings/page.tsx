import { ClubSettings } from "@/components/admin/club-settings"
import { ClubCmsEditor } from "@/components/admin/club-cms-editor"
import { getClubAiSettings, getClubContent } from "@/app/actions"
import { applyClubDefaults, mergeClubContent } from "@/lib/club-content"
import { getAdminContext } from "../_lib/get-admin-context"
import { notFound } from "next/navigation"
import { AiDocumentSettings } from "@/components/admin/ai-document-settings"
import { FeatureLockWrapper } from "@/components/admin/feature-lock-wrapper"

export const dynamic = "force-dynamic"

export default async function AdminSettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { club, features, locks } = await getAdminContext(slug)
  if (!features.admin.settings && !locks.admin.settings) return notFound()
  const lockedPage = !features.admin.settings && locks.admin.settings
  const storedContent = await getClubContent(slug)
  const initialContent = applyClubDefaults(mergeClubContent(storedContent), club.name)
  const aiSettings = await getClubAiSettings(slug)

  return (
    <FeatureLockWrapper locked={lockedPage}>
      <div className="rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-sm">
        <h2 className="text-2xl md:text-3xl font-semibold">Einstellungen</h2>
        <p className="text-slate-500 text-sm">
          Hier bearbeitest du Vereinsdaten und alle Texte der Club-Seite. Änderungen sind sofort live.
        </p>
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
        {features.settings.club || locks.settings.club ? (
          <FeatureLockWrapper locked={!features.settings.club && locks.settings.club}>
            <section className="rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                  1
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Vereinsdaten</h3>
                  <p className="text-sm text-slate-500">Logo, Farben und grundlegende Infos.</p>
                </div>
              </div>
              <div className="mt-5">
                <ClubSettings club={club} />
              </div>
            </section>
          </FeatureLockWrapper>
        ) : null}

        {features.settings.ai || locks.settings.ai ? (
          <FeatureLockWrapper locked={!features.settings.ai && locks.settings.ai}>
            <section className="rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                  3
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Dokumenten-KI</h3>
                  <p className="text-sm text-slate-500">Vorprüfung und Gültigkeitslogik steuern.</p>
                </div>
              </div>
              <div className="mt-5">
                <AiDocumentSettings
                  clubSlug={slug}
                  initialEnabled={aiSettings?.ai_doc_enabled ?? true}
                  initialMode={(aiSettings?.ai_doc_mode as any) || "buffer_30"}
                />
              </div>
            </section>
          </FeatureLockWrapper>
        ) : null}

        {features.settings.cms || locks.settings.cms ? (
          <FeatureLockWrapper locked={!features.settings.cms && locks.settings.cms}>
            <section className="rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                  4
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Seiten-Inhalte</h3>
                  <p className="text-sm text-slate-500">Hero, Texte, Buttons und Impressum.</p>
                </div>
              </div>
              <div className="mt-5">
                <ClubCmsEditor clubSlug={slug} initialContent={initialContent} clubName={club.name} />
              </div>
            </section>
          </FeatureLockWrapper>
        ) : null}
      </div>
    </FeatureLockWrapper>
  )
}

