"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { markTrainerPayoutsPaid } from "@/app/actions"

export function TrainerPayouts({
  clubSlug,
  rows,
}: {
  clubSlug: string
  rows: { trainer_id: string; name: string; iban: string; payout_method: string; total: number; count: number }[]
}) {
  const [pending, startTransition] = useTransition()

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Trainer-Abrechnung</h3>
        <div className="text-xs text-slate-500">{rows.length} Trainer</div>
      </div>

      <div className="mt-4 space-y-3">
        {rows.map((r) => (
          <div key={r.trainer_id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/60 bg-white p-4">
            <div>
              <div className="font-medium text-slate-900">{r.name}</div>
              <div className="text-xs text-slate-500">IBAN: {r.iban || "-"}</div>
              <div className="text-xs text-slate-500">Methode: {r.payout_method}</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-slate-900">{r.total.toFixed(2)} EUR</div>
              <div className="text-xs text-slate-500">{r.count} Eintraege</div>
            </div>
            <Button
              variant="outline"
              className="rounded-full"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await markTrainerPayoutsPaid(clubSlug, r.trainer_id)
                })
              }
            >
              Als bezahlt markieren
            </Button>
          </div>
        ))}
        {rows.length === 0 ? <div className="text-sm text-slate-500">Keine offenen Auszahlungen.</div> : null}
      </div>
    </div>
  )
}
