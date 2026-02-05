"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { uploadMemberDocument } from "@/app/actions"

type MemberDocument = {
  id: string
  doc_type: string
  file_name: string
  ai_status: string
  review_status: string
  temp_valid_until: string | null
  valid_until: string | null
  created_at: string
}

type MemberDocumentsFormProps = {
  clubSlug: string
  documents: MemberDocument[]
}

export function MemberDocumentsForm({ clubSlug, documents }: MemberDocumentsFormProps) {
  const [message, setMessage] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setUploading(true)
    setMessage(null)
    const form = event.currentTarget
    const formData = new FormData(form)
    formData.set("clubSlug", clubSlug)
    const res = await uploadMemberDocument(formData)
    if (res?.success) {
      setMessage("Upload erfolgreich. Prüfung läuft.")
      form.reset()
      window.location.reload()
    } else {
      setMessage(res?.error || "Upload fehlgeschlagen.")
    }
    setUploading(false)
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200/60 bg-white/90 p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Dokument hochladen</h2>
          <p className="text-sm text-slate-500">
            Lade dein ärztliches Zeugnis oder deinen Vertrag hoch.
          </p>
        </div>
        <div className="grid gap-3">
          <label className="text-sm text-slate-600">Dokumenttyp</label>
          <select name="docType" className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm">
            <option value="medical_certificate">Ärztliches Zeugnis</option>
            <option value="contract">Mitgliedsvertrag</option>
          </select>
          <label className="text-sm text-slate-600">Datei</label>
          <input
            type="file"
            name="file"
            accept="image/*,application/pdf"
            className="text-sm"
            required
          />
        </div>
        <Button type="submit" className="rounded-full" disabled={uploading}>
          {uploading ? "Lade hoch..." : "Upload"}
        </Button>
        {message && <div className="text-xs text-slate-500">{message}</div>}
      </form>

      <div className="rounded-2xl border border-slate-200/60 bg-white/90 p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-800">Deine Dokumente</h3>
        {documents.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">Noch keine Dokumente hochgeladen.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {documents.map((doc) => (
              <div key={doc.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200/60 bg-white/90 px-3 py-2 text-sm">
                <div>
                  <div className="font-medium text-slate-800">{doc.file_name}</div>
                  <div className="text-xs text-slate-500">
                    KI: {doc.ai_status} · Review: {doc.review_status}
                  </div>
                </div>
                <div className="text-xs text-slate-500">
                  {doc.valid_until
                    ? `Gültig bis ${new Date(doc.valid_until).toLocaleDateString("de-DE")}`
                    : doc.temp_valid_until
                    ? `Vorläufig bis ${new Date(doc.temp_valid_until).toLocaleDateString("de-DE")}`
                    : "Nicht gültig"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
