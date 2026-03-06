"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getMemberDocumentSignedUrl, uploadMemberDocument } from "@/app/actions"
import { useI18n } from "@/components/i18n/locale-provider"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Upload, FileText, Image as ImageIcon, CheckCircle2, XCircle,
  Clock, ShieldCheck, AlertTriangle, Loader2, Eye, Download,
  ArrowRight, Stethoscope, FileSignature,
} from "lucide-react"

type MemberDocument = {
  id: string
  doc_type: string
  file_name: string
  mime_type?: string
  ai_status: string
  ai_reason?: string | null
  ai_confidence?: number | null
  review_status: string
  temp_valid_until: string | null
  valid_until: string | null
  created_at: string
}

type MemberDocumentsFormProps = {
  clubSlug: string
  documents: MemberDocument[]
}

const DOC_TYPES = [
  {
    value: "medical_certificate",
    icon: Stethoscope,
    label: "Ärztliches Zeugnis",
    desc: "Sportmedizinisches Attest (italiano)",
  },
  {
    value: "contract",
    icon: FileSignature,
    label: "Mitgliedsvertrag",
    desc: "Unterschriebener Mitgliedsvertrag",
  },
]

function AiStatusBadge({ status, reason }: { status: string; reason?: string | null }) {
  if (status === "ok") {
    return (
      <Badge className="bg-green-100 text-green-700 border-green-200 gap-1 font-normal">
        <CheckCircle2 className="w-3 h-3" /> KI: OK
      </Badge>
    )
  }
  if (status === "reject") {
    return (
      <Badge className="bg-red-100 text-red-700 border-red-200 gap-1 font-normal" title={reason || ""}>
        <XCircle className="w-3 h-3" /> KI: Abgelehnt
      </Badge>
    )
  }
  if (status === "error") {
    return (
      <Badge className="bg-amber-100 text-amber-700 border-amber-200 gap-1 font-normal">
        <AlertTriangle className="w-3 h-3" /> KI-Fehler
      </Badge>
    )
  }
  return (
    <Badge className="bg-slate-100 text-slate-600 border-slate-200 gap-1 font-normal">
      <Clock className="w-3 h-3" /> KI prüft…
    </Badge>
  )
}

function ReviewStatusBadge({ status }: { status: string }) {
  if (status === "approved") {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 gap-1 font-normal">
        <ShieldCheck className="w-3 h-3" /> Admin: OK
      </Badge>
    )
  }
  if (status === "rejected") {
    return (
      <Badge className="bg-red-100 text-red-700 border-red-200 gap-1 font-normal">
        <XCircle className="w-3 h-3" /> Admin: Abgelehnt
      </Badge>
    )
  }
  return (
    <Badge className="bg-slate-100 text-slate-600 border-slate-200 gap-1 font-normal">
      <Clock className="w-3 h-3" /> Wartet auf Admin
    </Badge>
  )
}

