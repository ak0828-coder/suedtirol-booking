"use client"

import { useState } from "react"
import { createCourt, deleteCourt, updateCourtHours } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Plus, MapPin, Clock } from "lucide-react"
import { useRouter } from "next/navigation"

type Court = {
  id: string
  name: string
  price_per_hour: number
  duration_minutes: number
  start_hour?: number
  end_hour?: number
}

export function CourtManager({ 
  initialCourts, 
  clubSlug 
}: { 
  initialCourts: Court[], 
  clubSlug: string 
}) {
  const router = useRouter()
  const [courts, setCourts] = useState<Court[]>(initialCourts)
  
  // Form States
  const [newCourtName, setNewCourtName] = useState("")
  const [newCourtPrice, setNewCourtPrice] = useState("15")
  const [newCourtDuration, setNewCourtDuration] = useState("60")
  
  const [isLoading, setIsLoading] = useState(false)

  async function handleAdd() {
    if (!newCourtName) return
    setIsLoading(true)

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

  // NEU: Öffnungszeiten direkt speichern
  const handleUpdateHours = async (courtId: string, start: number, end: number) => {
    // Optimistic update
    setCourts(courts.map(c => c.id === courtId ? { ...c, start_hour: start, end_hour: end } : c))
    await updateCourtHours(courtId, start, end)
    router.refresh()
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
            <Card key={court.id} className="bg-slate-50 dark:bg-slate-900 border shadow-sm">
                <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-lg">{court.name}</h3>
                    <div className="text-sm text-slate-500 flex gap-3">
                        <span>{court.price_per_hour}€ / Spiel</span>
                        <span>⏱ {court.duration_minutes} Min</span>
                    </div>
                  </div>

                  {/* ÖFFNUNGSZEITEN EINSTELLUNG */}
                  <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-md border">
                     <Clock className="w-4 h-4 text-slate-400" />
                     <div className="flex items-center gap-1">
                        <Input 
                            type="number" 
                            className="w-16 h-8 text-xs" 
                            value={court.start_hour || 8} 
                            onChange={(e) => handleUpdateHours(court.id, parseInt(e.target.value), court.end_hour || 22)}
                        />
                        <span className="text-xs text-slate-400">bis</span>
                        <Input 
                            type="number" 
                            className="w-16 h-8 text-xs" 
                            value={court.end_hour || 22} 
                            onChange={(e) => handleUpdateHours(court.id, court.start_hour || 8, parseInt(e.target.value))}
                        />
                        <span className="text-xs text-slate-400">Uhr</span>
                     </div>
                  </div>

                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDelete(court.id)}
                    className="text-red-400 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
          ))}
          {courts.length === 0 && <p className="text-slate-500 italic">Keine Plätze angelegt.</p>}
        </div>

        {/* NEU ERSTELLEN FORMULAR */}
        <div className="flex flex-col md:flex-row gap-3 items-end border-t pt-4">
          <div className="grid gap-1 flex-1 w-full">
            <Label className="text-xs font-medium">Name</Label>
            <Input 
              placeholder="Platz Name" 
              value={newCourtName}
              onChange={(e) => setNewCourtName(e.target.value)}
            />
          </div>
          
          <div className="grid gap-1 w-full md:w-32">
            <Label className="text-xs font-medium">Preis (€)</Label>
            <Input 
              type="number" 
              value={newCourtPrice}
              onChange={(e) => setNewCourtPrice(e.target.value)}
            />
          </div>

          {/* NEU: DAUER AUSWAHL */}
          <div className="grid gap-1 w-full md:w-40">
            <Label className="text-xs font-medium">Dauer</Label>
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