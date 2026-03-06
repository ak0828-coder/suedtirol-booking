"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getMemberDocumentSignedUrl, uploadMemberDocument } from "@/app/actions"
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

// ── i18n copy ──────────────────────────────────────────────────────────────
const copy = {
  de: {
    upload_title: "Dokument hochladen",
    upload_desc: "Lade dein ärztliches Zeugnis hoch — die KI prüft es sofort automatisch.",
    doc_type_medical: "Ärztliches Zeugnis",
    doc_type_medical_desc: "Sportmedizinisches Attest (italiano)",
    doc_type_contract: "Mitgliedsvertrag",
    doc_type_contract_desc: "Unterschriebener Mitgliedsvertrag",
    drop_hint: "Datei hierher ziehen oder",
    drop_select: "auswählen",
    drop_types: "PDF oder Bild · max. 10 MB",
    remove: "Entfernen",
    btn_upload: "Hochladen & prüfen",
    btn_analyzing: "KI analysiert…",
    btn_uploading: "Lade hoch…",
    docs_title: "Deine Dokumente",
    no_docs: "Noch keine Dokumente hochgeladen.",
    section_medical: "Ärztliche Zeugnisse",
    section_other: "Verträge & Sonstiges",
    preview_label: "Vorschau",
    preview_close: "Schließen",
    // AI status badges
    ai_ok: "KI: Geprüft",
    ai_reject: "KI: Abgelehnt",
    ai_error: "Manuelle Prüfung",
    ai_pending: "KI prüft…",
    // Review status badges
    review_approved: "Admin: Bestätigt",
    review_rejected: "Admin: Abgelehnt",
    review_pending: "Wartet auf Admin",
    // Validity
    valid_until: "Gültig bis",
    expired: "Abgelaufen",
    temp_valid: "Vorläufig bis",
    temp_expired: "Vorläufig abgelaufen",
    not_valid: "Nicht gültig",
    // Status
    uploaded: "Hochgeladen",
    ai_reason_label: "KI-Begründung:",
    ai_confidence_label: "KI-Konfidenz:",
    // Toasts
    toast_ok_approved: (date: string) => `Zeugnis akzeptiert — gültig bis ${date}.`,
    toast_ok_temp: (date: string) => `Zeugnis akzeptiert — vorläufig bis ${date}. Admin-Prüfung folgt.`,
    toast_ok: "Zeugnis akzeptiert. Admin-Prüfung läuft.",
    toast_reject: (reason: string) => `Zeugnis abgelehnt: ${reason}`,
    toast_error: "Upload erfolgreich. Wird manuell vom Admin geprüft.",
    toast_uploading: "Dokument hochgeladen.",
    toast_open_error: "Dokument konnte nicht geöffnet werden.",
    toast_upload_failed: "Upload fehlgeschlagen.",
  },
  en: {
    upload_title: "Upload document",
    upload_desc: "Upload your medical certificate — AI reviews it instantly.",
    doc_type_medical: "Medical Certificate",
    doc_type_medical_desc: "Sports medicine attestation (italiano)",
    doc_type_contract: "Membership Contract",
    doc_type_contract_desc: "Signed membership contract",
    drop_hint: "Drag file here or",
    drop_select: "choose file",
    drop_types: "PDF or image · max. 10 MB",
    remove: "Remove",
    btn_upload: "Upload & review",
    btn_analyzing: "AI analyzing…",
    btn_uploading: "Uploading…",
    docs_title: "Your documents",
    no_docs: "No documents uploaded yet.",
    section_medical: "Medical Certificates",
    section_other: "Contracts & Other",
    preview_label: "Preview",
    preview_close: "Close",
    ai_ok: "AI: Approved",
    ai_reject: "AI: Rejected",
    ai_error: "Manual review",
    ai_pending: "AI reviewing…",
    review_approved: "Admin: Approved",
    review_rejected: "Admin: Rejected",
    review_pending: "Awaiting admin",
    valid_until: "Valid until",
    expired: "Expired",
    temp_valid: "Provisionally until",
    temp_expired: "Provisional expired",
    not_valid: "Not valid",
    uploaded: "Uploaded",
    ai_reason_label: "AI reason:",
    ai_confidence_label: "AI confidence:",
    toast_ok_approved: (date: string) => `Certificate accepted — valid until ${date}.`,
    toast_ok_temp: (date: string) => `Certificate accepted — provisionally until ${date}. Admin review pending.`,
    toast_ok: "Certificate accepted. Admin review in progress.",
    toast_reject: (reason: string) => `Certificate rejected: ${reason}`,
    toast_error: "Upload successful. Will be reviewed manually by admin.",
    toast_uploading: "Document uploaded.",
    toast_open_error: "Could not open document.",
    toast_upload_failed: "Upload failed.",
  },
  it: {
    upload_title: "Carica documento",
    upload_desc: "Carica il tuo certificato medico — l'IA lo verifica subito automaticamente.",
    doc_type_medical: "Certificato Medico",
    doc_type_medical_desc: "Attestato sportivo (italiano)",
    doc_type_contract: "Contratto di iscrizione",
    doc_type_contract_desc: "Contratto di iscrizione firmato",
    drop_hint: "Trascina il file qui o",
    drop_select: "seleziona",
    drop_types: "PDF o immagine · max. 10 MB",
    remove: "Rimuovi",
    btn_upload: "Carica e verifica",
    btn_analyzing: "IA sta analizzando…",
    btn_uploading: "Caricamento…",
    docs_title: "I tuoi documenti",
    no_docs: "Nessun documento caricato.",
    section_medical: "Certificati Medici",
    section_other: "Contratti e altro",
    preview_label: "Anteprima",
    preview_close: "Chiudi",
    ai_ok: "IA: Approvato",
    ai_reject: "IA: Rifiutato",
    ai_error: "Verifica manuale",
    ai_pending: "IA in verifica…",
    review_approved: "Admin: Approvato",
    review_rejected: "Admin: Rifiutato",
    review_pending: "In attesa di admin",
    valid_until: "Valido fino al",
    expired: "Scaduto",
    temp_valid: "Provvisoriamente fino al",
    temp_expired: "Scaduto provvisoriamente",
    not_valid: "Non valido",
    uploaded: "Caricato",
    ai_reason_label: "Motivo IA:",
    ai_confidence_label: "Confidenza IA:",
    toast_ok_approved: (date: string) => `Certificato accettato — valido fino al ${date}.`,
    toast_ok_temp: (date: string) => `Certificato accettato — provvisoriamente fino al ${date}. Verifica admin in corso.`,
    toast_ok: "Certificato accettato. Verifica admin in corso.",
    toast_reject: (reason: string) => `Certificato rifiutato: ${reason}`,
    toast_error: "Caricamento riuscito. Verrà verificato manualmente dall'admin.",
    toast_uploading: "Documento caricato.",
    toast_open_error: "Impossibile aprire il documento.",
    toast_upload_failed: "Caricamento fallito.",
  },
}

