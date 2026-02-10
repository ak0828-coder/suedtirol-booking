"use client"

import { useTransition, useState } from "react"
import { createMemberMatchRecap } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useI18n } from "@/components/i18n/locale-provider"

export function MatchRecapForm({
  clubSlug,
  memberOptions,
}: {
  clubSlug: string
  memberOptions: { id: string; label: string }[]
}) {
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [selectedMember, setSelectedMember] = useState("")
  const [score, setScore] = useState("")
  const [highlight, setHighlight] = useState("")
  const [notes, setNotes] = useState("")
  const [shareSupported, setShareSupported] = useState(true)
  const { t } = useI18n()

  const handleSubmit = () => {
    setMessage(null)
    startTransition(async () => {
      const res = await createMemberMatchRecap(
        clubSlug,
        selectedMember,
        score,
        highlight,
        notes
      )

      if (res?.success) {
        setMessage(t("match_recap.saved", "Recap gespeichert."))
        setSelectedMember("")
        setScore("")
        setHighlight("")
        setNotes("")
      } else {
        setMessage(res?.error || t("match_recap.error", "Fehler beim Speichern."))
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-900">{t("match_recap.member", "Mitglied wählen")}</div>
          <select
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
          >
            <option value="">{t("match_recap.select", "Bitte auswählen")}</option>
            {memberOptions.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="text-sm font-semibold text-slate-900">{t("match_recap.score", "Spielstand")}</div>
          <Input value={score} onChange={(e) => setScore(e.target.value)} placeholder="6:4 6:2" />
        </div>

        <div>
          <div className="text-sm font-semibold text-slate-900">{t("match_recap.highlight", "Highlight")}</div>
          <Input value={highlight} onChange={(e) => setHighlight(e.target.value)} placeholder={t("match_recap.highlight_ph", "z.B. 8 Winner im zweiten Satz")} />
        </div>

        <div>
          <div className="text-sm font-semibold text-slate-900">{t("match_recap.notes", "Notizen")}</div>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t("match_recap.notes_ph", "Optional")}/>
        </div>
      </div>

      {message && <div className="text-xs text-slate-500">{message}</div>}

      <div className="flex flex-wrap items-center gap-2">
        <Button className="rounded-full" onClick={handleSubmit} disabled={pending}>
          {pending ? t("match_recap.loading", "Speichere...") : t("match_recap.save", "Recap speichern")}
        </Button>
        <Button
          variant="outline"
          className="rounded-full"
          onClick={async () => {
            try {
              if (!navigator.share) {
                setShareSupported(false)
                setMessage(t("match_recap.share_no", "Teilen nicht unterstützt. Bitte Download nutzen."))
                return
              }
              const url = window.location.href
              await navigator.share({
                title: t("match_recap.share_title", "Match Recap"),
                text: t("match_recap.share_text", "Schau dir mein Match Recap an!"),
                url,
              })
              setMessage(t("match_recap.share_opened", "Teilen geöffnet."))
            } catch (error) {
              setMessage(t("match_recap.share_error", "Teilen nicht unterstützt. Bitte Download nutzen."))
            }
          }}
        >
          {shareSupported ? t("match_recap.share", "Teilen") : t("match_recap.download", "Download für Insta")}
        </Button>
      </div>

      <div className="text-xs text-slate-500">
        {t("match_recap.tip", "Tipp: Für Instagram einfach „Download“ wählen und dann in der Story posten.")}
      </div>
    </div>
  )
}
