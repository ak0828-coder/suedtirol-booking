"use client"

import { useMemo, useState } from "react"
import { updateClub } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Save, Settings } from "lucide-react"
import { locales } from "@/lib/i18n"
import { useI18n } from "@/components/i18n/locale-provider"

export function ClubSettings({
  club,
  isSuperAdmin = false,
  showApplicationFee = false,
}: {
  club: any
  isSuperAdmin?: boolean
  showApplicationFee?: boolean
}) {
  const [loading, setLoading] = useState(false)
  const { t } = useI18n()
  const initialLanguages = useMemo(() => {
    const raw = Array.isArray(club.supported_languages) ? club.supported_languages : []
    return raw.length > 0 ? raw : ["de", "it"]
  }, [club.supported_languages])
  const [supportedLanguages, setSupportedLanguages] = useState<string[]>(initialLanguages)
  const [defaultLanguage, setDefaultLanguage] = useState<string>(club.default_language || initialLanguages[0] || "de")

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    let nextSupported = supportedLanguages.length > 0 ? supportedLanguages : ["de"]
    let nextDefault = defaultLanguage
    if (!nextSupported.includes(nextDefault)) {
      nextDefault = nextSupported[0] || "de"
      setDefaultLanguage(nextDefault)
    }

    const patched = new FormData()
    for (const [key, value] of formData.entries()) {
      if (key === "supported_languages" || key === "default_language") continue
      patched.append(key, value)
    }
    for (const lang of nextSupported) {
      patched.append("supported_languages", lang)
    }
    patched.set("default_language", nextDefault)

    const res = await updateClub(patched)
    setLoading(false)
    if (res.success) {
      alert(t("admin_club.saved", "Gespeichert!"))
    } else {
      alert(res.error)
    }
  }

  return (
    <Card className="rounded-2xl border border-slate-200/60 bg-white/80 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" /> {t("admin_club.title", "Vereinseinstellungen")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="clubId" value={club.id} />
          <input type="hidden" name="slug" value={club.slug} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("admin_club.name", "Vereinsname")}</Label>
              <Input id="name" name="name" defaultValue={club.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="primary_color">{t("admin_club.primary", "Primärfarbe (Hex)")}</Label>
              <div className="flex gap-2">
                <Input
                  id="primary_color"
                  name="primary_color"
                  type="color"
                  className="w-12 h-10 p-1"
                  defaultValue={club.primary_color}
                />
                <Input
                  name="primary_color_text"
                  defaultValue={club.primary_color}
                  className="uppercase"
                  onChange={() => {
                    // optional sync
                  }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cancellation">{t("admin_club.cancellation", "Stornierungsfrist (für Mitglieder)")}</Label>
            <Select name="cancellation_buffer_hours" defaultValue={String(club.cancellation_buffer_hours || "24")}> 
              <SelectTrigger className="bg-white">
                <SelectValue placeholder={t("admin_club.cancellation_placeholder", "Wähle eine Frist")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">{t("admin_club.cancellation_none", "Keine Frist (Jederzeit)")}</SelectItem>
                <SelectItem value="1">1 {t("admin_club.hour_before", "Stunde vorher")}</SelectItem>
                <SelectItem value="6">6 {t("admin_club.hours_before", "Stunden vorher")}</SelectItem>
                <SelectItem value="12">12 {t("admin_club.hours_before", "Stunden vorher")}</SelectItem>
                <SelectItem value="24">24 {t("admin_club.hours_before", "Stunden vorher")}</SelectItem>
                <SelectItem value="48">48 {t("admin_club.hours_before", "Stunden vorher")}</SelectItem>
                <SelectItem value="72">72 {t("admin_club.hours_before", "Stunden vorher")}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
              {t("admin_club.cancellation_help", "Wie viele Stunden vor Spielbeginn darf noch kostenlos storniert werden?")}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">{t("admin_club.logo", "Logo ändern (Optional)")}</Label>
            <Input id="logo" name="logo" type="file" accept="image/*" />
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-200/60 bg-slate-50 p-4">
            <div>
              <Label>{t("admin_club.languages", "Sprachen auf der Club-Seite")}</Label>
              <p className="text-xs text-slate-500">
                {t("admin_club.languages_help", "Wähle, welche Sprachen für Mitglieder verfügbar sind. Nicht erlaubte Sprachen leiten automatisch weiter.")}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm">`n              {[
                { id: "de", label: t("admin_club.lang_de", "Deutsch") },
                { id: "it", label: t("admin_club.lang_it", "Italienisch") },
                { id: "en", label: t("admin_club.lang_en", "Englisch") },
              ].map((lang) => (
                <label
                  key={lang.id}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5"
                >
                  <input
                    type="checkbox"
                    value={lang.id}
                    checked={supportedLanguages.includes(lang.id)}
                    onChange={(event) => {
                      const next = event.target.checked
                        ? [...supportedLanguages, lang.id]
                        : supportedLanguages.filter((item) => item !== lang.id)
                      setSupportedLanguages(next)
                      if (!next.includes(defaultLanguage)) {
                        setDefaultLanguage(next[0] || "de")
                      }
                    }}
                  />
                  {lang.label}
                </label>
              ))}`n            </div>
            {supportedLanguages.map((lang) => (
              <input key={lang} type="hidden" name="supported_languages" value={lang} />
            ))}
            <div className="space-y-2">
              <Label htmlFor="default_language">{t("admin_club.default_language", "Standard-Sprache")}</Label>
              <select
                id="default_language"
                name="default_language"
                value={defaultLanguage}
                onChange={(event) => setDefaultLanguage(event.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                {supportedLanguages
                  .filter((lang) => locales.includes(lang as any))
                  .map((lang) => (
                    <option key={lang} value={lang}>
                      {lang === "de" ? t("admin_club.lang_de", "Deutsch") : lang === "it" ? t("admin_club.lang_it", "Italienisch") : t("admin_club.lang_en", "Englisch")}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {isSuperAdmin || showApplicationFee ? (
            <div className="space-y-2">
              <Label htmlFor="application_fee_cents">{t("admin_club.fee_label", "Avaimo Provision pro Buchung (Cent)")}</Label>
              <Input
                id="application_fee_cents"
                name="application_fee_cents"
                type="number"
                min="0"
                step="1"
                defaultValue={club.application_fee_cents ?? 0}
              />
              <p className="text-xs text-slate-500">
                {t("admin_club.fee_help", "0 = keine Provision. 100 = 1,00 EUR.")}
              </p>
            </div>
          ) : null}

          <div className="pt-2">
            <Button type="submit" disabled={loading} className="w-full md:w-auto rounded-full">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {t("admin_club.save", "Speichern")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

