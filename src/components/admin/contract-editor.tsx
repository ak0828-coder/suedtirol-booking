"use client"

import React, { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { updateMembershipContract } from "@/app/actions"
import { useI18n } from "@/components/i18n/locale-provider"
import { useParams } from "next/navigation"

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
  memberPricingMode: string
  memberPricingValue: number
  contractFields: ContractField[]
  version: number
  updatedAt?: string | null
}) {
  const [title, setTitle] = useState(initialTitle)
  const [body, setBody] = useState(initialBody)
  const [fee, setFee] = useState(String(initialFee || 0))
  const [pricingMode, setPricingMode] = useState(memberPricingMode || "full_price")
  const [pricingValue, setPricingValue] = useState(String(memberPricingValue || 0))
  const [fields, setFields] = useState<ContractField[]>(Array.isArray(contractFields) ? contractFields : [])
  const [saving, setSaving] = useState(false)
  const [previewTitle, setPreviewTitle] = useState(initialTitle)
  const [previewBody, setPreviewBody] = useState(initialBody)
  const [isClient, setIsClient] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const previewAbortRef = useRef<AbortController | null>(null)
  const previewUrlRef = useRef<string | null>(null)
  const { t } = useI18n()
  const params = useParams()
  const langRaw = params?.lang
  const lang = typeof langRaw === "string" ? langRaw : Array.isArray(langRaw) ? langRaw[0] : "de"
  const locale = lang === "it" ? "it-IT" : lang === "en" ? "en-US" : "de-DE"
  const lastUpdated = updatedAt ? new Date(updatedAt).toLocaleDateString(locale) : "-"

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    const tmr = setTimeout(() => {
      setPreviewTitle(title)
      setPreviewBody(body)
    }, 180)
    return () => clearTimeout(tmr)
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
        const message = err instanceof Error ? err.message : t("admin_contract.preview_unavailable", "PDF Vorschau nicht Verfügbar.")
        setPreviewError(message || t("admin_contract.preview_unavailable", "PDF Vorschau nicht Verfügbar."))
      } finally {
        setPreviewLoading(false)
      }
    }

    run()

    return () => {
      controller.abort()
    }
  }, [clubSlug, isClient, lastUpdated, previewBody, previewTitle, version, fields, t])

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
      false,
      true,
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
        key: `field_${Date.now()}`,
        label: t("admin_contract.new_field", "Neues Feld"),
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
          <CardTitle>{t("admin_contract.title", "Mitgliedsvertrag (Digital)")}</CardTitle>
          <p className="text-sm text-slate-500">
            {t("admin_contract.version", "Version")} {version} - {t("admin_contract.last_update", "Letztes Update")}: {lastUpdated}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("admin_contract.field_title", "Titel")}</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("admin_contract.body", "Vertragstext")}</label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              placeholder={t("admin_contract.body_placeholder", "Schreibe hier die Mitgliedsbeitrag-Erklärung / Vertrag...")}
            />
            <p className="text-xs text-slate-500">
              {t("admin_contract.placeholders", "Platzhalter")}: <code>{"{{name}}"}</code>, <code>{"{{email}}"}</code>, <code>{"{{address}}"}</code>, <code>{"{{fee}}"}</code> {t("admin_contract.custom_fields", "und eigene Felder z.B.")} <code>{"{{mitgliedsnummer}}"}</code>.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200/70 bg-slate-50/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900">{t("admin_contract.extra_fields", "Zusatzfelder")}</div>
                <div className="text-xs text-slate-500">{t("admin_contract.extra_fields_hint", "Diese Felder sehen Mitglieder im Formular.")}</div>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addField}>
                {t("admin_contract.add_field", "Feld hinzufügen")}
              </Button>
            </div>
            {fields.length === 0 ? (
              <div className="text-xs text-slate-500">{t("admin_contract.no_fields", "Keine Zusatzfelder definiert.")}</div>
            ) : (
              <div className="space-y-3">
                {fields.map((field, idx) => (
                  <div key={`${field.key}-${idx}`} className="rounded-lg border border-slate-200 bg-white p-3 space-y-2">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs font-medium">{t("admin_contract.label", "Label")}</label>
                        <Input
                          value={field.label}
                          onChange={(e) => updateField(idx, { label: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium">{t("admin_contract.key", "Key")}</label>
                        <Input
                          value={field.key}
                          onChange={(e) => updateField(idx, { key: normalizeKey(e.target.value) })}
                        />
                      </div>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium">{t("admin_contract.type", "Typ")}</label>
                        <select
                          className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-xs"
                          value={field.type || "text"}
                          onChange={(e) => updateField(idx, { type: e.target.value as ContractField["type"] })}
                        >
                          <option value="text">{t("admin_contract.type_text", "Text")}</option>
                          <option value="textarea">{t("admin_contract.type_textarea", "Textfeld")}</option>
                          <option value="checkbox">{t("admin_contract.type_checkbox", "Checkbox")}</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium">{t("admin_contract.placeholder", "Placeholder")}</label>
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
                        <span className="text-xs">{t("admin_contract.required", "Pflichtfeld")}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div>
                        {t("admin_contract.placeholder_label", "Platzhalter")}:
                        <code>{`{{${field.key || "field"}}}`}</code>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeField(idx)}>
                        {t("admin_contract.remove", "Entfernen")}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("admin_contract.fee", "Mitgliedsbeitrag (Abo, EUR)")}</label>
              <Input value={fee} onChange={(e) => setFee(e.target.value)} type="number" min="0" step="0.01" />
            </div>
            <div className="text-xs text-slate-500 pt-6">
              {t("admin_contract.subscription_only", "Mitgliedschaften laufen ausschließlich als Abo.")}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("admin_contract.member_price", "Mitgliederpreis pro Platz")}</label>
              <select
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                value={pricingMode}
                onChange={(e) => setPricingMode(e.target.value)}
              >
                <option value="full_price">{t("admin_contract.member_price_none", "Kein Vorteil")}</option>
                <option value="discount_percent">{t("admin_contract.member_price_discount", "Rabatt in %")}</option>
                <option value="member_price">{t("admin_contract.member_price_fixed", "Fixpreis (Mitgliederpreis)")}</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("admin_contract.value", "Wert")}</label>
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
            {saving ? t("admin_contract.saving", "Speichere...") : t("admin_contract.save", "Vertrag speichern")}
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-slate-200/60 bg-white/80 shadow-sm">
        <CardHeader>
          <CardTitle>{t("admin_contract.preview", "PDF Vorschau")}</CardTitle>
          <p className="text-sm text-slate-500">{t("admin_contract.preview_hint", "So sieht der Vertrag für Mitglieder aus.")}</p>
        </CardHeader>
        <CardContent>
          <div className="aspect-[3/4] w-full rounded-xl border border-slate-200 bg-white overflow-hidden">
            {!isClient && (
              <div className="h-full flex items-center justify-center text-sm text-slate-400">
                {t("admin_contract.preview_loading", "PDF Vorschau wird geladen...")}
              </div>
            )}
            {isClient && previewError && (
              <div className="h-full w-full flex flex-col items-center justify-center text-center text-sm text-slate-500 px-4">
                <div className="font-medium text-slate-700">{previewError}</div>
                <div className="mt-1">{t("admin_contract.preview_open", "Bitte öffne die PDF in einem neuen Tab.")}</div>
                <a
                  href={`/api/contract-pdf/${clubSlug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 hover:bg-slate-50"
                >
                  {t("admin_contract.open_pdf", "PDF öffnen")}
                </a>
              </div>
            )}
            {isClient && !previewError && previewUrl && (
              <iframe title="PDF Vorschau" src={previewUrl} className="h-full w-full" />
            )}
            {isClient && !previewError && !previewUrl && (
              <div className="h-full flex items-center justify-center text-sm text-slate-400">
                {previewLoading ? t("admin_contract.preview_loading", "PDF Vorschau wird geladen...") : t("admin_contract.preview_preparing", "PDF Vorschau wird vorbereitet...")}
              </div>
            )}
          </div>
          <div className="mt-3 text-xs text-slate-500">{t("admin_contract.live_preview", "Live-Preview während du tippst.")}</div>
        </CardContent>
      </Card>
    </div>
  )
}
