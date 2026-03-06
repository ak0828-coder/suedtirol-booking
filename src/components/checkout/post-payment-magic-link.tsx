"use client"

import { useEffect, useState, useTransition, useRef } from "react"
import { Button } from "@/components/ui/button"
import { sendPostPaymentMagicLink } from "@/app/actions"
import { Loader2, Mail, CheckCircle2 } from "lucide-react"

export function PostPaymentMagicLink({
  sessionId,
  lang,
}: {
  sessionId: string
  lang: string
}) {
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cooldownUntil, setCooldownUntil] = useState(0)
  const [nowTs, setNowTs] = useState(Date.now())
  const autoSentRef = useRef(false)

  const isCoolingDown = nowTs < cooldownUntil
  const remainingSeconds = Math.max(0, Math.ceil((cooldownUntil - nowTs) / 1000))

  useEffect(() => {
    if (!isCoolingDown) return
    const id = setInterval(() => setNowTs(Date.now()), 250)
    return () => clearInterval(id)
  }, [isCoolingDown])

  // Auto-send on mount so the user always gets the email immediately
  useEffect(() => {
    if (autoSentRef.current) return
    autoSentRef.current = true
    startTransition(async () => {
      const res = await sendPostPaymentMagicLink(sessionId, lang)
      if (res?.success) {
        setStatus("E-Mail gesendet! Prüfe deinen Posteingang.")
        setCooldownUntil(Date.now() + 60_000)
      } else {
        setError(res?.error || "E-Mail konnte nicht gesendet werden.")
      }
    })
  }, [sessionId, lang])

  const onResend = () => {
    setStatus(null)
    setError(null)
    startTransition(async () => {
      const res = await sendPostPaymentMagicLink(sessionId, lang)
      if (res?.success) {
        setStatus("E-Mail erneut gesendet!")
        setCooldownUntil(Date.now() + 60_000)
      } else {
        setError(res?.error || "E-Mail konnte nicht gesendet werden.")
      }
    })
  }

  return (
    <div className="space-y-3">
      {isPending && !status && (
        <div className="flex items-center justify-center gap-2 text-sm text-slate-600 py-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          E-Mail wird gesendet…
        </div>
      )}

      {status && (
        <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {status}
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}

      <Button
        variant="outline"
        className="w-full rounded-full"
        onClick={onResend}
        disabled={isPending || isCoolingDown}
      >
        <Mail className="w-4 h-4 mr-2" />
        {isCoolingDown
          ? `Erneut senden in ${remainingSeconds}s`
          : "E-Mail erneut senden"}
      </Button>
    </div>
  )
}