function ValidityBadge({ doc, locale }: { doc: MemberDocument; locale: string }) {
  const now = new Date()
  if (doc.valid_until) {
    const d = new Date(doc.valid_until)
    const isValid = d > now
    return (
      <Badge className={`gap-1 font-normal ${isValid ? "bg-green-100 text-green-700 border-green-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
        <CheckCircle2 className="w-3 h-3" />
        {isValid ? "Gültig bis" : "Abgelaufen"}: {d.toLocaleDateString(locale)}
      </Badge>
    )
  }
  if (doc.temp_valid_until) {
    const d = new Date(doc.temp_valid_until)
    const isValid = d > now
    return (
      <Badge className={`gap-1 font-normal ${isValid ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
        <Clock className="w-3 h-3" />
        {isValid ? "Vorläufig bis" : "Vorläufig abgelaufen"}: {d.toLocaleDateString(locale)}
      </Badge>
    )
  }
  return (
    <Badge className="bg-red-100 text-red-700 border-red-200 gap-1 font-normal">
      <XCircle className="w-3 h-3" /> Nicht gültig
    </Badge>
  )
}

export function MemberDocumentsForm({ clubSlug, documents }: MemberDocumentsFormProps) {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [docType, setDocType] = useState("medical_certificate")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [openingId, setOpeningId] = useState<string | null>(null)
  const [docPreviewUrl, setDocPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { t } = useI18n()
  const params = useParams()
  const langRaw = params?.lang
  const lang = typeof langRaw === "string" ? langRaw : Array.isArray(langRaw) ? langRaw[0] : "de"
  const locale = lang === "it" ? "it-IT" : lang === "en" ? "en-US" : "de-DE"

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file)
    if (!file) { setPreviewUrl(null); return }
    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => setPreviewUrl(e.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      setPreviewUrl(null)
    }
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileChange(file)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) return
    setUploading(true)
    const formData = new FormData()
    formData.set("clubSlug", clubSlug)
    formData.set("docType", docType)
    formData.set("file", selectedFile)
    const res = await uploadMemberDocument(formData)
    setUploading(false)

    if (!res?.success) {
      toast.error(res?.error || "Upload fehlgeschlagen.")
      return
    }

    // Show AI result feedback
    const aiStatus = res.aiStatus
    if (docType === "medical_certificate") {
      if (aiStatus === "ok") {
        if (res.reviewStatus === "approved" && res.validUntil) {
          toast.success(`KI hat das Dokument akzeptiert — gültig bis ${new Date(res.validUntil).toLocaleDateString(locale)}.`)
        } else if (res.tempValidUntil) {
          toast.success(`KI hat das Dokument akzeptiert — vorläufig gültig bis ${new Date(res.tempValidUntil).toLocaleDateString(locale)}. Admin-Prüfung läuft.`)
        } else {
          toast.success("KI hat das Dokument akzeptiert. Admin-Prüfung läuft.")
        }
      } else if (aiStatus === "reject") {
        toast.error(`KI hat das Dokument abgelehnt: ${res.aiReason || "Dokument ungültig."}`)
      } else if (aiStatus === "error" || !aiStatus) {
        toast.warning("Upload erfolgreich. Manuelle Prüfung durch den Admin folgt.")
      } else {
        toast.info("Upload erfolgreich. Prüfung läuft.")
      }
    } else {
      toast.success("Dokument erfolgreich hochgeladen.")
    }

    setSelectedFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
    router.refresh()
  }

  const handleOpen = async (doc: MemberDocument) => {
    setOpeningId(doc.id)
    const res = await getMemberDocumentSignedUrl(clubSlug, doc.id)
    if (res?.success && res.url) {
      setDocPreviewUrl(res.url)
    } else {
      toast.error(res?.error || "Dokument konnte nicht geöffnet werden.")
    }
    setOpeningId(null)
  }

  const handleDownload = async (doc: MemberDocument) => {
    setOpeningId(doc.id)
    const res = await getMemberDocumentSignedUrl(clubSlug, doc.id)
    if (res?.success && res.url) {
      const link = document.createElement("a")
      link.href = res.url
      link.download = doc.file_name
      link.click()
    } else {
      toast.error(res?.error || "Download fehlgeschlagen.")
    }
    setOpeningId(null)
  }

  const medicalDocs = documents.filter((d) => d.doc_type === "medical_certificate")
  const otherDocs = documents.filter((d) => d.doc_type !== "medical_certificate")

  return (
    <div className="space-y-6">
      {/* Upload form */}
      <form
        id="tour-documents-upload"
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200/60 bg-white/90 p-5 sm:p-6 shadow-sm space-y-5"
      >
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Dokument hochladen</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Lade dein ärztliches Zeugnis hoch — die KI prüft es sofort automatisch.
          </p>
        </div>

        {/* Doc type selector */}
        <div className="grid grid-cols-2 gap-3">
          {DOC_TYPES.map((type) => {
            const Icon = type.icon
            const active = docType === type.value
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => setDocType(type.value)}
                className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all ${
                  active
                    ? "border-slate-900 bg-slate-50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? "text-slate-900" : "text-slate-400"}`} />
                <span className={`text-sm font-medium ${active ? "text-slate-900" : "text-slate-600"}`}>
                  {type.label}
                </span>
                <span className="text-[11px] text-slate-400 leading-tight">{type.desc}</span>
              </button>
            )
          })}
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 cursor-pointer transition-colors ${
            isDragging
              ? "border-slate-400 bg-slate-50"
              : selectedFile
              ? "border-green-400 bg-green-50/50"
              : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            className="sr-only"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
          />

          {selectedFile ? (
            <>
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Vorschau"
                  className="max-h-40 rounded-lg object-contain border border-slate-200"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <FileText className="w-8 h-8 text-slate-400" />
                </div>
              )}
              <div className="text-center">
                <div className="text-sm font-medium text-slate-800 truncate max-w-[200px]">
                  {selectedFile.name}
                </div>
                <div className="text-xs text-slate-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleFileChange(null); if (fileInputRef.current) fileInputRef.current.value = "" }}
                className="text-xs text-slate-400 hover:text-red-500 underline"
              >
                Entfernen
              </button>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                <Upload className="w-5 h-5 text-slate-400" />
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-slate-700">
                  Datei hierher ziehen oder <span className="underline">auswählen</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">PDF oder Bild · max. 10 MB</div>
              </div>
            </>
          )}
        </div>

        <Button
          type="submit"
          className="w-full rounded-full"
          disabled={uploading || !selectedFile}
        >
          {uploading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {docType === "medical_certificate" ? "KI analysiert…" : "Lade hoch…"}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Upload className="w-4 h-4" /> Hochladen &amp; prüfen
            </span>
          )}
        </Button>
      </form>

      {/* Document list */}
      <div id="tour-documents-list" className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-700 px-1">Deine Dokumente</h3>

        {documents.length === 0 ? (
          <div className="rounded-2xl border border-slate-200/60 bg-white/90 p-6 text-center text-slate-500 shadow-sm">
            <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm">Noch keine Dokumente hochgeladen.</p>
          </div>
        ) : (
          <>
            {medicalDocs.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide px-1">
                  <Stethoscope className="w-3.5 h-3.5" /> Ärztliche Zeugnisse
                </div>
                {medicalDocs.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    doc={doc}
                    locale={locale}
                    clubSlug={clubSlug}
                    openingId={openingId}
                    onOpen={handleOpen}
                    onDownload={handleDownload}
                  />
                ))}
              </div>
            )}
            {otherDocs.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide px-1">
                  <FileSignature className="w-3.5 h-3.5" /> Verträge &amp; Sonstiges
                </div>
                {otherDocs.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    doc={doc}
                    locale={locale}
                    clubSlug={clubSlug}
                    openingId={openingId}
                    onOpen={handleOpen}
                    onDownload={handleDownload}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Inline preview */}
      {docPreviewUrl && (
        <div className="rounded-2xl border border-slate-200/60 bg-white/90 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-700">Vorschau</span>
            <button
              onClick={() => setDocPreviewUrl(null)}
              className="text-xs text-slate-400 hover:text-red-500"
            >
              Schließen
            </button>
          </div>
          <iframe src={docPreviewUrl} className="h-80 w-full rounded-xl border border-slate-200" />
        </div>
      )}
    </div>
  )
}

