"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { markMemberPaymentPaid, resendMembershipContract, setMemberStatusQuick } from "@/app/actions"

export function AdminMemberQuickActions({
  clubSlug,
  memberId,
  memberEmail,
  contractAvailable,
}: {
  clubSlug: string
  memberId: string
  memberEmail: string
  contractAvailable: boolean
}) {
  const [loading, setLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const run = async (key: string, fn: () => Promise<any>) => {
    setLoading(key)
    setMessage(null)
    const res = await fn()
    if (res?.success) setMessage("Aktion ausgeführt.")
    else setMessage(res?.error || "Aktion fehlgeschlagen.")
    setLoading(null)
  }

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm space-y-3">
      <h3 className="text-sm font-semibold text-slate-800">Quick Actions</h3>
      <div className="flex flex-wrap gap-2">
        <Button
          className="rounded-full"
          disabled={loading === "activate"}
          onClick={() => run("activate", () => setMemberStatusQuick(clubSlug, memberId, "active"))}
        >
          Aktivieren
        </Button>
        <Button
          variant="outline"
          className="rounded-full"
          disabled={loading === "deactivate"}
          onClick={() => run("deactivate", () => setMemberStatusQuick(clubSlug, memberId, "inactive"))}
        >
          Deaktivieren
        </Button>
        <Button
          variant="outline"
          className="rounded-full"
          disabled={loading === "paid"}
          onClick={() => run("paid", () => markMemberPaymentPaid(clubSlug, memberId))}
        >
          Zahlung als bezahlt
        </Button>
        <Button
          variant="outline"
          className="rounded-full"
          disabled={loading === "contract" || !contractAvailable}
          onClick={() => run("contract", () => resendMembershipContract(clubSlug, memberId))}
        >
          Vertrag erneut senden
        </Button>
        <Button variant="ghost" className="rounded-full" disabled>
          {memberEmail}
        </Button>
      </div>
      {message && <div className="text-xs text-slate-500">{message}</div>}
    </div>
  )
}
