"use client"

import { useState, useTransition } from "react"
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

  const onSend = () => {
    setStatus(null)
    setError(null)
    startTransition(async () => {
      const res = await sendPostPaymentMagicLink(sessionId, lang)
      if (res?.success) {
        setStatus("Login-Link wurde per E-Mail gesendet.")
      } else {
        setError(res?.error || "Login-Link konnte nicht gesendet werden.")
      }
    })
  }

  return (
    <div className="space-y-2">
      <Button className="w-full" onClick={onSend} disabled={isPending}>
        {isPending ? "Sende..." : "Login-Link per E-Mail senden"}
      </Button>
      {status ? <p className="text-xs text-green-600">{status}</p> : null}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  )
}