type Lang = keyof typeof copy
// ──────────────────────────────────────────────────────────────────────────

function getLang(params: any): Lang {
  const raw = params?.lang
  const l = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : "de"
  return (l === "en" || l === "it" ? l : "de") as Lang
}

function AiStatusBadge({ status, c }: { status: string; c: typeof copy["de"] }) {
  if (status === "ok") {
    return (
      <Badge className="bg-green-100 text-green-700 border-green-200 gap-1 font-normal">
        <CheckCircle2 className="w-3 h-3" /> {c.ai_ok}
      </Badge>
    )
  }
  if (status === "reject") {
    return (
      <Badge className="bg-red-100 text-red-700 border-red-200 gap-1 font-normal">
        <XCircle className="w-3 h-3" /> {c.ai_reject}
      </Badge>
    )
  }
  if (status === "error") {
    return (
      <Badge className="bg-amber-100 text-amber-700 border-amber-200 gap-1 font-normal">
        <AlertTriangle className="w-3 h-3" /> {c.ai_error}
      </Badge>
    )
  }
  return (
    <Badge className="bg-slate-100 text-slate-600 border-slate-200 gap-1 font-normal">
      <Clock className="w-3 h-3" /> {c.ai_pending}
    </Badge>
  )
}

function ReviewStatusBadge({ status, c }: { status: string; c: typeof copy["de"] }) {
  if (status === "approved") {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 gap-1 font-normal">
        <ShieldCheck className="w-3 h-3" /> {c.review_approved}
      </Badge>
    )
  }
  if (status === "rejected") {
    return (
      <Badge className="bg-red-100 text-red-700 border-red-200 gap-1 font-normal">
        <XCircle className="w-3 h-3" /> {c.review_rejected}
      </Badge>
    )
  }
  return (
    <Badge className="bg-slate-100 text-slate-600 border-slate-200 gap-1 font-normal">
      <Clock className="w-3 h-3" /> {c.review_pending}
    </Badge>
  )
}