function DocumentCard({
  doc,
  locale,
  clubSlug,
  openingId,
  onOpen,
  onDownload,
}: {
  doc: MemberDocument
  locale: string
  clubSlug: string
  openingId: string | null
  onOpen: (doc: MemberDocument) => void
  onDownload: (doc: MemberDocument) => void
}) {
  const isPdf = doc.mime_type === "application/pdf" || doc.file_name?.endsWith(".pdf")
  const isMedical = doc.doc_type === "medical_certificate"

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white/90 p-4 shadow-sm space-y-3">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
            {isPdf ? <FileText className="w-4 h-4 text-slate-500" /> : <ImageIcon className="w-4 h-4 text-slate-500" />}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-slate-800 truncate">{doc.file_name}</div>
            <div className="text-xs text-slate-400 mt-0.5">
              {new Date(doc.created_at).toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric" })}
            </div>
          </div>
        </div>
        <div className="flex gap-1.5 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-slate-500 hover:text-slate-900"
            disabled={openingId === doc.id}
            onClick={() => onOpen(doc)}
            title="Öffnen"
          >
            {openingId === doc.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-slate-500 hover:text-slate-900"
            disabled={openingId === doc.id}
            onClick={() => onDownload(doc)}
            title="Download"
          >
            <Download className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Status pipeline (only for medical certs with AI) */}
      {isMedical && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge className="bg-blue-100 text-blue-700 border-blue-200 gap-1 font-normal text-[11px]">
            <CheckCircle2 className="w-3 h-3" /> Hochgeladen
          </Badge>
          <ArrowRight className="w-3 h-3 text-slate-300 shrink-0" />
          <AiStatusBadge status={doc.ai_status} reason={doc.ai_reason} />
          <ArrowRight className="w-3 h-3 text-slate-300 shrink-0" />
          <ReviewStatusBadge status={doc.review_status} />
          <ArrowRight className="w-3 h-3 text-slate-300 shrink-0" />
          <ValidityBadge doc={doc} locale={locale} />
        </div>
      )}

      {/* Non-medical: just review + validity */}
      {!isMedical && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <ReviewStatusBadge status={doc.review_status} />
        </div>
      )}

      {/* AI rejection reason */}
      {doc.ai_status === "reject" && doc.ai_reason && (
        <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-xs text-red-700">
          <span className="font-medium">KI-Begründung: </span>{doc.ai_reason}
        </div>
      )}

      {/* AI confidence */}
      {doc.ai_status === "ok" && doc.ai_confidence != null && (
        <div className="text-[11px] text-slate-400">
          KI-Konfidenz: {Math.round((doc.ai_confidence as number) * 100)}%
        </div>
      )}
    </div>
  )
}
