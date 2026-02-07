"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"

type PaymentRow = {
  id: string
  start_time: string
  payment_status: string | null
  price_paid: number | null
  courts?: { name?: string | null } | null
}

export function MemberPaymentsPanel({ payments }: { payments: PaymentRow[] }) {
  const [visibleCount, setVisibleCount] = useState(6)

  const visible = useMemo(() => payments.slice(0, visibleCount), [payments, visibleCount])

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm space-y-3">
      <h3 className="text-sm font-semibold text-slate-800">Zahlungsverlauf</h3>
      {visible.length > 0 ? (
        <div className="max-h-56 overflow-auto space-y-2 pr-1">
          {visible.map((p) => (
            <div key={p.id} className="rounded-xl border border-slate-200/60 bg-white/90 px-3 py-2 text-sm">
              <div className="font-medium text-slate-800">{p.courts?.name || "Platz"}</div>
              <div className="text-xs text-slate-500">
                {new Date(p.start_time).toLocaleDateString("de-DE")} ·{" "}
                {new Date(p.start_time).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
              </div>
              <div className="text-xs text-slate-500">Betrag: {p.price_paid}€ · Status: {p.payment_status}</div>
            </div>
          ))}
          {visibleCount < payments.length && (
            <Button variant="outline" className="w-full rounded-full text-xs" onClick={() => setVisibleCount((v) => v + 6)}>
              Mehr anzeigen
            </Button>
          )}
        </div>
      ) : (
        <p className="text-sm text-slate-500">Keine Zahlungen erfasst.</p>
      )}
    </div>
  )
}
