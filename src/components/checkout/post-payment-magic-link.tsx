"use client"

import { useEffect, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { sendPostPaymentMagicLink } from "@/app/actions"

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
  const isCoolingDown = nowTs < cooldownUntil
  const remainingSeconds = Math.max(0, Math.ceil((cooldownUntil - nowTs) / 1000))

  useEffect(() => {
    if (!isCoolingDown) return
    const id = setInterval(() => setNowTs(Date.now()), 250)
    return () => clearInterval(id)
  }, [isCoolingDown])

  const onSend = () => {
    setStatus(null)
    setError(null)
    startTransition(async () => {
      const res = await sendPostPaymentMagicLink(sessionId, lang)
      if (res?.success) {
        setStatus("Login-Link wurde per E-Mail gesendet.")
        setCooldownUntil(Date.now() + 60_000)
      } else {
        setError(res?.error || "Login-Link konnte nicht gesendet werden.")
      }
    })
  }

  return (
    <div className="space-y-2">
      <Button className="w-full" onClick={onSend} disabled={isPending || isCoolingDown}>
        {isPending ? "Sende..." : isCoolingDown ? `Erneut senden in ${remainingSeconds}s` : "Login-Link per E-Mail senden"}
      </Button>
      {status ? <p className="text-xs text-green-600">{status}</p> : null}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  )
}
