"use client"

import { useState } from "react"
import { addMemberCredit, removeMemberCredit } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/components/i18n/locale-provider"

export function MemberQuickActions({ clubSlug, memberId }: { clubSlug: string; memberId: string }) {
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { t } = useI18n()

  const handleAction = async (action: "add" | "remove") => {
    setLoading(true)
    setMessage(null)
    const res = action === "add"
      ? await addMemberCredit(clubSlug, memberId)
      : await removeMemberCredit(clubSlug, memberId)
    setLoading(false)
    if (res?.success) setMessage(t("admin_quick.done", "Aktion ausgeführt."))
    else setMessage(res?.error || t("admin_quick.error", "Aktion fehlgeschlagen."))
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => handleAction("add")} disabled={loading}>
        {t("admin_quick.add", "+10€")}
      </Button>
      <Button variant="outline" size="sm" onClick={() => handleAction("remove")} disabled={loading}>
        {t("admin_quick.remove", "-10€")}
      </Button>
      {message && <span className="text-xs text-slate-500">{message}</span>}
    </div>
  )
}
