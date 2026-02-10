"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { exportMemberBookingsCsv } from "@/app/actions"
import { useI18n } from "@/components/i18n/locale-provider"
import { useParams } from "next/navigation"

type BookingRow = {
  id: string
  start_time: string
  end_time: string
  status: string | null
  payment_status: string | null
  price_paid: number | null
  courts?: { name?: string | null }[] | null
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
  const { t } = useI18n()
  const params = useParams()
  const langRaw = params?.lang
  const lang = typeof langRaw === "string" ? langRaw : Array.isArray(langRaw) ? langRaw[0] : "de"
  const locale = lang === "it" ? "it-IT" : lang === "en" ? "en-US" : "de-DE"

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
      link.download = t("admin_member_bookings.filename", "mitglied-buchungen.csv")
      link.click()
      URL.revokeObjectURL(url)
    }
    setExporting(false)
  }

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-800">{t("admin_member_bookings.title", "Buchungsübersicht")}</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            className="rounded-full text-xs"
            onClick={() => setFilter("all")}
          >
            {t("admin_member_bookings.all", "Alle")}
          </Button>
          <Button
            variant={filter === "upcoming" ? "default" : "outline"}
            className="rounded-full text-xs"
            onClick={() => setFilter("upcoming")}
          >
            {t("admin_member_bookings.upcoming", "Zukünftig")}
          </Button>
          <Button
            variant={filter === "past" ? "default" : "outline"}
            className="rounded-full text-xs"
            onClick={() => setFilter("past")}
          >
            {t("admin_member_bookings.past", "Vergangen")}
          </Button>
          <Button variant="outline" className="rounded-full text-xs" onClick={handleExport} disabled={exporting}>
            {exporting ? t("admin_member_bookings.exporting", "Export...") : t("admin_member_bookings.export", "CSV Export")}
          </Button>
        </div>
      </div>

      {visible && visible.length > 0 ? (
        <div className="max-h-72 overflow-auto space-y-2 pr-1">
          {visible.map((b) => (
            <div key={b.id} className="rounded-xl border border-slate-200/60 bg-white/90 px-3 py-2 text-sm">
              <div className="font-medium text-slate-800">{b.courts?.[0]?.name || t("admin_member_bookings.court", "Platz")}</div>
              <div className="text-xs text-slate-500">
                {new Date(b.start_time).toLocaleDateString(locale)} ·{" "}
                {new Date(b.start_time).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })} –{" "}
                {new Date(b.end_time).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}
              </div>
              <div className="text-xs text-slate-500">
                {t("admin_member_bookings.status", "Status")}: {b.status || "-"} · {t("admin_member_bookings.payment", "Zahlung")}: {b.payment_status || "-"}
              </div>
            </div>
          ))}
          {visibleCount < filtered.length && (
            <Button variant="outline" className="w-full rounded-full text-xs" onClick={() => setVisibleCount((v) => v + 8)}>
              {t("admin_member_bookings.more", "Mehr anzeigen")}
            </Button>
          )}
        </div>
      ) : (
        <p className="text-sm text-slate-500">{t("admin_member_bookings.empty", "Keine Buchungen vorhanden.")}</p>
      )}
    </div>
  )
}
