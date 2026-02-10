"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, Pie, PieChart } from "recharts"
import { Euro, CalendarCheck, Trophy } from "lucide-react"
import { useI18n } from "@/components/i18n/locale-provider"
import { useParams } from "next/navigation"

export function DashboardStats({ bookings, courts }: { bookings: any[]; courts: any[] }) {
  const safeBookings = Array.isArray(bookings) ? bookings : []
  const safeCourts = Array.isArray(courts) ? courts : []
  const { t } = useI18n()
  const params = useParams()
  const langRaw = params?.lang
  const lang = typeof langRaw === "string" ? langRaw : Array.isArray(langRaw) ? langRaw[0] : "de"
  const locale = lang === "it" ? "it-IT" : lang === "en" ? "en-US" : "de-DE"

  const totalRevenue = safeBookings.reduce((sum, booking) => {
    const court = safeCourts.find((c) => c.id === booking.court_id)
    return sum + (court ? court.price_per_hour : 0)
  }, 0)

  const totalBookings = safeBookings.length

  const revenueByDayMap = safeBookings.reduce((acc: any, booking) => {
    const date = new Date(booking.start_time).toLocaleDateString(locale, { weekday: "short" })
    const court = safeCourts.find((c) => c.id === booking.court_id)
    const price = court ? court.price_per_hour : 0
    acc[date] = (acc[date] || 0) + price
    return acc
  }, {})

  const chartData = Object.keys(revenueByDayMap).map((key) => ({
    name: key,
    total: revenueByDayMap[key],
  }))

  const popularityMap = safeBookings.reduce((acc: any, booking) => {
    const court = safeCourts.find((c) => c.id === booking.court_id)
    const name = court ? court.name : t("admin_dashboard.unknown", "Unbekannt")
    acc[name] = (acc[name] || 0) + 1
    return acc
  }, {})

  const pieData = Object.keys(popularityMap).map((key) => ({
    name: key,
    value: popularityMap[key],
  }))

  const bestCourt = pieData.sort((a, b) => b.value - a.value)[0]?.name || "-"
  const COLORS = ["#e11d48", "#0ea5e9", "#22c55e", "#eab308"]

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-2xl border border-slate-200/60 bg-white/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("admin_dashboard.revenue", "Gesamtumsatz")}</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{totalRevenue} EUR</div>
            <p className="text-xs text-muted-foreground">{t("admin_dashboard.revenue_hint", "+20.1% zum Vormonat (Demo)")}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-200/60 bg-white/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("admin_dashboard.bookings", "Buchungen")}</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{totalBookings}</div>
            <p className="text-xs text-muted-foreground">{t("admin_dashboard.bookings_hint", "Aktuell im System")}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-200/60 bg-white/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("admin_dashboard.top_court", "Top Platz")}</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{bestCourt}</div>
            <p className="text-xs text-muted-foreground">{t("admin_dashboard.top_court_hint", "Am häufigsten gebucht")}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 rounded-3xl border border-slate-200/60 bg-white/80 shadow-sm">
          <CardHeader>
            <CardTitle>{t("admin_dashboard.revenue_overview", "Umsatz Übersicht")}</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[240px]">
              {chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-slate-400">
                  {t("admin_dashboard.no_data", "Keine Daten vorhanden")}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={200}>
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value} EUR`} />
                    <Tooltip
                      cursor={{ fill: "transparent" }}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Bar dataKey="total" fill="#e11d48" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 rounded-3xl border border-slate-200/60 bg-white/80 shadow-sm">
          <CardHeader>
            <CardTitle>{t("admin_dashboard.distribution", "Platzverteilung")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[240px] flex items-center justify-center">
              {pieData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-slate-400">
                  {t("admin_dashboard.no_data", "Keine Daten vorhanden")}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={200}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="flex justify-center gap-4 text-xs text-slate-500 mt-2">
              {pieData.map((entry, index) => (
                <div key={index} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  {entry.name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
