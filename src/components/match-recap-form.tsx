"use client"

import { useTransition, useState } from "react"
import { submitMatchRecap } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useI18n } from "@/components/i18n/locale-provider"

export function MatchRecapForm({
  token,
  clubName,
  clubLogo,
  clubColor,
  dateLabel,
  timeLabel,
  initialPlayerName,
  initialOpponentName,
  initialResult,
  isMemberMode,
  memberOptions,
}: {
  token: string
  clubName: string
  clubLogo?: string | null
  clubColor?: string | null
  dateLabel: string
  timeLabel: string
  initialPlayerName: string
  initialOpponentName?: string | null
  initialResult?: string | null
  isMemberMode: boolean
  memberOptions: { id: string; label: string }[]
}) {
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [playerName, setPlayerName] = useState(initialPlayerName || "")
  const [opponentName, setOpponentName] = useState(initialOpponentName || "")
  const [selectedOpponent, setSelectedOpponent] = useState("")
  const [resultText, setResultText] = useState(initialResult || "")
  const [shareSupported, setShareSupported] = useState(true)
  const { t } = useI18n()

  const handleSubmit = () => {
    setMessage(null)
    startTransition(async () => {
      const res = await submitMatchRecap(token, {
        playerName: playerName.trim(),
        opponentName: opponentName.trim(),
        opponentUserId: selectedOpponent || null,
        resultText: resultText.trim(),
      })

      if (res?.success) {
        setMessage(t("match_recap.saved", "Recap gespeichert."))
      } else {
        setMessage(res?.error || t("match_recap.error", "Fehler beim Speichern."))
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200/60 bg-white/90 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {clubLogo ? (
              <img src={clubLogo} alt={clubName} className="h-12 w-12 rounded-2xl object-cover" />
            ) : null}
            <div>
              <div className="text-sm uppercase tracking-wide text-slate-500">{t("match_recap.club", "Club")}</div>
              <div className="text-xl font-semibold text-slate-900">{clubName}</div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-600">
            {dateLabel} · {timeLabel}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200/60 bg-white/90 p-6 shadow-sm space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <div className="text-sm font-semibold text-slate-900">{t("match_recap.player", "Spieler")}</div>
            <Input value={playerName} onChange={(e) => setPlayerName(e.target.value)} />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">{t("match_recap.opponent", "Gegner")}</div>
            <Input value={opponentName} onChange={(e) => setOpponentName(e.target.value)} />
          </div>
        </div>

        {isMemberMode && memberOptions.length > 0 ? (
          <div>
            <div className="text-sm font-semibold text-slate-900">{t("match_recap.member", "Mitglied wählen")}</div>
            <select
              value={selectedOpponent}
              onChange={(e) => setSelectedOpponent(e.target.value)}
              className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
            >
              <option value="">{t("match_recap.select", "Bitte auswählen")}</option>
              {memberOptions.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-slate-500">
              {t("match_recap.member_hint", "Optional: Wähle ein Mitglied, um das Ergebnis zuzuordnen.")}
            </p>
          </div>
        ) : null}

        <div>
          <div className="text-sm font-semibold text-slate-900">{t("match_recap.score", "Spielstand")}</div>
          <Textarea
            value={resultText}
            onChange={(e) => setResultText(e.target.value)}
            placeholder={t("match_recap.score_ph", "z.B. 6:4, 6:2")}
            rows={3}
          />
        </div>
      </div>

      {message && <div className="text-xs text-slate-500">{message}</div>}

      <div className="flex flex-wrap items-center gap-2">
        <Button
          className="rounded-full"
          style={clubColor ? { backgroundColor: clubColor } : undefined}
          onClick={handleSubmit}
          disabled={pending}
        >
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
