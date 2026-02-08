"use client"

import { useState } from "react"
import { exportBookingsCsv, exportCourseRevenueCsv, exportTrainerRevenueCsv } from "@/app/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Loader2, FileSpreadsheet } from "lucide-react"

export function ExportManager({ clubSlug }: { clubSlug: string }) {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear.toString())
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString())
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    const res = await exportBookingsCsv(clubSlug, parseInt(year), parseInt(month))
    setLoading(false)

    if (res.success && res.csv) {
      // Trick um Download im Browser zu starten
      const blob = new Blob([res.csv], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', res.filename || 'export.csv')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      alert(res.error || "Fehler beim Export")
    }
  }

  async function handleCourseExport() {
    setLoading(true)
    const res = await exportCourseRevenueCsv(clubSlug, parseInt(year), parseInt(month))
    setLoading(false)

    if (res.success && res.csv) {
      const blob = new Blob([res.csv], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', res.filename || 'kurseinnahmen.csv')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      alert(res.error || "Fehler beim Export")
    }
  }

  async function handleTrainerExport() {
    setLoading(true)
    const res = await exportTrainerRevenueCsv(clubSlug, parseInt(year), parseInt(month))
    setLoading(false)

    if (res.success && res.csv) {
      const blob = new Blob([res.csv], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', res.filename || 'trainerabrechnungen.csv')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      alert(res.error || "Fehler beim Export")
    }
  }

    return (
        <Card className="rounded-2xl border border-slate-200/60 bg-white/80 shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-green-600" /> Buchhaltung Export
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-1/3 space-y-2">
            <label className="text-sm font-medium">Monat</label>
                        <Select value={month} onValueChange={setMonth}>
                            <SelectTrigger className="bg-white">
                                <SelectValue />
                            </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <SelectItem key={m} value={m.toString()}>
                    {new Date(0, m - 1).toLocaleString('de-DE', { month: 'long' })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full md:w-1/3 space-y-2">
            <label className="text-sm font-medium">Jahr</label>
                        <Select value={year} onValueChange={setYear}>
                            <SelectTrigger className="bg-white">
                                <SelectValue />
                            </SelectTrigger>
              <SelectContent>
                <SelectItem value={(currentYear).toString()}>{currentYear}</SelectItem>
                <SelectItem value={(currentYear - 1).toString()}>{currentYear - 1}</SelectItem>
              </SelectContent>
            </Select>
          </div>

                    <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                      <Button onClick={handleExport} disabled={loading} className="rounded-full w-full md:w-auto">
                        {loading ? <Loader2 className="animate-spin mr-2" /> : <Download className="mr-2 h-4 w-4" />}
                        Buchungen CSV
                      </Button>
                      <Button onClick={handleCourseExport} disabled={loading} className="rounded-full w-full md:w-auto" variant="outline">
                        {loading ? <Loader2 className="animate-spin mr-2" /> : <Download className="mr-2 h-4 w-4" />}
                        Kurseinnahmen CSV
                      </Button>
                      <Button onClick={handleTrainerExport} disabled={loading} className="rounded-full w-full md:w-auto" variant="outline">
                        {loading ? <Loader2 className="animate-spin mr-2" /> : <Download className="mr-2 h-4 w-4" />}
                        Trainerabrechnung CSV
                      </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
  )
}
