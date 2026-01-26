"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, Pie, PieChart } from "recharts"
import { Euro, CalendarCheck, Trophy } from "lucide-react"

export function DashboardStats({ bookings, courts }: { bookings: any[], courts: any[] }) {
  
  // 1. KPI: Gesamtumsatz berechnen (Nur 'paid_cash' oder 'paid_online')
  // Wir nehmen an, jede Buchung hat den Preis des Platzes.
  // Da wir den Preis aktuell nicht in der Buchung speichern (sondern im Platz),
  // müssen wir ihn uns holen. (Vereinfachung: Wir nehmen an, alle zahlen voll).
  
  const totalRevenue = bookings.reduce((sum, booking) => {
    // Finde den Preis des Platzes für diese Buchung
    const court = courts.find(c => c.id === booking.court_id)
    return sum + (court ? court.price_per_hour : 0)
  }, 0)

  const totalBookings = bookings.length

  // 2. DIAGRAMM DATEN: Umsatz pro Tag (Letzte 7 Tage oder alle)
  // Wir gruppieren die Buchungen nach Datum (YYYY-MM-DD)
  const revenueByDayMap = bookings.reduce((acc: any, booking) => {
    const date = new Date(booking.start_time).toLocaleDateString('de-DE', { weekday: 'short' }) // z.B. "Mo", "Di"
    const court = courts.find(c => c.id === booking.court_id)
    const price = court ? court.price_per_hour : 0
    
    acc[date] = (acc[date] || 0) + price
    return acc
  }, {})

  // Daten für Recharts formatieren
  const chartData = Object.keys(revenueByDayMap).map(key => ({
    name: key,
    total: revenueByDayMap[key]
  }))

  // 3. DIAGRAMM DATEN: Beliebteste Plätze
  const popularityMap = bookings.reduce((acc: any, booking) => {
    const court = courts.find(c => c.id === booking.court_id)
    const name = court ? court.name : 'Unbekannt'
    acc[name] = (acc[name] || 0) + 1
    return acc
  }, {})

  const pieData = Object.keys(popularityMap).map(key => ({
    name: key,
    value: popularityMap[key]
  }))

  // Bester Platz für KPI Card
  const bestCourt = pieData.sort((a, b) => b.value - a.value)[0]?.name || "-"
  
  // Farben für das Tortendiagramm
  const COLORS = ['#e11d48', '#0ea5e9', '#22c55e', '#eab308']

  return (
    <div className="space-y-4">
      
      {/* KPI KARTEN */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamtumsatz</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenue}€</div>
            <p className="text-xs text-muted-foreground">+20.1% zum Vormonat (Demo)</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Buchungen</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings}</div>
            <p className="text-xs text-muted-foreground">Aktuell im System</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Platz</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bestCourt}</div>
            <p className="text-xs text-muted-foreground">Am häufigsten gebucht</p>
          </CardContent>
        </Card>
      </div>

      {/* DIAGRAMME */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        
        {/* BALKENDIAGRAMM (Umsatz) */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Umsatz Übersicht</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis 
                    dataKey="name" 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}€`}
                  />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="total" fill="#e11d48" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* TORTENDIAGRAMM (Plätze) */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Platzverteilung</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[240px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 text-xs text-slate-500 mt-2">
              {pieData.map((entry, index) => (
                <div key={index} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
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