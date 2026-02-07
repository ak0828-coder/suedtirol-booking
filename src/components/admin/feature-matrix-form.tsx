"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { defaultFeatures, type FeatureTree } from "@/lib/club-features"
import { updateClubFeatureMatrix } from "@/app/actions"

const featureSections = [
  {
    title: "Navigation",
    key: "admin",
    items: [
      { key: "overview", label: "Ubersicht" },
      { key: "bookings", label: "Buchungen" },
      { key: "courts", label: "Platze" },
      { key: "blocks", label: "Sperrzeiten" },
      { key: "plans", label: "Abos" },
      { key: "members", label: "Mitglieder" },
      { key: "vouchers", label: "Gutscheine" },
      { key: "settings", label: "Einstellungen" },
      { key: "export", label: "Export" },
    ],
  },
  {
    title: "Mitglieder",
    key: "members",
    items: [
      { key: "contract_editor", label: "Vertrags-Editor" },
      { key: "import", label: "Import" },
      { key: "invite", label: "Einladungen" },
      { key: "documents", label: "Dokumente" },
      { key: "payments", label: "Zahlungen" },
    ],
  },
  {
    title: "Einstellungen",
    key: "settings",
    items: [
      { key: "club", label: "Vereinsdaten" },
      { key: "ai", label: "Dokumenten-KI" },
      { key: "cms", label: "Seiten-Inhalte" },
    ],
  },
]

export function FeatureMatrixForm({
  clubId,
  slug,
  initialFeatures,
}: {
  clubId: string
  slug: string
  initialFeatures: FeatureTree
}) {
  const [features, setFeatures] = useState<FeatureTree>(initialFeatures)

  return (
    <form action={updateClubFeatureMatrix} className="space-y-6">
      <input type="hidden" name="clubId" value={clubId} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="feature_flags" value={JSON.stringify(features)} readOnly />

      <div className="grid gap-6 md:grid-cols-2">
        {featureSections.map((section) => (
          <div key={section.key} className="rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900">{section.title}</div>
                <div className="text-xs text-slate-500">Schalte einzelne Bereiche frei.</div>
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
        <Button type="submit" className="rounded-full">Speichern</Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          onClick={() => setFeatures(defaultFeatures)}
        >
          Alle aktivieren
        </Button>
      </div>
    </form>
  )
}
