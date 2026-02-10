"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { updateClubContent } from "@/app/actions"
import { applyClubDefaults, defaultClubContent } from "@/lib/club-content"
import type { ClubContent } from "@/lib/club-content"
import { useI18n } from "@/components/i18n/locale-provider"

export function ClubCmsEditor({
  clubSlug,
  initialContent,
  clubName,
}: {
  clubSlug: string
  initialContent: ClubContent
  clubName: string
}) {
  const [content, setContent] = useState<ClubContent>(initialContent)
  const [lastSaved, setLastSaved] = useState<ClubContent>(initialContent)
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState<"hero" | "overview" | "sections" | "impressum" | "footer" | "seo">(
    "hero"
  )
  const { t } = useI18n()

  const updateHero = (field: keyof ClubContent["hero"], value: string) => {
    setContent((prev) => ({ ...prev, hero: { ...prev.hero, [field]: value } }))
  }

  const updateBadges = (field: keyof ClubContent["badges"], value: string) => {
    setContent((prev) => ({ ...prev, badges: { ...prev.badges, [field]: value } }))
  }

  const updateOverview = (field: keyof ClubContent["overview"], value: string) => {
    setContent((prev) => ({ ...prev, overview: { ...prev.overview, [field]: value } }))
  }

  const updateSection = <S extends keyof ClubContent["sections"]>(
    section: S,
    field: keyof ClubContent["sections"][S],
    value: string
  ) => {
    setContent((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        [section]: { ...prev.sections[section], [field]: value },
      },
    }))
  }

  const updateFooter = (field: keyof ClubContent["footer"], value: string) => {
    setContent((prev) => ({ ...prev, footer: { ...prev.footer, [field]: value } }))
  }

  const updateImpressum = (field: keyof ClubContent["impressum"], value: string) => {
    setContent((prev) => ({ ...prev, impressum: { ...prev.impressum, [field]: value } }))
  }

  const updateSeo = (field: keyof ClubContent["seo"], value: string) => {
    setContent((prev) => ({ ...prev, seo: { ...prev.seo, [field]: value } }))
  }

  const handleSave = () => {
    setMessage(null)
    startTransition(async () => {
      const res = await updateClubContent(clubSlug, content)
      if (res?.success) {
        setLastSaved(content)
        setMessage(t("admin_cms.saved", "Gespeichert."))
      } else {
        setMessage(res?.error || t("admin_cms.error", "Fehler beim Speichern."))
      }
    })
  }

  const handleResetDefaults = () => {
    setContent(applyClubDefaults(defaultClubContent, clubName))
    setMessage(t("admin_cms.reset", "Auf Standard zurückgesetzt."))
  }

  const handleRevertSaved = () => {
    setContent(initialContent)
    setMessage(t("admin_cms.revert", "Letzte gespeicherte Version geladen."))
  }

  const isDirty = useMemo(
    () => JSON.stringify(content) !== JSON.stringify(lastSaved),
    [content, lastSaved]
  )

  useEffect(() => {
    if (!isDirty) return
    const timer = setTimeout(() => {
      startTransition(async () => {
        const res = await updateClubContent(clubSlug, content)
        if (res?.success) {
          setLastSaved(content)
          setMessage(t("admin_cms.auto", "Auto-Speicher: gespeichert."))
        }
      })
    }, 1200)

    return () => clearTimeout(timer)
  }, [content, clubSlug, isDirty, startTransition, t])

  return (
    <Card className="rounded-2xl border border-slate-200/60 bg-white/80 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t("admin_cms.title", "Seiten Editor (CMS)")}</CardTitle>
        <div className="flex items-center gap-3">
          {isDirty && (
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
              {t("admin_cms.unsaved", "Ungespeichert")}
            </span>
          )}
          {message && <span className="text-xs text-slate-500">{message}</span>}
          <Button variant="outline" onClick={handleRevertSaved} disabled={isPending} className="rounded-full">
            {t("admin_cms.undo", "Rückgängig")}
          </Button>
          <Button variant="outline" onClick={handleResetDefaults} disabled={isPending} className="rounded-full">
            {t("admin_cms.default", "Standard")}
          </Button>
          <Button onClick={handleSave} disabled={isPending} className="rounded-full">
            {isPending ? t("admin_cms.saving", "Speichern...") : t("admin_cms.save", "Speichern")}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-2 text-sm">
          {[
            { id: "hero", label: t("admin_cms.tabs.hero", "Hero") },
            { id: "overview", label: t("admin_cms.tabs.overview", "Badges & Überblick") },
            { id: "sections", label: t("admin_cms.tabs.sections", "Sektionen") },
            { id: "impressum", label: t("admin_cms.tabs.impressum", "Impressum") },
            { id: "footer", label: t("admin_cms.tabs.footer", "Footer") },
            { id: "seo", label: "SEO" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={
                activeTab === tab.id
                  ? "rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-slate-900"
                  : "rounded-full border border-transparent px-3 py-1 text-slate-500 hover:border-slate-200 hover:bg-slate-50"
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-6">
          <div className="space-y-6">
            {activeTab === "hero" && (
              <section className="space-y-4">
                <div className="text-sm font-semibold text-slate-700">{t("admin_cms.hero", "Hero")}</div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label title={t("admin_cms.hero_title_tip", "Hauptüberschrift der Club-Seite")}>{t("admin_cms.title_label", "Titel")}</Label>
                    <Input value={content.hero.title} onChange={(e) => updateHero("title", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label title={t("admin_cms.hero_subtitle_tip", "Kurzer Teaser unter dem Titel")}>{t("admin_cms.subtitle", "Untertitel")}</Label>
                    <Input
                      value={content.hero.subtitle}
                      onChange={(e) => updateHero("subtitle", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label title={t("admin_cms.hero_primary_tip", "Haupt-Call-to-Action")}>{t("admin_cms.primary", "Primärer Button")}</Label>
                    <Input
                      value={content.hero.primaryCtaText}
                      onChange={(e) => updateHero("primaryCtaText", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label title={t("admin_cms.hero_secondary_tip", "Sekundärer Call-to-Action")}>{t("admin_cms.secondary", "Sekundärer Button")}</Label>
                    <Input
                      value={content.hero.secondaryCtaText}
                      onChange={(e) => updateHero("secondaryCtaText", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label title={t("admin_cms.hero_member_badge_tip", "Badge für eingeloggte Mitglieder")}>{t("admin_cms.member_badge", "Member Badge Text")}</Label>
                    <Input
                      value={content.hero.memberBadgeText}
                      onChange={(e) => updateHero("memberBadgeText", e.target.value)}
                    />
                  </div>
                </div>
              </section>
            )}

            {activeTab === "overview" && (
              <section className="space-y-4">
                <div className="text-sm font-semibold text-slate-700">{t("admin_cms.overview", "Badges & Überblick")}</div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label title={t("admin_cms.location_tip", "Ort/Region des Clubs")}>{t("admin_cms.location", "Standort Text")}</Label>
                    <Input
                      value={content.badges.locationText}
                      onChange={(e) => updateBadges("locationText", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label title={t("admin_cms.status_tip", "Zustand/Statusanzeige")}>{t("admin_cms.status", "Status Text")}</Label>
                    <Input
                      value={content.badges.statusText}
                      onChange={(e) => updateBadges("statusText", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label title={t("admin_cms.overview_title_tip", "Titel der Overview-Karte")}>{t("admin_cms.overview_title", "Überblick Titel")}</Label>
                    <Input
                      value={content.overview.title}
                      onChange={(e) => updateOverview("title", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label title={t("admin_cms.label_courts_tip", "Label für Court-Anzahl")}>{t("admin_cms.label_courts", "Label Plätze")}</Label>
                    <Input
                      value={content.overview.labelCourts}
                      onChange={(e) => updateOverview("labelCourts", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label title={t("admin_cms.label_price_tip", "Label für niedrigsten Preis")}>{t("admin_cms.label_price", "Label Ab Preis")}</Label>
                    <Input
                      value={content.overview.labelFromPrice}
                      onChange={(e) => updateOverview("labelFromPrice", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label title={t("admin_cms.label_status_tip", "Label für Statuszeile")}>{t("admin_cms.label_status", "Label Status")}</Label>
                    <Input
                      value={content.overview.labelStatus}
                      onChange={(e) => updateOverview("labelStatus", e.target.value)}
                    />
                  </div>
                </div>
              </section>
            )}

            {activeTab === "sections" && (
              <section className="space-y-6">
                <div className="space-y-4">
                  <div className="text-sm font-semibold text-slate-700">{t("admin_cms.section_courts", "Abschnitt: Plätze")}</div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label title={t("admin_cms.section_courts_title_tip", "Sektionstitel für Courts")}>{t("admin_cms.title_label", "Titel")}</Label>
                      <Input
                        value={content.sections.courts.title}
                        onChange={(e) => updateSection("courts", "title", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label title={t("admin_cms.section_subtitle_tip", "Kurzbeschreibung unter dem Titel")}>{t("admin_cms.subtitle", "Untertitel")}</Label>
                      <Input
                        value={content.sections.courts.subtitle}
                        onChange={(e) => updateSection("courts", "subtitle", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-sm font-semibold text-slate-700">{t("admin_cms.section_membership", "Abschnitt: Mitgliedschaft")}</div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label title={t("admin_cms.section_membership_title_tip", "Sektionstitel für Mitgliedschaft")}>{t("admin_cms.title_label", "Titel")}</Label>
                      <Input
                        value={content.sections.membership.title}
                        onChange={(e) => updateSection("membership", "title", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label title={t("admin_cms.section_subtitle_tip", "Kurzbeschreibung unter dem Titel")}>{t("admin_cms.subtitle", "Untertitel")}</Label>
                      <Input
                        value={content.sections.membership.subtitle}
                        onChange={(e) => updateSection("membership", "subtitle", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label title={t("admin_cms.section_cta_tip", "Text des Membership-Buttons")}>{t("admin_cms.cta", "CTA Button Text")}</Label>
                      <Input
                        value={content.sections.membership.ctaLabel}
                        onChange={(e) => updateSection("membership", "ctaLabel", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </section>
            )}

            {activeTab === "impressum" && (
              <section className="space-y-4">
                <div className="text-sm font-semibold text-slate-700">{t("admin_cms.impressum", "Impressum")}</div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label title={t("admin_cms.impressum_title_tip", "Überschrift der Impressum-Seite")}>{t("admin_cms.impressum_title", "Impressum Titel")}</Label>
                    <Input
                      value={content.impressum.title}
                      onChange={(e) => updateImpressum("title", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label title={t("admin_cms.footer_link_tip", "Text des Impressum-Links im Footer")}>{t("admin_cms.footer_link", "Footer Link Text")}</Label>
                    <Input
                      value={content.footer.impressumLinkText}
                      onChange={(e) => updateFooter("impressumLinkText", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label title={t("admin_cms.impressum_body_tip", "Text der Impressum-Seite")}>{t("admin_cms.impressum_body", "Impressum Inhalt")}</Label>
                    <textarea
                      className="min-h-[160px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
                      value={content.impressum.body}
                      onChange={(e) => updateImpressum("body", e.target.value)}
                    />
                  </div>
                </div>
              </section>
            )}

            {activeTab === "footer" && (
              <section className="space-y-4">
                <div className="text-sm font-semibold text-slate-700">{t("admin_cms.footer", "Footer")}</div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label title={t("admin_cms.footer_text_tip", "Kleiner Text im Footer")}>{t("admin_cms.footer_text", "Footer Text")}</Label>
                    <Input
                      value={content.footer.smallText}
                      onChange={(e) => updateFooter("smallText", e.target.value)}
                    />
                  </div>
                </div>
              </section>
            )}

            {activeTab === "seo" && (
              <section className="space-y-4">
                <div className="text-sm font-semibold text-slate-700">SEO</div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label title={t("admin_cms.seo_tip", "Kurzbeschreibung für Suchmaschinen")}>{t("admin_cms.seo_desc", "SEO Description")}</Label>
                    <div className="text-xs text-slate-500">
                      {t("admin_cms.seo_hint", "Erscheint in Suchergebnissen. Ideal sind 120–160 Zeichen.")}
                    </div>
                    <Input
                      value={content.seo.description}
                      onChange={(e) => updateSeo("description", e.target.value)}
                    />
                  </div>
                </div>
              </section>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-5 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("admin_cms.preview", "Live Preview")}</div>
            <div className="mt-4 rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm">
              <div className="text-sm text-slate-500">Hero</div>
              <div className="mt-2 text-lg font-semibold text-slate-900">{content.hero.title}</div>
              <div className="text-xs text-slate-500">{content.hero.subtitle}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-900 px-3 py-1 text-xs text-white">
                  {content.hero.primaryCtaText}
                </span>
                <span className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700">
                  {content.hero.secondaryCtaText}
                </span>
              </div>

              <div className="mt-5 rounded-xl border border-slate-200/60 bg-slate-50 p-3 text-xs text-slate-600">
                <div className="font-semibold uppercase tracking-wide text-slate-500">{content.overview.title}</div>
                <div className="mt-1">
                  {content.overview.labelCourts}: 4 • {content.overview.labelFromPrice}: 20€ • {content.overview.labelStatus}: {content.badges.statusText}
                </div>
                <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1">
                  {content.badges.locationText} • {content.badges.statusText}
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-slate-200/60 bg-white p-3">
                <div className="text-sm font-semibold text-slate-900">{content.sections.courts.title}</div>
                <div className="text-xs text-slate-500">{content.sections.courts.subtitle}</div>
              </div>

              <div className="mt-3 rounded-xl border border-slate-200/60 bg-white p-3">
                <div className="text-sm font-semibold text-slate-900">{content.sections.membership.title}</div>
                <div className="text-xs text-slate-500">{content.sections.membership.subtitle}</div>
                <div className="mt-2 inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                  {content.sections.membership.ctaLabel}
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-slate-200/60 bg-white p-3">
                <div className="text-xs uppercase tracking-wide text-slate-500">{t("admin_cms.impressum", "Impressum")}</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">{content.impressum.title}</div>
                <div className="text-xs text-slate-500">
                  {content.impressum.body ? content.impressum.body.slice(0, 140) + "..." : t("admin_cms.no_content", "Kein Inhalt")}
                </div>
              </div>

              <div className="mt-5 border-t border-slate-200/60 pt-3 text-xs text-slate-500">
                {content.footer.smallText} • {content.footer.impressumLinkText}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
