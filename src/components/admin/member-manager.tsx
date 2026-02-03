"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"
import { format } from "date-fns"

export function MemberManager({ members }: { members: any[] }) {
  return (
    <Card className="rounded-2xl border border-slate-200/60 bg-white/80 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" /> Mitgliederliste</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {members.map(m => (
            <div key={m.id} className="flex justify-between items-center p-3 border border-slate-200/60 rounded-xl bg-white hover:shadow-sm transition-shadow">
              <div>
                <div className="font-semibold">{m.user?.email || "Unbekannt"}</div>
                <div className="text-xs text-slate-500">
                  Gültig bis: {m.valid_until ? format(new Date(m.valid_until), 'dd.MM.yyyy') : '-'}
                </div>
              </div>
              <div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                  m.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                }`}>
                  {m.status === 'active' ? 'AKTIV' : 'INAKTIV'}
                </span>
              </div>
            </div>
          ))}
          {members.length === 0 && <p className="text-slate-500 text-sm">Noch keine Mitglieder.</p>}
        </div>
      </CardContent>
    </Card>
  )
}
