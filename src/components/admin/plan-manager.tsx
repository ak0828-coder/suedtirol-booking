"use client"

import { useState } from "react"
import { createPlan, deletePlan } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Plus, CreditCard } from "lucide-react"
import { useRouter } from "next/navigation"

type Plan = {
  id: string
  name: string
  price: number
  interval: string
  features?: string[] | null
}

export function PlanManager({ 
  initialPlans, 
  clubSlug 
}: { 
  initialPlans: Plan[], 
  clubSlug: string 
}) {
  const router = useRouter()
  const [plans, setPlans] = useState<Plan[]>(initialPlans)
  
  // Form States
  const [newName, setNewName] = useState("")
  const [newPrice, setNewPrice] = useState("50")
  const [newInterval, setNewInterval] = useState("year")
  
  const [isLoading, setIsLoading] = useState(false)

  async function handleAdd() {
    if (!newName) return
    setIsLoading(true)

    const result = await createPlan(
      clubSlug, 
      newName, 
      parseFloat(newPrice),
      newInterval
    )

    if (result.success && result.plan) {
      setPlans([...plans, result.plan])
      setNewName("")
      router.refresh()
    } else {
      alert("Fehler: " + (result.error || "Unbekannter Fehler"))
    }
    setIsLoading(false)
  }

  async function handleDelete(id: string) {
    if(!confirm("Tarif wirklich löschen?")) return;
    const result = await deletePlan(id)
    if (result.success) {
      setPlans(plans.filter(p => p.id !== id))
      router.refresh()
    }
  }

  return (
    <Card className="rounded-2xl border border-slate-200/60 bg-white/80 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Mitgliedschafts-Tarife
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* LISTE */}
        <div className="grid gap-4 mb-6 md:grid-cols-2">
          {plans.map((plan) => (
            <Card key={plan.id} className="bg-white border border-slate-200/60 rounded-2xl shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-slate-200"></div>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{plan.name}</h3>
                  <div className="text-sm text-slate-500">
                    {plan.price}€ / {plan.interval === 'year' ? 'Jahr' : 'Monat'}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(plan.id)}
                  className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
          {plans.length === 0 && <p className="text-slate-500 italic col-span-2">Keine Tarife angelegt.</p>}
        </div>

        {/* NEU ERSTELLEN FORMULAR */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
          <h4 className="text-sm font-medium mb-3">Neuen Tarif anlegen</h4>
          <div className="flex flex-col md:flex-row gap-3 items-end">
            <div className="grid gap-1 flex-1 w-full">
              <Label className="text-xs font-medium">Name</Label>
              <Input 
                placeholder="z.B. Vollmitgliedschaft" 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="bg-white"
              />
            </div>
            
            <div className="grid gap-1 w-full md:w-32">
              <Label className="text-xs font-medium">Preis (€)</Label>
              <Input 
                type="number" 
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="bg-white"
              />
            </div>

            <div className="grid gap-1 w-full md:w-40">
              <Label className="text-xs font-medium">Intervall</Label>
              <Select value={newInterval} onValueChange={setNewInterval}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="year">Jährlich</SelectItem>
                  <SelectItem value="month">Monatlich</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleAdd} disabled={isLoading} className="w-full md:w-auto rounded-full club-primary-bg">
              {isLoading ? "..." : <><Plus className="h-4 w-4 mr-1" /> Hinzufügen</>}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
