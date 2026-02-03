"use client"

import { useState } from "react"
import { createMembershipPlan, deleteMembershipPlan } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Euro, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export function PlanManager({ clubSlug, plans }: { clubSlug: string, plans: any[] }) {
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleAdd = async () => {
    setIsLoading(true)
    await createMembershipPlan(clubSlug, name, parseFloat(price))
    setIsLoading(false)
    setName(""); setPrice("")
    router.refresh()
  }

  const handleDelete = async (id: string) => {
      if(!confirm("Plan löschen?")) return
      await deleteMembershipPlan(id)
      router.refresh()
  }

  return (
    <Card className="h-full rounded-2xl border border-slate-200/60 bg-white/80 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Euro className="w-5 h-5" /> Abo-Preise</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          {plans.map(p => (
            <div key={p.id} className="flex justify-between items-center p-3 border border-slate-200/60 rounded-xl bg-white hover:shadow-sm transition-shadow">
              <div>
                <div className="font-semibold">{p.name}</div>
                <div className="text-sm text-slate-500">{p.price}€ / Jahr</div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)} className="rounded-full">
                <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500"/>
              </Button>
            </div>
          ))}
          {plans.length === 0 && <p className="text-slate-500 text-sm">Keine Mitgliedschaften definiert.</p>}
        </div>

        <div className="flex gap-2 items-end">
          <div className="space-y-1 flex-1">
            <Input placeholder="Name (z.B. Erwachsene)" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="space-y-1 w-24">
            <Input type="number" placeholder="€" value={price} onChange={e => setPrice(e.target.value)} />
          </div>
          <Button onClick={handleAdd} disabled={isLoading} className="bg-slate-900 text-white rounded-full">
            {isLoading ? <Loader2 className="animate-spin" /> : "+"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
