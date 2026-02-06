"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { updateMembershipContract } from "@/app/actions"
import { ContractPdfDocument } from "@/lib/contract-pdf"

const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((m) => m.PDFViewer),
  { ssr: false }
)

export function ContractEditor({
  clubSlug,
  clubName,
  initialTitle,
  initialBody,
  initialFee,
  feeEnabled,
  allowSubscription,
  version,
  updatedAt,
}: {
  clubSlug: string
  clubName: string
  initialTitle: string
  initialBody: string
  initialFee: number
  feeEnabled: boolean
  allowSubscription: boolean
  version: number
  updatedAt?: string | null
}) {
  const [title, setTitle] = useState(initialTitle)
  const [body, setBody] = useState(initialBody)
  const [fee, setFee] = useState(String(initialFee || 0))
  const [feeIsEnabled, setFeeIsEnabled] = useState(!!feeEnabled)
  const [allowSub, setAllowSub] = useState(!!allowSubscription)
  const [saving, setSaving] = useState(false)
  const lastUpdated = updatedAt ? new Date(updatedAt).toLocaleDateString("de-DE") : "—"
  const [previewTitle, setPreviewTitle] = useState(initialTitle)
  const [previewBody, setPreviewBody] = useState(initialBody)

  useEffect(() => {
    const t = setTimeout(() => {
      setPreviewTitle(title)
      setPreviewBody(body)
    }, 180)
    return () => clearTimeout(t)
  }, [title, body])

  const handleSave = async () => {
    setSaving(true)
    await updateMembershipContract(
      clubSlug,
      title,
      body,
      Number(fee || 0),
      feeIsEnabled,
      allowSub
    )
    setSaving(false)
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <Card className="rounded-2xl border border-slate-200/60 bg-white/80 shadow-sm">
        <CardHeader>
          <CardTitle>Mitgliedsvertrag (Digital)</CardTitle>
          <p className="text-sm text-slate-500">
            Version {version} · Letztes Update: {lastUpdated}
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
              placeholder="Schreibe hier die Mitgliedsbeitrag-Erklärung / Vertrag..."
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Mitgliedsbeitrag (€)</label>
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
            <PDFViewer width="100%" height="100%" showToolbar={false}>
              <ContractPdfDocument
                clubName={clubName}
                title={previewTitle}
                body={previewBody}
                version={version}
                updatedAt={lastUpdated}
              />
            </PDFViewer>
          </div>
          <div className="mt-3 text-xs text-slate-500">Live‑Preview während du tippst.</div>
        </CardContent>
      </Card>
    </div>
  )
}
