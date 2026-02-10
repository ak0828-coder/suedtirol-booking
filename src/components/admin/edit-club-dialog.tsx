"use client"

import { useMemo, useState } from "react"
import { updateClub } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Settings, Loader2, Upload, Palette } from "lucide-react"
import { useRouter } from "next/navigation"
import { defaultFeatures, mergeFeatures, type FeatureTree } from "@/lib/club-features"
import { useI18n } from "@/components/i18n/locale-provider"

export function EditClubDialog({ club }: { club: any }) {
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [color, setColor] = useState(club.primary_color || "#0f172a")
  const [flags, setFlags] = useState({
    has_ai_check: !!club.has_ai_check,
    has_contract_signing: !!club.has_contract_signing,
    has_gamification: !!club.has_gamification,
    has_vouchers: club.has_vouchers !== false,
  })
  const [featureFlags, setFeatureFlags] = useState<FeatureTree>(() => mergeFeatures(club.feature_flags))
  const router = useRouter()
  const { t } = useI18n()

  const featureSections = useMemo(
    () => [
      {
        title: t("admin_edit.features_nav", "Navigation"),
        key: "admin",
        items: [
          { key: "overview", label: t("admin_edit.nav.overview", "Übersicht") },
          { key: "bookings", label: t("admin_edit.nav.bookings", "Buchungen") },
          { key: "courts", label: t("admin_edit.nav.courts", "Plätze") },
          { key: "blocks", label: t("admin_edit.nav.blocks", "Sperrzeiten") },
          { key: "plans", label: t("admin_edit.nav.plans", "Abos") },
          { key: "members", label: t("admin_edit.nav.members", "Mitglieder") },
          { key: "vouchers", label: t("admin_edit.nav.vouchers", "Gutscheine") },
          { key: "settings", label: t("admin_edit.nav.settings", "Einstellungen") },
          { key: "export", label: t("admin_edit.nav.export", "Export") },
        ],
      },
      {
        title: t("admin_edit.features_member", "Mitgliederbereich"),
        key: "members",
        items: [
          { key: "contract_editor", label: t("admin_edit.member.contract", "Vertrags-Editor") },
          { key: "import", label: t("admin_edit.member.import", "Import") },
          { key: "invite", label: t("admin_edit.member.invite", "Einladungen") },
          { key: "documents", label: t("admin_edit.member.documents", "Dokumente") },
          { key: "payments", label: t("admin_edit.member.payments", "Zahlungen") },
        ],
      },
      {
        title: t("admin_edit.features_settings", "Einstellungen"),
        key: "settings",
        items: [
          { key: "club", label: t("admin_edit.settings.club", "Vereinsdaten") },
          { key: "ai", label: t("admin_edit.settings.ai", "Dokumenten-KI") },
          { key: "cms", label: t("admin_edit.settings.cms", "Seiten-Inhalte") },
        ],
      },
    ],
    [t]
  )

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    formData.append("clubId", club.id)
    formData.append("slug", club.slug)
    formData.set("primary_color", color)
    if (flags.has_ai_check) formData.set("has_ai_check", "on")
    if (flags.has_contract_signing) formData.set("has_contract_signing", "on")
    if (flags.has_gamification) formData.set("has_gamification", "on")
    if (flags.has_vouchers) formData.set("has_vouchers", "on")
    formData.set("feature_flags", JSON.stringify(featureFlags))

    const result = await updateClub(formData)

    setIsLoading(false)

    if (result.success) {
      setOpen(false)
      router.refresh()
    } else {
      alert(t("admin_edit.error", "Fehler") + ": " + result.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-full">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white text-slate-900 rounded-2xl">
        <DialogHeader>
          <DialogTitle>{t("admin_edit.title", "Verein bearbeiten")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("admin_edit.name", "Name des Vereins")}</Label>
            <Input id="name" name="name" defaultValue={club.name} required />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Palette className="w-4 h-4" /> {t("admin_edit.brand", "Branding Farbe")}
            </Label>
            <div className="flex gap-3">
              <div className="relative">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                />
                <div className="w-10 h-10 rounded-lg border shadow-sm" style={{ backgroundColor: color }} />
              </div>
              <Input
                name="primary_color_text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#000000"
                className="font-mono flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Upload className="w-4 h-4" /> {t("admin_edit.logo", "Logo hochladen")}
            </Label>
            <Input id="logo" name="logo" type="file" accept="image/*" className="cursor-pointer" />
            {club.logo_url && (
              <div className="mt-3 p-2 bg-slate-50 rounded-lg border flex items-center gap-3">
                <img src={club.logo_url} alt="Logo" className="w-8 h-8 object-contain" />
                <span className="text-xs text-slate-500">{t("admin_edit.current_logo", "Aktuelles Logo")}</span>
              </div>
            )}
          </div>

          <div className="space-y-3 border-t border-slate-200 pt-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {t("admin_edit.modules", "Aktivierte Module")}
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={flags.has_ai_check}
                onChange={(e) => setFlags((prev) => ({ ...prev, has_ai_check: e.target.checked }))}
              />
              {t("admin_edit.module_ai", "KI Dokumenten-Check")}
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={flags.has_contract_signing}
                onChange={(e) => setFlags((prev) => ({ ...prev, has_contract_signing: e.target.checked }))}
              />
              {t("admin_edit.module_contract", "Digitaler Vertrag & Unterschrift")}
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={flags.has_gamification}
                onChange={(e) => setFlags((prev) => ({ ...prev, has_gamification: e.target.checked }))}
              />
              {t("admin_edit.module_gamification", "Gamification (Leaderboard)")}
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={flags.has_vouchers}
                onChange={(e) => setFlags((prev) => ({ ...prev, has_vouchers: e.target.checked }))}
              />
              {t("admin_edit.module_vouchers", "Gutscheine")}
            </label>
          </div>

          <div className="space-y-3 border-t border-slate-200 pt-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {t("admin_edit.feature_matrix", "Feature-Matrix")}
            </div>
            {featureSections.map((section) => (
              <div key={section.key} className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
                <div className="text-xs font-semibold text-slate-600">{section.title}</div>
                <div className="grid gap-2">
                  {section.items.map((item) => (
                    <label key={item.key} className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={(featureFlags as any)[section.key]?.[item.key] ?? false}
                        onChange={(e) =>
                          setFeatureFlags((prev) => ({
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
            <Button
              type="button"
              variant="outline"
              onClick={() => setFeatureFlags(defaultFeatures)}
              className="w-full"
            >
              {t("admin_edit.enable_all", "Alle aktivieren")}
            </Button>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-full">
              {t("admin_edit.cancel", "Abbrechen")}
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-slate-900 text-white hover:bg-slate-800 rounded-full">
              {isLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : t("admin_edit.save", "Speichern")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
