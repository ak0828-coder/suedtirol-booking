"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { updateClubContent } from "@/app/actions"
import type { ClubContent } from "@/lib/club-content"

export function ClubCmsEditor({
  clubSlug,
  initialContent,
}: {
  clubSlug: string
  initialContent: ClubContent
}) {
  const [content, setContent] = useState<ClubContent>(initialContent)
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

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
        setMessage("Gespeichert.")
      } else {
        setMessage(res?.error || "Fehler beim Speichern.")
      }
    })
  }

  return (
    <Card className="rounded-2xl border border-slate-200/60 bg-white/80 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Seiten Editor (CMS)</CardTitle>
        <div className="flex items-center gap-3">
          {message && <span className="text-xs text-slate-500">{message}</span>}
          <Button onClick={handleSave} disabled={isPending} className="rounded-full">
            {isPending ? "Speichern..." : "Speichern"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-10">
        <section className="space-y-4">
          <div className="text-sm font-semibold text-slate-700">Hero</div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Titel</Label>
              <Input value={content.hero.title} onChange={(e) => updateHero("title", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Untertitel</Label>
              <Input
                value={content.hero.subtitle}
                onChange={(e) => updateHero("subtitle", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Primärer Button</Label>
              <Input
                value={content.hero.primaryCtaText}
                onChange={(e) => updateHero("primaryCtaText", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Sekundärer Button</Label>
              <Input
                value={content.hero.secondaryCtaText}
                onChange={(e) => updateHero("secondaryCtaText", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Member Badge Text</Label>
              <Input
                value={content.hero.memberBadgeText}
                onChange={(e) => updateHero("memberBadgeText", e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="text-sm font-semibold text-slate-700">Badges & Überblick</div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Standort Text</Label>
              <Input
                value={content.badges.locationText}
                onChange={(e) => updateBadges("locationText", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Status Text</Label>
              <Input
                value={content.badges.statusText}
                onChange={(e) => updateBadges("statusText", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Überblick Titel</Label>
              <Input
                value={content.overview.title}
                onChange={(e) => updateOverview("title", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Label Plätze</Label>
              <Input
                value={content.overview.labelCourts}
                onChange={(e) => updateOverview("labelCourts", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Label Ab Preis</Label>
              <Input
                value={content.overview.labelFromPrice}
                onChange={(e) => updateOverview("labelFromPrice", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Label Status</Label>
              <Input
                value={content.overview.labelStatus}
                onChange={(e) => updateOverview("labelStatus", e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="text-sm font-semibold text-slate-700">Abschnitt: Plätze</div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Titel</Label>
              <Input
                value={content.sections.courts.title}
                onChange={(e) => updateSection("courts", "title", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Untertitel</Label>
              <Input
                value={content.sections.courts.subtitle}
                onChange={(e) => updateSection("courts", "subtitle", e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="text-sm font-semibold text-slate-700">Abschnitt: Mitgliedschaft</div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Titel</Label>
              <Input
                value={content.sections.membership.title}
                onChange={(e) => updateSection("membership", "title", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Untertitel</Label>
              <Input
                value={content.sections.membership.subtitle}
                onChange={(e) => updateSection("membership", "subtitle", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>CTA Button Text</Label>
              <Input
                value={content.sections.membership.ctaLabel}
                onChange={(e) => updateSection("membership", "ctaLabel", e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="text-sm font-semibold text-slate-700">Impressum</div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Impressum Titel</Label>
              <Input
                value={content.impressum.title}
                onChange={(e) => updateImpressum("title", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Footer Link Text</Label>
              <Input
                value={content.footer.impressumLinkText}
                onChange={(e) => updateFooter("impressumLinkText", e.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Impressum Inhalt</Label>
              <textarea
                className="min-h-[160px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
                value={content.impressum.body}
                onChange={(e) => updateImpressum("body", e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="text-sm font-semibold text-slate-700">Footer & SEO</div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Footer Text</Label>
              <Input
                value={content.footer.smallText}
                onChange={(e) => updateFooter("smallText", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>SEO Description</Label>
              <Input
                value={content.seo.description}
                onChange={(e) => updateSeo("description", e.target.value)}
              />
            </div>
          </div>
        </section>
      </CardContent>
    </Card>
  )
}
