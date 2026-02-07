"use client"

import React, { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { updateMembershipContract } from "@/app/actions"

export function ContractEditor({
  clubSlug,
  clubName,
  clubLogoUrl,
  initialTitle,
  initialBody,
  initialFee,
  feeEnabled,
  allowSubscription,
  memberPricingMode,
  memberPricingValue,
  version,
  updatedAt,
}: {
  clubSlug: string
  clubName: string
  clubLogoUrl?: string | null
  initialTitle: string
  initialBody: string
  initialFee: number
  feeEnabled: boolean
  allowSubscription: boolean
  memberPricingMode: string
  memberPricingValue: number
  version: number
  updatedAt?: string | null
}) {
  const [title, setTitle] = useState(initialTitle)
  const [body, setBody] = useState(initialBody)
  const [fee, setFee] = useState(String(initialFee || 0))
  const [feeIsEnabled, setFeeIsEnabled] = useState(!!feeEnabled)
  const [allowSub, setAllowSub] = useState(!!allowSubscription)
  const [pricingMode, setPricingMode] = useState(memberPricingMode || "full_price")
  const [pricingValue, setPricingValue] = useState(String(memberPricingValue || 0))
  const [saving, setSaving] = useState(false)
  const lastUpdated = updatedAt ? new Date(updatedAt).toLocaleDateString("de-DE") : "-"
  const [previewTitle, setPreviewTitle] = useState(initialTitle)
  const [previewBody, setPreviewBody] = useState(initialBody)
  const [isClient, setIsClient] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const previewAbortRef = useRef<AbortController | null>(null)
  const previewUrlRef = useRef<string | null>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => {
      setPreviewTitle(title)
      setPreviewBody(body)
    }, 180)
    return () => clearTimeout(t)
  }, [title, body])

  useEffect(() => {
    if (!isClient) return

    const controller = new AbortController()
    previewAbortRef.current?.abort()
    previewAbortRef.current = controller

    const run = async () => {
      setPreviewLoading(true)
      setPreviewError(null)
      try {
        const res = await fetch(`/api/contract-pdf/${clubSlug}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: previewTitle,
            body: previewBody,
            version,
            updatedAt: lastUpdated,
          }),
          signal: controller.signal,
        })
        if (!res.ok) {
          throw new Error("Preview request failed")
        }
        const blob = await res.blob()
        const nextUrl = URL.createObjectURL(blob)
        if (previewUrlRef.current) {
          URL.revokeObjectURL(previewUrlRef.current)
        }
        previewUrlRef.current = nextUrl
        setPreviewUrl(nextUrl)
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return
        setPreviewError("PDF Vorschau nicht verfuegbar.")
      } finally {
        setPreviewLoading(false)
      }
    }

    run()

    return () => {
      controller.abort()
    }
  }, [clubSlug, isClient, lastUpdated, previewBody, previewTitle, version])

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current)
      }
    }
  }, [])

  const handleSave = async () => {
    setSaving(true)
    await updateMembershipContract(
      clubSlug,
      title,
      body,
      Number(fee || 0),
      feeIsEnabled,
      allowSub,
      pricingMode,
      Number(pricingValue || 0)
    )
    setSaving(false)
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <Card className="rounded-2xl border border-slate-200/60 bg-white/80 shadow-sm">
        <CardHeader>
          <CardTitle>Mitgliedsvertrag (Digital)</CardTitle>
          <p className="text-sm text-slate-500">
            Version {version} - Letztes Update: {lastUpdated}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Titel</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Vertragstext</label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              placeholder="Schreibe hier die Mitgliedsbeitrag-Erklaerung / Vertrag..."
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Mitgliedsbeitrag (EUR)</label>
              <Input value={fee} onChange={(e) => setFee(e.target.value)} type="number" min="0" step="0.01" />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                checked={feeIsEnabled}
                onChange={(e) => setFeeIsEnabled(e.target.checked)}
              />
              <span className="text-sm">Einmalzahlung erlauben</span>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                checked={allowSub}
                onChange={(e) => setAllowSub(e.target.checked)}
              />
              <span className="text-sm">Abo per Stripe erlauben</span>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-2">
              <label className="text-sm font-medium">Mitgliederpreis pro Platz</label>
              <select
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                value={pricingMode}
                onChange={(e) => setPricingMode(e.target.value)}
              >
                <option value="full_price">Kein Vorteil</option>
                <option value="discount_percent">Rabatt in %</option>
                <option value="member_price">Fixpreis (Mitgliederpreis)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Wert</label>
              <Input
                value={pricingValue}
                onChange={(e) => setPricingValue(e.target.value)}
                type="number"
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <Button className="rounded-full" onClick={handleSave} disabled={saving}>
            {saving ? "Speichere..." : "Vertrag speichern"}
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-slate-200/60 bg-white/80 shadow-sm">
        <CardHeader>
          <CardTitle>PDF Vorschau</CardTitle>
          <p className="text-sm text-slate-500">So sieht der Vertrag fuer Mitglieder aus.</p>
        </CardHeader>
        <CardContent>
          <div className="aspect-[3/4] w-full rounded-xl border border-slate-200 bg-white overflow-hidden">
            {!isClient && (
              <div className="h-full flex items-center justify-center text-sm text-slate-400">
                PDF Vorschau wird geladen...
              </div>
            )}
            {isClient && previewError && (
              <div className="h-full w-full flex flex-col items-center justify-center text-center text-sm text-slate-500 px-4">
                <div className="font-medium text-slate-700">{previewError}</div>
                <div className="mt-1">Bitte oeffne die PDF in einem neuen Tab.</div>
                <a
                  href={`/api/contract-pdf/${clubSlug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 hover:bg-slate-50"
                >
                  PDF oeffnen
                </a>
              </div>
            )}
            {isClient && !previewError && previewUrl && (
              <iframe title="PDF Vorschau" src={previewUrl} className="h-full w-full" />
            )}
            {isClient && !previewError && !previewUrl && (
              <div className="h-full flex items-center justify-center text-sm text-slate-400">
                {previewLoading ? "PDF Vorschau wird geladen..." : "PDF Vorschau wird vorbereitet..."}
              </div>
            )}
          </div>
          <div className="mt-3 text-xs text-slate-500">Live-Preview waehrend du tippst.</div>
        </CardContent>
      </Card>
    </div>
  )
}
