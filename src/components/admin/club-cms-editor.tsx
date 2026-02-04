"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { updateClubContent } from "@/app/actions"
import { applyClubDefaults, defaultClubContent } from "@/lib/club-content"
import type { ClubContent } from "@/lib/club-content"

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
        setMessage("Gespeichert.")
      } else {
        setMessage(res?.error || "Fehler beim Speichern.")
      }
    })
  }

  const handleResetDefaults = () => {
    setContent(applyClubDefaults(defaultClubContent, clubName))
    setMessage("Auf Standard zurückgesetzt.")
  }

  const handleRevertSaved = () => {
    setContent(initialContent)
    setMessage("Letzte gespeicherte Version geladen.")
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
          setMessage("Auto-Speicher: gespeichert.")
        }
      })
    }, 1200)

    return () => clearTimeout(timer)
  }, [content, clubSlug, isDirty, startTransition])

  return (
    <Card className="rounded-2xl border border-slate-200/60 bg-white/80 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Seiten Editor (CMS)</CardTitle>
        <div className="flex items-center gap-3">
          {isDirty && (
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
              Ungespeichert
            </span>
          )}
          {message && <span className="text-xs text-slate-500">{message}</span>}
          <Button variant="outline" onClick={handleRevertSaved} disabled={isPending} className="rounded-full">
            Rückgängig
          </Button>
          <Button variant="outline" onClick={handleResetDefaults} disabled={isPending} className="rounded-full">
            Standard
          </Button>
          <Button onClick={handleSave} disabled={isPending} className="rounded-full">
            {isPending ? "Speichern..." : "Speichern"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-2 text-sm">
          {[
            { id: "hero", label: "Hero" },
            { id: "overview", label: "Badges & Überblick" },
            { id: "sections", label: "Sektionen" },
            { id: "impressum", label: "Impressum" },
            { id: "footer", label: "Footer" },
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
                <div className="text-sm font-semibold text-slate-700">Hero</div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label title="Hauptüberschrift der Club-Seite">Titel</Label>
                    <Input value={content.hero.title} onChange={(e) => updateHero("title", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label title="Kurzer Teaser unter dem Titel">Untertitel</Label>
                    <Input
                      value={content.hero.subtitle}
                      onChange={(e) => updateHero("subtitle", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label title="Haupt-Call-to-Action">Primärer Button</Label>
                    <Input
                      value={content.hero.primaryCtaText}
                      onChange={(e) => updateHero("primaryCtaText", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label title="Sekundärer Call-to-Action">Sekundärer Button</Label>
                    <Input
                      value={content.hero.secondaryCtaText}
                      onChange={(e) => updateHero("secondaryCtaText", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label title="Badge für eingeloggte Mitglieder">Member Badge Text</Label>
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
                <div className="text-sm font-semibold text-slate-700">Badges & Überblick</div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label title="Ort/Region des Clubs">Standort Text</Label>
                    <Input
                      value={content.badges.locationText}
                      onChange={(e) => updateBadges("locationText", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label title="Zustand/Statusanzeige">Status Text</Label>
                    <Input
                      value={content.badges.statusText}
                      onChange={(e) => updateBadges("statusText", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label title="Titel der Overview-Karte">Überblick Titel</Label>
                    <Input
                      value={content.overview.title}
                      onChange={(e) => updateOverview("title", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label title="Label für Court-Anzahl">Label Plätze</Label>
                    <Input
                      value={content.overview.labelCourts}
                      onChange={(e) => updateOverview("labelCourts", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label title="Label für niedrigsten Preis">Label Ab Preis</Label>
                    <Input
                      value={content.overview.labelFromPrice}
                      onChange={(e) => updateOverview("labelFromPrice", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label title="Label für Statuszeile">Label Status</Label>
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
                  <div className="text-sm font-semibold text-slate-700">Abschnitt: Plätze</div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                    <Label title="Sektionstitel für Courts">Titel</Label>
                    <Input
                      value={content.sections.courts.title}
                      onChange={(e) => updateSection("courts", "title", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label title="Kurzbeschreibung unter dem Titel">Untertitel</Label>
                    <Input
                      value={content.sections.courts.subtitle}
                      onChange={(e) => updateSection("courts", "subtitle", e.target.value)}
                    />
                  </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-sm font-semibold text-slate-700">Abschnitt: Mitgliedschaft</div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                    <Label title="Sektionstitel für Mitgliedschaft">Titel</Label>
                    <Input
                      value={content.sections.membership.title}
                      onChange={(e) => updateSection("membership", "title", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label title="Kurzbeschreibung unter dem Titel">Untertitel</Label>
                    <Input
                      value={content.sections.membership.subtitle}
                      onChange={(e) => updateSection("membership", "subtitle", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label title="Text des Membership-Buttons">CTA Button Text</Label>
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
                <div className="text-sm font-semibold text-slate-700">Impressum</div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label title="Überschrift der Impressum-Seite">Impressum Titel</Label>
                    <Input
                      value={content.impressum.title}
                      onChange={(e) => updateImpressum("title", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label title="Text des Impressum-Links im Footer">Footer Link Text</Label>
                    <Input
                      value={content.footer.impressumLinkText}
                      onChange={(e) => updateFooter("impressumLinkText", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label title="Text der Impressum-Seite">Impressum Inhalt</Label>
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
                <div className="text-sm font-semibold text-slate-700">Footer</div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label title="Kleiner Text im Footer">Footer Text</Label>
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
                    <Label title="Kurzbeschreibung für Suchmaschinen">SEO Description</Label>
                    <div className="text-xs text-slate-500">
                      Erscheint in Suchergebnissen. Ideal sind 120–160 Zeichen.
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
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Live Preview</div>
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
                  {content.overview.labelCourts}: 4 • {content.overview.labelFromPrice}: 20€ •{" "}
                  {content.overview.labelStatus}: {content.badges.statusText}
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
                <div className="text-xs uppercase tracking-wide text-slate-500">Impressum</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">{content.impressum.title}</div>
                <div className="text-xs text-slate-500">
                  {content.impressum.body ? content.impressum.body.slice(0, 140) + "..." : "Kein Inhalt"}
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
