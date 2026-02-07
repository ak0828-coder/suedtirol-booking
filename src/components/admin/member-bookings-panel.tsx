"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { exportMemberBookingsCsv } from "@/app/actions"

type BookingRow = {
  id: string
  start_time: string
  end_time: string
  status: string | null
  payment_status: string | null
  price_paid: number | null
  courts?: { name?: string | null } | null
}

export function MemberBookingsPanel({
  bookings,
  clubSlug,
  memberId,
}: {
  bookings: BookingRow[]
  clubSlug: string
  memberId: string
}) {
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all")
  const [visibleCount, setVisibleCount] = useState(8)
  const [exporting, setExporting] = useState(false)

  const filtered = useMemo(() => {
    if (filter === "all") return bookings
    const now = new Date()
    return bookings.filter((b) => {
      const start = new Date(b.start_time)
      return filter === "upcoming" ? start >= now : start < now
    })
  }, [bookings, filter])

  const visible = filtered.slice(0, visibleCount)

  const handleExport = async () => {
    if (!bookings || bookings.length === 0) return
    setExporting(true)
    const res = await exportMemberBookingsCsv(clubSlug, memberId)
    if (res?.success && res.csv) {
      const blob = new Blob([res.csv], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "mitglied-buchungen.csv"
      link.click()
      URL.revokeObjectURL(url)
    }
    setExporting(false)
  }

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-800">Buchungsübersicht</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            className="rounded-full text-xs"
            onClick={() => setFilter("all")}
          >
            Alle
          </Button>
          <Button
            variant={filter === "upcoming" ? "default" : "outline"}
            className="rounded-full text-xs"
            onClick={() => setFilter("upcoming")}
          >
            Zukünftig
          </Button>
          <Button
            variant={filter === "past" ? "default" : "outline"}
            className="rounded-full text-xs"
            onClick={() => setFilter("past")}
          >
            Vergangen
          </Button>
          <Button variant="outline" className="rounded-full text-xs" onClick={handleExport} disabled={exporting}>
            {exporting ? "Export..." : "CSV Export"}
          </Button>
        </div>
      </div>

      {visible && visible.length > 0 ? (
        <div className="max-h-72 overflow-auto space-y-2 pr-1">
          {visible.map((b) => (
            <div key={b.id} className="rounded-xl border border-slate-200/60 bg-white/90 px-3 py-2 text-sm">
              <div className="font-medium text-slate-800">{b.courts?.name || "Platz"}</div>
              <div className="text-xs text-slate-500">
                {new Date(b.start_time).toLocaleDateString("de-DE")} ·{" "}
                {new Date(b.start_time).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} –{" "}
                {new Date(b.end_time).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
              </div>
              <div className="text-xs text-slate-500">Status: {b.status || "-"} · Zahlung: {b.payment_status || "-"}</div>
            </div>
          ))}
          {visibleCount < filtered.length && (
            <Button variant="outline" className="w-full rounded-full text-xs" onClick={() => setVisibleCount((v) => v + 8)}>
              Mehr anzeigen
            </Button>
          )}
        </div>
      ) : (
        <p className="text-sm text-slate-500">Keine Buchungen vorhanden.</p>
      )}
    </div>
  )
}
