"use client"

import { useState, useEffect } from "react" // <--- useEffect importieren
import { createBlockedPeriod, deleteBlockedPeriod } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon, Trash2, Loader2 } from "lucide-react" // Loader2 für Lade-Icon dazu
import { useRouter } from "next/navigation"
import { format } from "date-fns"

export function BlockManager({ clubSlug, courts, initialBlocks }: { clubSlug: string, courts: any[], initialBlocks: any[] }) {
  const [blocks, setBlocks] = useState(initialBlocks)
  
  // State für Formular
  const [reason, setReason] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [targetCourt, setTargetCourt] = useState("all")
  
  const [isLoading, setIsLoading] = useState(false)
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null) // Um beim Löschen Ladekreis anzuzeigen
  const router = useRouter()

  // --- AUTOMATISCHER AKTUALISIERER ---
  // Wenn router.refresh() neue Daten vom Server holt, aktualisieren wir hier die Anzeige
  useEffect(() => {
    setBlocks(initialBlocks)
  }, [initialBlocks])

  const handleAdd = async () => {
    if (!reason || !startDate || !endDate) return alert("Bitte alle Felder ausfüllen")
    
    setIsLoading(true)
    const res = await createBlockedPeriod(clubSlug, targetCourt, new Date(startDate), new Date(endDate), reason)
    setIsLoading(false)

    if (res.success) {
        // Formular leeren
        setReason("")
        setStartDate("")
        setEndDate("")
        
        // Server bitten, neue Daten zu holen
        // Dank dem useEffect oben aktualisiert sich die Liste dann automatisch
        router.refresh()
    } else {
        alert("Fehler: " + res.error)
    }
  }

  const handleDelete = async (id: string) => {
      if(!confirm("Sperre aufheben?")) return
      
      setIsDeletingId(id)

      // OPTIMISTIC UPDATE: Sofort aus der Liste entfernen (fühlt sich schneller an)
      setBlocks(prev => prev.filter(b => b.id !== id))

      await deleteBlockedPeriod(id)
      
      setIsDeletingId(null)
      router.refresh() // Zur Sicherheit Datenabgleich mit Server
  }

  return (
    <Card className="mt-8 border-orange-200 bg-orange-50/50">
        <CardHeader>
            <CardTitle className="text-orange-900 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5"/> Sperrzeiten & Events
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
            
            {/* LISTE DER SPERREN */}
            <div className="space-y-2">
                {blocks.map(block => (
                    <div key={block.id} className="bg-white p-3 rounded-md border flex justify-between items-center text-sm shadow-sm">
                        <div>
                            <span className="font-bold text-slate-800">{block.reason}</span>
                            <span className="mx-2 text-slate-400">|</span>
                            <span>{format(new Date(block.start_date), 'dd.MM.yy')} - {format(new Date(block.end_date), 'dd.MM.yy')}</span>
                            <span className="mx-2 text-slate-400">|</span>
                            <span className="italic text-slate-500">
                                {!block.court_id ? "Alle Plätze" : "Einzelplatz"}
                            </span>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDelete(block.id)} 
                            disabled={isDeletingId === block.id}
                            className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                        >
                            {isDeletingId === block.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                        </Button>
                    </div>
                ))}
                {blocks.length === 0 && <p className="text-sm text-slate-500 italic">Keine Sperrzeiten eingetragen.</p>}
            </div>

            {/* NEUE SPERRE */}
            <div className="grid gap-4 md:grid-cols-4 items-end bg-white p-4 rounded-lg border">
                <div className="space-y-1">
                    <Label>Grund</Label>
                    <Input placeholder="z.B. Winterpause" value={reason} onChange={e => setReason(e.target.value)} />
                </div>
                <div className="space-y-1">
                    <Label>Von</Label>
                    <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div className="space-y-1">
                    <Label>Bis</Label>
                    <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
                <div className="space-y-1">
                    <Label>Betrifft</Label>
                    <Select value={targetCourt} onValueChange={setTargetCourt}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Ganzer Verein</SelectItem>
                            {courts.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <Button onClick={handleAdd} disabled={isLoading} className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                {isLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                {isLoading ? "Speichere..." : "Sperrzeit eintragen"}
            </Button>

        </CardContent>
    </Card>
  )
}