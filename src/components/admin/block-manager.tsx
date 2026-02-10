"use client"

import { useState, useEffect } from "react"
import { createBlockedPeriod, deleteBlockedPeriod } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon, Trash2, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { useI18n } from "@/components/i18n/locale-provider"

export function BlockManager({ clubSlug, courts, initialBlocks }: { clubSlug: string, courts: any[], initialBlocks: any[] }) {
  const [blocks, setBlocks] = useState(initialBlocks)
  const [reason, setReason] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [targetCourt, setTargetCourt] = useState("all")
  const [isLoading, setIsLoading] = useState(false)
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null)
  const router = useRouter()
  const { t } = useI18n()

  useEffect(() => {
    setBlocks(initialBlocks)
  }, [initialBlocks])

  const handleAdd = async () => {
    if (!reason || !startDate || !endDate) return alert(t("admin_blocks.fill", "Bitte alle Felder ausfüllen"))

    setIsLoading(true)
    const res = await createBlockedPeriod(clubSlug, targetCourt, new Date(startDate), new Date(endDate), reason)
    setIsLoading(false)

    if (res.success) {
      setReason("")
      setStartDate("")
      setEndDate("")
      router.refresh()
    } else {
      alert(t("admin_blocks.error", "Fehler") + ": " + res.error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t("admin_blocks.confirm", "Sperre aufheben?"))) return

    setIsDeletingId(id)
    setBlocks(prev => prev.filter(b => b.id !== id))
    await deleteBlockedPeriod(id)
    setIsDeletingId(null)
    router.refresh()
  }

  return (
    <Card className="rounded-2xl border border-orange-200/70 bg-orange-50/60 shadow-sm">
      <CardHeader>
        <CardTitle className="text-orange-900 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" /> {t("admin_blocks.title", "Sperrzeiten & Events")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          {blocks.map(block => (
            <div key={block.id} className="bg-white p-3 rounded-xl border border-slate-200/60 flex justify-between items-center text-sm shadow-sm">
              <div>
                <span className="font-bold text-slate-800">{block.reason}</span>
                <span className="mx-2 text-slate-400">|</span>
                <span>{format(new Date(block.start_date), 'dd.MM.yy')} - {format(new Date(block.end_date), 'dd.MM.yy')}</span>
                <span className="mx-2 text-slate-400">|</span>
                <span className="italic text-slate-500">
                  {!block.court_id ? t("admin_blocks.all_courts", "Alle Plätze") : t("admin_blocks.single_court", "Einzelplatz")}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(block.id)}
                disabled={isDeletingId === block.id}
                className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full"
              >
                {isDeletingId === block.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
              </Button>
            </div>
          ))}
          {blocks.length === 0 && <p className="text-sm text-slate-500 italic">{t("admin_blocks.empty", "Keine Sperrzeiten eingetragen.")}</p>}
        </div>

        <div className="grid gap-4 md:grid-cols-4 items-end bg-white p-4 rounded-xl border border-slate-200/60">
          <div className="space-y-1">
            <Label>{t("admin_blocks.reason", "Grund")}</Label>
            <Input placeholder={t("admin_blocks.reason_ph", "z.B. Winterpause")} value={reason} onChange={e => setReason(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>{t("admin_blocks.from", "Von")}</Label>
            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>{t("admin_blocks.to", "Bis")}</Label>
            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>{t("admin_blocks.scope", "Betrifft")}</Label>
            <Select value={targetCourt} onValueChange={setTargetCourt}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("admin_blocks.club", "Ganzer Verein")}</SelectItem>
                {courts.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={handleAdd} disabled={isLoading} className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-full">
          {isLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
          {isLoading ? t("admin_blocks.saving", "Speichere...") : t("admin_blocks.save", "Sperrzeit eintragen")}
        </Button>
      </CardContent>
    </Card>
  )
}
