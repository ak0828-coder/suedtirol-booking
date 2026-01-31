"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"
import { format } from "date-fns"

export function MemberManager({ members }: { members: any[] }) {
  return (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5"/> Mitgliederliste</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="space-y-2">
                {members.map(m => (
                    <div key={m.id} className="flex justify-between items-center p-3 border rounded bg-white">
                        <div>
                            {/* Wir greifen auf die verknüpften profiles Daten zu */}
                            <div className="font-bold">{m.user?.email || "Unbekannt"}</div>
                            <div className="text-xs text-slate-500">
                                Gültig bis: {m.valid_until ? format(new Date(m.valid_until), 'dd.MM.yyyy') : '-'}
                            </div>
                        </div>
                        <div>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                                m.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
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