"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { getMemberDocumentSignedUrl, reviewMemberDocument } from "@/app/actions"

type AdminDoc = {
  id: string
  file_name: string
  doc_type: string
  ai_status: string
  ai_reason: string | null
  review_status: string
  temp_valid_until: string | null
  valid_until: string | null
  created_at: string
}

type MemberDocumentsAdminProps = {
  clubSlug: string
  documents: AdminDoc[]
}

export function MemberDocumentsAdmin({ clubSlug, documents }: MemberDocumentsAdminProps) {
  const [message, setMessage] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [openingId, setOpeningId] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleReview = async (id: string, approve: boolean) => {
    setSavingId(id)
    setMessage(null)
    const res = await reviewMemberDocument(clubSlug, id, approve)
    if (res?.success) {
      setMessage(approve ? "Dokument bestätigt." : "Dokument abgelehnt.")
      window.location.reload()
    } else {
      setMessage(res?.error || "Aktion fehlgeschlagen.")
    }
    setSavingId(null)
  }

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white/90 p-6 shadow-sm space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Dokumente</h2>
        <p className="text-sm text-slate-500">Prüfe und bestätige medizinische Nachweise.</p>
      </div>
      {documents.length === 0 ? (
        <p className="text-sm text-slate-500">Keine Dokumente vorhanden.</p>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div key={doc.id} className="rounded-xl border border-slate-200/60 bg-white/90 px-3 py-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-medium text-slate-800">{doc.file_name}</div>
                  <div className="text-xs text-slate-500">
                    KI: {doc.ai_status} · Review: {doc.review_status}
                  </div>
                  {doc.ai_reason && (
                    <div className="text-xs text-slate-500">KI‑Hinweis: {doc.ai_reason}</div>
                  )}
                </div>
                <div className="text-xs text-slate-500">
                  {doc.valid_until
                    ? `Gültig bis ${new Date(doc.valid_until).toLocaleDateString("de-DE")}`
                    : doc.temp_valid_until
                    ? `Vorläufig bis ${new Date(doc.temp_valid_until).toLocaleDateString("de-DE")}`
                    : "Nicht gültig"}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  className="rounded-full"
                  disabled={openingId === doc.id}
                  onClick={async () => {
                    setOpeningId(doc.id)
                    const res = await getMemberDocumentSignedUrl(clubSlug, doc.id)
                    if (res?.success && res.url) {
                      setPreviewUrl(res.url)
                    } else {
                      setMessage(res?.error || "Dokument konnte nicht geöffnet werden.")
                    }
                    setOpeningId(null)
                  }}
                >
                  Öffnen
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full"
                  disabled={openingId === doc.id}
                  onClick={async () => {
                    setOpeningId(doc.id)
                    const res = await getMemberDocumentSignedUrl(clubSlug, doc.id)
                    if (res?.success && res.url) {
                      const link = document.createElement("a")
                      link.href = res.url
                      link.download = doc.file_name
                      link.click()
                    } else {
                      setMessage(res?.error || "Download fehlgeschlagen.")
                    }
                    setOpeningId(null)
                  }}
                >
                  Download
                </Button>
                <Button
                  className="rounded-full"
                  disabled={savingId === doc.id}
                  onClick={() => handleReview(doc.id, true)}
                >
                  Bestätigen
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full"
                  disabled={savingId === doc.id}
                  onClick={() => handleReview(doc.id, false)}
                >
                  Ablehnen
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      {message && <div className="text-xs text-slate-500">{message}</div>}
      {previewUrl && (
        <div className="rounded-xl border border-slate-200/60 bg-white/90 p-3">
          <div className="mb-2 text-xs text-slate-500">Vorschau</div>
          <iframe src={previewUrl} className="h-96 w-full rounded-lg border border-slate-200/60" />
        </div>
      )}
    </div>
  )
}
