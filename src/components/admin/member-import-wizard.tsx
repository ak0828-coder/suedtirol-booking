"use client"

import { useState } from "react"
import Papa from "papaparse"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles, UploadCloud, CheckCircle, ArrowRight } from "lucide-react"
import { analyzeCsvHeaders, importMembersBatch } from "@/app/actions"

const DB_FIELDS = [
  { id: "first_name", label: "Vorname" },
  { id: "last_name", label: "Nachname" },
  { id: "email", label: "E-Mail (Pflicht)" },
  { id: "phone", label: "Telefon" },
  { id: "credit_balance", label: "Guthaben" },
  { id: "membership_start_date", label: "Eintrittsdatum (Start)" },
  { id: "membership_end_date", label: "Gültig bis (Ende)" },
]

type Mapping = Record<string, string>

export function MemberImportWizard({ clubSlug }: { clubSlug: string }) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [csvData, setCsvData] = useState<any[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [mapping, setMapping] = useState<Mapping>({})
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [importing, setImporting] = useState(false)
  const [fallbackMode, setFallbackMode] = useState<"year_from_start" | "calendar_year_end" | "infinite" | "year_from_today">("year_from_start")
  const [importStats, setImportStats] = useState<{ imported: number; failed: number } | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const fileHeaders = (results.meta.fields || []).filter(Boolean) as string[]
        setHeaders(fileHeaders)
        setCsvData(results.data as any[])
        setStep(2)

        if (fileHeaders.length > 0) {
          setIsAnalyzing(true)
          const ai = await analyzeCsvHeaders(fileHeaders)
          setIsAnalyzing(false)
          if (ai?.success && ai.mapping) {
            const nextMapping: Mapping = {}
            Object.entries(ai.mapping).forEach(([dbField, csvHeader]) => {
              if (fileHeaders.includes(csvHeader as string)) {
                nextMapping[dbField] = csvHeader as string
              }
            })
            setMapping(nextMapping)
          }
        }
      },
    })
  }

  const runImport = async (activateNow: boolean) => {
    setErrorMessage(null)
    if (!mapping.email) {
      setErrorMessage("Bitte ordne eine E-Mail-Spalte zu (Pflichtfeld).")
      return
    }
    if (csvData.length === 0) {
      setErrorMessage("Keine Datensätze gefunden.")
      return
    }
    setImporting(true)
    setStep(3)

    const rows = csvData.map((row) => {
      const mapped: any = {}
      Object.entries(mapping).forEach(([dbField, csvHeader]) => {
        mapped[dbField] = row[csvHeader]
      })
      return mapped
    })

    const res = await importMembersBatch(clubSlug, rows, {
      activateNow,
      fallbackMode,
    })

    setImporting(false)
    if (res?.success) {
      setImportStats({ imported: res.imported || 0, failed: res.failed || 0 })
      setStep(4)
    } else {
      setImportStats({ imported: 0, failed: rows.length })
      setStep(4)
    }
  }

  return (
    <Card className="border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm">
      <CardHeader>
        <CardTitle>Switch‑Kit: Mitglieder importieren</CardTitle>
        <CardDescription>
          CSV/Excel hochladen, KI ordnet Spalten zu, optional sofort einladen.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 1 && (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 p-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <UploadCloud className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold">CSV Datei hochladen</h3>
            <p className="text-sm text-slate-500 mt-2">
              Wansport/eTennis Export auswählen – wir kümmern uns um den Rest.
            </p>
            <div className="mt-4 flex justify-center">
              <Input type="file" accept=".csv" onChange={handleFileUpload} className="max-w-xs" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  Spalten zuordnen
                  {isAnalyzing && <Sparkles className="h-4 w-4 text-indigo-500 animate-pulse" />}
                </h3>
                <p className="text-sm text-slate-500">KI‑Vorschlag bitte kurz prüfen.</p>
              </div>
              <Badge variant="outline">{csvData.length} Zeilen</Badge>
            </div>

            {isAnalyzing ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
              </div>
            ) : (
              <div className="grid gap-3 rounded-xl border border-slate-200/60 bg-slate-50/60 p-4">
                {DB_FIELDS.map((field) => (
                  <div key={field.id} className="grid grid-cols-1 md:grid-cols-2 items-center gap-3">
                    <Label>{field.label}</Label>
                    <Select
                      value={mapping[field.id] || ""}
                      onValueChange={(val) => setMapping((prev) => ({ ...prev, [field.id]: val }))}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Nicht importieren" />
                      </SelectTrigger>
                      <SelectContent>
                        {headers.map((h) => (
                          <SelectItem key={h} value={h}>
                            {h}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            )}

            {!isAnalyzing && (
              <div className="rounded-xl border border-slate-200/60 bg-white p-4 space-y-2">
                <Label>Falls kein Enddatum vorhanden ist</Label>
                <Select
                  value={fallbackMode}
                  onValueChange={(val) => setFallbackMode(val as typeof fallbackMode)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="year_from_start">1 Jahr ab Eintrittsdatum</SelectItem>
                    <SelectItem value="calendar_year_end">Bis 31.12. des laufenden Jahres</SelectItem>
                    <SelectItem value="year_from_today">1 Jahr ab heute</SelectItem>
                    <SelectItem value="infinite">Unbegrenzt</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  Avaimo berechnet automatisch das Ablaufdatum.
                </p>
              </div>
            )}

            {!isAnalyzing && (
              <div className="grid sm:grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => runImport(false)}
                  disabled={importing}
                  className="rounded-full"
                >
                  Nur importieren (still)
                </Button>
                <Button
                  onClick={() => runImport(true)}
                  disabled={importing}
                  className="rounded-full club-primary-bg"
                >
                  {importing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Importieren & Einladen <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            )}
            {errorMessage && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                {errorMessage}
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="py-10 text-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin mx-auto text-slate-500" />
            <p className="text-slate-600">Import läuft… bitte warten.</p>
          </div>
        )}

        {step === 4 && (
          <div className="py-10 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold">Import abgeschlossen</h3>
            <p className="text-sm text-slate-500">
              {importStats?.imported || 0} importiert, {importStats?.failed || 0} Fehler.
            </p>
            <Button variant="outline" className="rounded-full" onClick={() => setStep(1)}>
              Neuen Import starten
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
