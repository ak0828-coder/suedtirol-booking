"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { defaultFeatures, type FeatureTree } from "@/lib/club-features"
import { updateClubFeatureMatrix } from "@/app/actions"
import { useI18n } from "@/components/i18n/locale-provider"

export type FeatureSection = {
  title: string
  key: string
  items: { key: string; label: string }[]
}

export function FeatureMatrixForm({
  clubId,
  slug,
  initialFeatures,
  sections,
}: {
  clubId: string
  slug: string
  initialFeatures: FeatureTree
  sections?: FeatureSection[]
}) {
  const { t } = useI18n()
  const defaultSections: FeatureSection[] = useMemo(() => [
    {
      title: t("admin_features.nav", "Navigation"),
      key: "admin",
      items: [
        { key: "overview", label: t("admin_features.nav_overview", "Übersicht") },
        { key: "bookings", label: t("admin_features.nav_bookings", "Buchungen") },
        { key: "courts", label: t("admin_features.nav_courts", "Plätze") },
        { key: "blocks", label: t("admin_features.nav_blocks", "Sperrzeiten") },
        { key: "plans", label: t("admin_features.nav_plans", "Abos") },
        { key: "members", label: t("admin_features.nav_members", "Mitglieder") },
        { key: "trainers", label: t("admin_features.nav_trainers", "Trainer") },
        { key: "courses", label: t("admin_features.nav_courses", "Kurse") },
        { key: "finance", label: t("admin_features.nav_finance", "Finanzen") },
        { key: "vouchers", label: t("admin_features.nav_vouchers", "Gutscheine") },
        { key: "settings", label: t("admin_features.nav_settings", "Einstellungen") },
        { key: "export", label: t("admin_features.nav_export", "Export") },
      ],
    },
    {
      title: t("admin_features.members", "Mitglieder"),
      key: "members",
      items: [
        { key: "contract_editor", label: t("admin_features.member_contract", "Vertrags-Editor") },
        { key: "import", label: t("admin_features.member_import", "Import") },
        { key: "invite", label: t("admin_features.member_invite", "Einladungen") },
        { key: "documents", label: t("admin_features.member_documents", "Dokumente") },
        { key: "payments", label: t("admin_features.member_payments", "Zahlungen") },
      ],
    },
    {
      title: t("admin_features.settings", "Einstellungen"),
      key: "settings",
      items: [
        { key: "club", label: t("admin_features.settings_club", "Vereinsdaten") },
        { key: "ai", label: t("admin_features.settings_ai", "Dokumenten-KI") },
        { key: "cms", label: t("admin_features.settings_cms", "Seiten-Inhalte") },
      ],
    },
  ], [t])

  const [features, setFeatures] = useState<FeatureTree>(initialFeatures)
  const allSections = useMemo(() => sections || defaultSections, [sections, defaultSections])

  return (
    <form action={updateClubFeatureMatrix} className="space-y-6">
      <input type="hidden" name="clubId" value={clubId} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="feature_flags" value={JSON.stringify(features)} readOnly />

      <div className="grid gap-6 md:grid-cols-2">
        {allSections.map((section) => (
          <div key={section.key} className="rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900">{section.title}</div>
                <div className="text-xs text-slate-500">{t("admin_features.hint", "Schalte einzelne Bereiche frei.")}</div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {section.items.map((item) => (
                <label key={item.key} className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={(features as any)[section.key]?.[item.key] ?? false}
                    onChange={(e) =>
                      setFeatures((prev) => ({
                        ...prev,
                        [section.key]: {
                          ...(prev as any)[section.key],
                          [item.key]: e.target.checked,
                        },
                      }))
                    }
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit" className="rounded-full">{t("admin_features.save", "Speichern")}</Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          onClick={() => setFeatures(defaultFeatures)}
        >
          {t("admin_features.enable_all", "Alle aktivieren")}
        </Button>
      </div>
    </form>
  )
}
