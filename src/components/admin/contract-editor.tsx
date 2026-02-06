"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { updateMembershipContract } from "@/app/actions"

export function ContractEditor({
  clubSlug,
  initialTitle,
  initialBody,
  version,
  updatedAt,
}: {
  clubSlug: string
  initialTitle: string
  initialBody: string
  version: number
  updatedAt?: string | null
}) {
  const [title, setTitle] = useState(initialTitle)
  const [body, setBody] = useState(initialBody)
  const [saving, setSaving] = useState(false)
  const lastUpdated = updatedAt ? new Date(updatedAt).toLocaleDateString("de-DE") : "—"

  const handleSave = async () => {
    setSaving(true)
    await updateMembershipContract(clubSlug, title, body)
    setSaving(false)
  }

  return (
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
        <Button className="rounded-full" onClick={handleSave} disabled={saving}>
          {saving ? "Speichere..." : "Vertrag speichern"}
        </Button>
      </CardContent>
    </Card>
  )
}
