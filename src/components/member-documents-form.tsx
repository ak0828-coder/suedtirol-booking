"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { getMemberDocumentSignedUrl, uploadMemberDocument } from "@/app/actions"
import { useI18n } from "@/components/i18n/locale-provider"
import { useParams } from "next/navigation"

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
  const [openingId, setOpeningId] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const { t } = useI18n()
  const params = useParams()
  const langRaw = params?.lang
  const lang = typeof langRaw === "string" ? langRaw : Array.isArray(langRaw) ? langRaw[0] : "de"
  const locale = lang === "it" ? "it-IT" : lang === "en" ? "en-US" : "de-DE"

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setUploading(true)
    setMessage(null)
    const form = event.currentTarget
    const formData = new FormData(form)
    formData.set("clubSlug", clubSlug)
    const res = await uploadMemberDocument(formData)
    if (res?.success) {
      setMessage(t("member_docs.upload_success", "Upload erfolgreich. Prüfung läuft."))
      form.reset()
      window.location.reload()
    } else {
      setMessage(res?.error || t("member_docs.upload_error", "Upload fehlgeschlagen."))
    }
    setUploading(false)
  }

  return (
    <div className="space-y-6">
      <form
        id="tour-documents-upload"
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200/60 bg-white/90 p-6 shadow-sm space-y-4"
      >
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{t("member_docs.title", "Dokument hochladen")}</h2>
          <p className="text-sm text-slate-500">
            {t("member_docs.subtitle", "Lade dein ärztliches Zeugnis oder deinen Vertrag hoch.")}
          </p>
        </div>
        <div className="grid gap-3">
          <label className="text-sm text-slate-600">{t("member_docs.type", "Dokumenttyp")}</label>
          <select name="docType" className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm">
            <option value="medical_certificate">{t("member_docs.medical", "Ärztliches Zeugnis")}</option>
            <option value="contract">{t("member_docs.contract", "Mitgliedsvertrag")}</option>
          </select>
          <label className="text-sm text-slate-600">{t("member_docs.file", "Datei")}</label>
          <input
            type="file"
            name="file"
            accept="image/*,application/pdf"
            className="text-sm"
            required
          />
        </div>
        <Button type="submit" className="rounded-full" disabled={uploading}>
          {uploading ? t("member_docs.uploading", "Lade hoch...") : t("member_docs.upload", "Upload")}
        </Button>
        {message && <div className="text-xs text-slate-500">{message}</div>}
      </form>

      <div
        id="tour-documents-list"
        className="rounded-2xl border border-slate-200/60 bg-white/90 p-6 shadow-sm"
      >
        <h3 className="text-sm font-semibold text-slate-800">{t("member_docs.list_title", "Deine Dokumente")}</h3>
        {documents.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">{t("member_docs.empty", "Noch keine Dokumente hochgeladen.")}</p>
        ) : (
          <div className="mt-3 space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200/60 bg-white/90 px-3 py-2 text-sm"
              >
                <div>
                  <div className="font-medium text-slate-800">{doc.file_name}</div>
                  <div className="text-xs text-slate-500">
                    {t("member_docs.ai", "KI")}: {doc.ai_status} · {t("member_docs.review", "Review")}: {doc.review_status}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-500">
                    <span>{t("member_docs.upload_label", "Upload")}</span>
                    <span>?</span>
                    <span>
                      {doc.ai_status === "ok"
                        ? t("member_docs.ai_ok", "KI ok")
                        : doc.ai_status === "reject"
                        ? t("member_docs.ai_reject", "KI abgelehnt")
                        : t("member_docs.ai_check", "KI prüft")}
                    </span>
                    <span>?</span>
                    <span>
                      {doc.review_status === "approved"
                        ? t("member_docs.approved", "Bestätigt")
                        : doc.review_status === "rejected"
                        ? t("member_docs.rejected", "Abgelehnt")
                        : t("member_docs.pending", "Wartet")}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-slate-500">
                  {doc.valid_until
                    ? t("member_docs.valid_until", "Gültig bis {date}").replace("{date}", new Date(doc.valid_until).toLocaleDateString(locale))
                    : doc.temp_valid_until
                    ? t("member_docs.temp_until", "Vorläufig bis {date}").replace("{date}", new Date(doc.temp_valid_until).toLocaleDateString(locale))
                    : t("member_docs.invalid", "Nicht gültig")}
                </div>
                <Button
                  variant="outline"
                  className="rounded-full text-xs"
                  disabled={openingId === doc.id}
                  onClick={async () => {
                    setOpeningId(doc.id)
                    const res = await getMemberDocumentSignedUrl(clubSlug, doc.id)
                    if (res?.success && res.url) {
                      setPreviewUrl(res.url)
                    } else {
                      setMessage(res?.error || t("member_docs.open_error", "Dokument konnte nicht geöffnet werden."))
                    }
                    setOpeningId(null)
                  }}
                >
                  {t("member_docs.open", "Öffnen")}
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full text-xs"
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
                      setMessage(res?.error || t("member_docs.download_error", "Download fehlgeschlagen."))
                    }
                    setOpeningId(null)
                  }}
                >
                  {t("member_docs.download", "Download")}
                </Button>
              </div>
            ))}
          </div>
        )}
        {previewUrl && (
          <div className="mt-4 rounded-xl border border-slate-200/60 bg-white/90 p-3">
            <div className="mb-2 text-xs text-slate-500">{t("member_docs.preview", "Vorschau")}</div>
            <iframe src={previewUrl} className="h-80 w-full rounded-lg border border-slate-200/60" />
          </div>
        )}
      </div>
    </div>
  )
}
