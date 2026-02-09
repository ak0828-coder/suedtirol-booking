"use client"

import React, { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { updateMembershipContract } from "@/app/actions"

type ContractField = {
  key: string
  label: string
  type?: "text" | "textarea" | "checkbox"
  required?: boolean
  placeholder?: string | null
}

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
  contractFields,
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
  contractFields: ContractField[]
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
  const [fields, setFields] = useState<ContractField[]>(Array.isArray(contractFields) ? contractFields : [])
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
            fields,
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
        const message = err instanceof Error ? err.message : "PDF Vorschau nicht Verfügbar."
        setPreviewError(message || "PDF Vorschau nicht Verfügbar.")
      } finally {
        setPreviewLoading(false)
      }
    }

    run()

    return () => {
      controller.abort()
    }
  }, [clubSlug, isClient, lastUpdated, previewBody, previewTitle, version, fields])

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
      Number(pricingValue || 0),
      fields
    )
    setSaving(false)
  }

  const addField = () => {
    setFields((prev) => [
      ...(Array.isArray(prev) ? prev : []),
      {
        key: `feld_${Date.now()}`,
        label: "Neues Feld",
        type: "text",
        required: false,
        placeholder: "",
      },
    ])
  }

  const updateField = (index: number, patch: Partial<ContractField>) => {
    setFields((prev) => {
      const next = Array.isArray(prev) ? [...prev] : []
      next[index] = { ...next[index], ...patch }
      return next
    })
  }

  const removeField = (index: number) => {
    setFields((prev) => {
      const next = Array.isArray(prev) ? [...prev] : []
      next.splice(index, 1)
      return next
    })
  }

  const normalizeKey = (raw: string) =>
    raw
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_]+/g, "_")
      .replace(/^_+|_+$/g, "")

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
            <p className="text-xs text-slate-500">
              Platzhalter: <code>{"{{name}}"}</code>, <code>{"{{email}}"}</code>, <code>{"{{address}}"}</code>,{" "}
              <code>{"{{fee}}"}</code> und eigene Felder z.B. <code>{"{{mitgliedsnummer}}"}</code>.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900">Zusatzfelder</div>
                <div className="text-xs text-slate-500">Diese Felder sehen Mitglieder im Formular.</div>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addField}>
                Feld hinzufuegen
              </Button>
            </div>
            {fields.length === 0 ? (
              <div className="text-xs text-slate-500">Keine Zusatzfelder definiert.</div>
            ) : (
              <div className="space-y-3">
                {fields.map((field, idx) => (
                  <div key={`${field.key}-${idx}`} className="rounded-lg border border-slate-200 bg-white p-3 space-y-2">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs font-medium">Label</label>
                        <Input
                          value={field.label}
                          onChange={(e) => updateField(idx, { label: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium">Key</label>
                        <Input
                          value={field.key}
                          onChange={(e) => updateField(idx, { key: normalizeKey(e.target.value) })}
                        />
                      </div>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium">Typ</label>
                        <select
                          className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-xs"
                          value={field.type || "text"}
                          onChange={(e) => updateField(idx, { type: e.target.value as ContractField["type"] })}
                        >
                          <option value="text">Text</option>
                          <option value="textarea">Textfeld</option>
                          <option value="checkbox">Checkbox</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium">Placeholder</label>
                        <Input
                          value={field.placeholder || ""}
                          onChange={(e) => updateField(idx, { placeholder: e.target.value })}
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-5">
                        <input
                          type="checkbox"
                          checked={!!field.required}
                          onChange={(e) => updateField(idx, { required: e.target.checked })}
                        />
                        <span className="text-xs">Pflichtfeld</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div>
                        Platzhalter: <code>{`{{${field.key || "feld"}}}`}</code>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeField(idx)}>
                        Entfernen
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
          <p className="text-sm text-slate-500">So sieht der Vertrag für Mitglieder aus.</p>
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
                  PDF öffnen
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

