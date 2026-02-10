"use client"

import { Button } from "@/components/ui/button"
import { useTransition, useState } from "react"
import { getAdminDocumentSignedUrl, reviewMemberDocument } from "@/app/actions"
import { useI18n } from "@/components/i18n/locale-provider"
import { useParams } from "next/navigation"

export function MemberDocumentsAdmin({
  clubSlug,
  documents,
}: {
  clubSlug: string
  documents: any[]
}) {
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const { t } = useI18n()
  const params = useParams()
  const langRaw = params?.lang
  const lang = typeof langRaw === "string" ? langRaw : Array.isArray(langRaw) ? langRaw[0] : "de"
  const locale = lang === "it" ? "it-IT" : lang === "en" ? "en-US" : "de-DE"

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">{t("admin_docs.title", "Dokumente prüfen")}</h3>
        <p className="text-sm text-slate-500">{t("admin_docs.subtitle", "Prüfe und bestätige medizinische Nachweise.")}</p>
      </div>

      {message && <div className="text-xs text-emerald-600">{message}</div>}

      <div className="space-y-3">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/60 bg-white/90 px-4 py-3 text-sm"
          >
            <div>
              <div className="font-semibold text-slate-900">{doc.member_name || t("admin_docs.member_fallback", "Mitglied")}</div>
              <div className="text-xs text-slate-500">{doc.file_name}</div>
              <div className="mt-1 text-xs text-slate-500">
                {doc.valid_until
                  ? t("admin_docs.valid_until", "Gültig bis {date}").replace("{date}", new Date(doc.valid_until).toLocaleDateString(locale))
                  : doc.temp_valid_until
                  ? t("admin_docs.temp_until", "Vorläufig bis {date}").replace("{date}", new Date(doc.temp_valid_until).toLocaleDateString(locale))
                  : t("admin_docs.invalid", "Nicht gültig")}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                className="rounded-full text-xs"
                onClick={async () => {
                  const res = await getAdminDocumentSignedUrl(clubSlug, doc.id)
                  if (res?.success && res.url) {
                    window.open(res.url, "_blank")
                  } else {
                    setMessage(res?.error || t("admin_docs.open_error", "Dokument konnte nicht geöffnet werden."))
                  }
                }}
              >
                {t("admin_docs.open", "Öffnen")}
              </Button>
              <Button
                variant="outline"
                className="rounded-full text-xs"
                disabled={pending}
                onClick={() => {
                  startTransition(async () => {
                    const res = await reviewMemberDocument(clubSlug, doc.id, true)
                    if (res?.success) setMessage(t("admin_docs.approved", "Dokument bestätigt."))
                    else setMessage(res?.error || t("admin_docs.action_error", "Aktion fehlgeschlagen."))
                  })
                }}
              >
                {t("admin_docs.approve", "Bestätigen")}
              </Button>
              <Button
                variant="outline"
                className="rounded-full text-xs"
                disabled={pending}
                onClick={() => {
                  startTransition(async () => {
                    const res = await reviewMemberDocument(clubSlug, doc.id, false)
                    if (res?.success) setMessage(t("admin_docs.rejected", "Dokument abgelehnt."))
                    else setMessage(res?.error || t("admin_docs.action_error", "Aktion fehlgeschlagen."))
                  })
                }}
              >
                {t("admin_docs.reject", "Ablehnen")}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
