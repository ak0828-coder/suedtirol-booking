"use client"

import { useState } from "react"
import { createCourt, deleteCourt } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Plus, MapPin, Clock } from "lucide-react"
import { useRouter } from "next/navigation"

type Court = {
  id: string
  name: string
  price_per_hour: number
  duration_minutes: number
}

export function CourtManager({ 
  initialCourts, 
  clubSlug 
}: { 
  initialCourts: Court[], 
  clubSlug: string 
}) {
  const router = useRouter()
  const [courts, setCourts] = useState(initialCourts)
  
  // Form States
  const [newCourtName, setNewCourtName] = useState("")
  const [newCourtPrice, setNewCourtPrice] = useState("15")
  const [newCourtDuration, setNewCourtDuration] = useState("60") // Standard 60 Min
  
  const [isLoading, setIsLoading] = useState(false)

  async function handleAdd() {
    if (!newCourtName) return
    setIsLoading(true)

    // Wir übergeben jetzt auch die Dauer (parseInt macht aus "60" die Zahl 60)
    const result = await createCourt(
      clubSlug, 
      newCourtName, 
      parseFloat(newCourtPrice),
      parseInt(newCourtDuration)
    )

    if (result.success && result.court) {
      setCourts([...courts, result.court])
      setNewCourtName("")
      router.refresh()
    } else {
      alert("Fehler: " + (result.error || "Unbekannter Fehler"))
    }
    setIsLoading(false)
  }

  async function handleDelete(id: string) {
    if(!confirm("Platz wirklich löschen?")) return;
    const result = await deleteCourt(id)
    if (result.success) {
      setCourts(courts.filter(c => c.id !== id))
      router.refresh()
    }
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Platzverwaltung
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* LISTE */}
        <div className="space-y-4 mb-6">
          {courts.map((court) => (
            <div key={court.id} className="flex items-center justify-between p-3 border rounded-lg bg-slate-50 dark:bg-slate-900">
              <div>
                <p className="font-semibold">{court.name}</p>
                <div className="flex gap-3 text-sm text-muted-foreground">
                  <span>{court.price_per_hour}€ / Spiel</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3"/> {court.duration_minutes || 60} Min</span>
                </div>
              </div>
              <Button variant="destructive" size="icon" onClick={() => handleDelete(court.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {courts.length === 0 && <p className="text-slate-500 italic">Keine Plätze angelegt.</p>}
        </div>

        {/* NEU ERSTELLEN FORMULAR */}
        <div className="flex flex-col md:flex-row gap-3 items-end border-t pt-4">
          <div className="grid gap-1 flex-1 w-full">
            <label className="text-xs font-medium">Name</label>
            <Input 
              placeholder="Platz Name" 
              value={newCourtName}
              onChange={(e) => setNewCourtName(e.target.value)}
            />
          </div>
          
          <div className="grid gap-1 w-full md:w-32">
            <label className="text-xs font-medium">Preis (€)</label>
            <Input 
              type="number" 
              value={newCourtPrice}
              onChange={(e) => setNewCourtPrice(e.target.value)}
            />
          </div>

          {/* NEU: DAUER AUSWAHL */}
          <div className="grid gap-1 w-full md:w-40">
            <label className="text-xs font-medium">Dauer</label>
            <Select value={newCourtDuration} onValueChange={setNewCourtDuration}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="45">45 Minuten</SelectItem>
                <SelectItem value="60">60 Minuten</SelectItem>
                <SelectItem value="90">90 Minuten</SelectItem>
                <SelectItem value="120">120 Minuten</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleAdd} disabled={isLoading} className="w-full md:w-auto">
            {isLoading ? "..." : <Plus className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}