function ValidityBadge({ doc, locale, c }: { doc: MemberDocument; locale: string; c: typeof copy["de"] }) {
  const now = new Date()
  if (doc.valid_until) {
    const d = new Date(doc.valid_until)
    const isValid = d > now
    return (
      <Badge className={`gap-1 font-normal ${isValid ? "bg-green-100 text-green-700 border-green-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
        <CheckCircle2 className="w-3 h-3" />
        {isValid ? c.valid_until : c.expired}: {d.toLocaleDateString(locale)}
      </Badge>
    )
  }
  if (doc.temp_valid_until) {
    const d = new Date(doc.temp_valid_until)
    const isValid = d > now
    return (
      <Badge className={`gap-1 font-normal ${isValid ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
        <Clock className="w-3 h-3" />
        {isValid ? c.temp_valid : c.temp_expired}: {d.toLocaleDateString(locale)}
      </Badge>
    )
  }
  return (
    <Badge className="bg-red-100 text-red-700 border-red-200 gap-1 font-normal">
      <XCircle className="w-3 h-3" /> {c.not_valid}
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
  const params = useParams()
  const lang = getLang(params)
  const c = copy[lang]
  const locale = lang === "it" ? "it-IT" : lang === "en" ? "en-US" : "de-DE"

  const DOC_TYPES = [
    { value: "medical_certificate", icon: Stethoscope, label: c.doc_type_medical, desc: c.doc_type_medical_desc },
    { value: "contract", icon: FileSignature, label: c.doc_type_contract, desc: c.doc_type_contract_desc },
  ]

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
      toast.error(res?.error || c.toast_upload_failed)
      return
    }

    const aiStatus = res.aiStatus
    if (docType === "medical_certificate") {
      if (aiStatus === "ok") {
        if (res.reviewStatus === "approved" && res.validUntil) {
          toast.success(c.toast_ok_approved(new Date(res.validUntil).toLocaleDateString(locale)))
        } else if (res.tempValidUntil) {
          toast.success(c.toast_ok_temp(new Date(res.tempValidUntil).toLocaleDateString(locale)))
        } else {
          toast.success(c.toast_ok)
        }
      } else if (aiStatus === "reject") {
        const reason = res.aiReason || (lang === "it" ? "Documento non riconosciuto come certificato medico valido." : lang === "en" ? "Document not recognized as a valid medical certificate." : "Dokument nicht als gültiges Zeugnis erkannt.")
        toast.error(c.toast_reject(reason))
      } else {
        // "error" or null → manual review, not a failure
        toast.info(c.toast_error)
      }
    } else {
      toast.success(c.toast_uploading)
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
      toast.error(res?.error || c.toast_open_error)
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
      toast.error(res?.error || c.toast_open_error)
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
          <h2 className="text-lg font-semibold text-slate-900">{c.upload_title}</h2>
          <p className="text-sm text-slate-500 mt-0.5">{c.upload_desc}</p>
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
                {c.remove}
              </button>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                <Upload className="w-5 h-5 text-slate-400" />
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-slate-700">
                  {c.drop_hint} <span className="underline">{c.drop_select}</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">{c.drop_types}</div>
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
              {docType === "medical_certificate" ? c.btn_analyzing : c.btn_uploading}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Upload className="w-4 h-4" /> {c.btn_upload}
            </span>
          )}
        </Button>
      </form>

      {/* Document list */}
      <div id="tour-documents-list" className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-700 px-1">{c.docs_title}</h3>

        {documents.length === 0 ? (
          <div className="rounded-2xl border border-slate-200/60 bg-white/90 p-6 text-center text-slate-500 shadow-sm">
            <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm">{c.no_docs}</p>
          </div>
        ) : (
          <>
            {medicalDocs.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide px-1">
                  <Stethoscope className="w-3.5 h-3.5" /> {c.section_medical}
                </div>
                {medicalDocs.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    doc={doc}
                    locale={locale}
                    c={c}
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
                  <FileSignature className="w-3.5 h-3.5" /> {c.section_other}
                </div>
                {otherDocs.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    doc={doc}
                    locale={locale}
                    c={c}
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
            <span className="text-sm font-medium text-slate-700">{c.preview_label}</span>
            <button
              onClick={() => setDocPreviewUrl(null)}
              className="text-xs text-slate-400 hover:text-red-500"
            >
              {c.preview_close}
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
  c,
  openingId,
  onOpen,
  onDownload,
}: {
  doc: MemberDocument
  locale: string
  c: typeof copy["de"]
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
            <CheckCircle2 className="w-3 h-3" /> {c.uploaded}
          </Badge>
          <ArrowRight className="w-3 h-3 text-slate-300 shrink-0" />
          <AiStatusBadge status={doc.ai_status} c={c} />
          <ArrowRight className="w-3 h-3 text-slate-300 shrink-0" />
          <ReviewStatusBadge status={doc.review_status} c={c} />
          <ArrowRight className="w-3 h-3 text-slate-300 shrink-0" />
          <ValidityBadge doc={doc} locale={locale} c={c} />
        </div>
      )}

      {/* Non-medical: just review status */}
      {!isMedical && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <ReviewStatusBadge status={doc.review_status} c={c} />
        </div>
      )}

      {/* AI rejection reason — only show for actual rejections, not errors */}
      {doc.ai_status === "reject" && doc.ai_reason && (
        <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-xs text-red-700">
          <span className="font-medium">{c.ai_reason_label} </span>{doc.ai_reason}
        </div>
      )}

      {/* Manual review note */}
      {doc.ai_status === "error" && (
        <div className="rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 text-xs text-amber-700">
          {c.ai_error} — {doc.ai_reason || ""}
        </div>
      )}

      {/* AI confidence */}
      {doc.ai_status === "ok" && doc.ai_confidence != null && (
        <div className="text-[11px] text-slate-400">
          {c.ai_confidence_label} {Math.round((doc.ai_confidence as number) * 100)}%
        </div>
      )}
    </div>
  )
}
