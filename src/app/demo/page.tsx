"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { format } from "date-fns"
import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SidebarNav } from "@/components/admin/sidebar-nav"
import { DashboardStats } from "@/components/admin/dashboard-stats"
import { Sparkles, Calendar, Clock, User, ArrowRight } from "lucide-react"

const demoClub = {
  name: "TC Bergblick",
  primary_color: "#0f172a",
}

const demoCourts = [
  { id: "c1", name: "Platz 1", price_per_hour: 28 },
  { id: "c2", name: "Platz 2", price_per_hour: 28 },
  { id: "c3", name: "Platz 3", price_per_hour: 32 },
]

const demoBookings = [
  {
    id: "b1",
    court_id: "c3",
    start_time: new Date().toISOString(),
    guest_name: "Erna M.",
    status: "confirmed",
    payment_status: "paid_stripe",
    courts: { name: "Platz 3" },
  },
  {
    id: "b2",
    court_id: "c1",
    start_time: new Date(Date.now() + 3600 * 1000 * 4).toISOString(),
    guest_name: "Alex K.",
    status: "awaiting_payment",
    payment_status: "unpaid",
    courts: { name: "Platz 1" },
  },
  {
    id: "b3",
    court_id: "c2",
    start_time: new Date(Date.now() + 3600 * 1000 * 7).toISOString(),
    guest_name: "Gast",
    status: "confirmed",
    payment_status: "paid_cash",
    courts: { name: "Platz 2" },
  },
]

const navItems = [
  { href: "", label: "Uebersicht" },
  { href: "/bookings", label: "Buchungen" },
  { href: "/courts", label: "Plaetze" },
  { href: "/blocks", label: "Sperrzeiten" },
  { href: "/plans", label: "Abos" },
  { href: "/members", label: "Mitglieder" },
  { href: "/trainers", label: "Trainer" },
  { href: "/courses", label: "Kurse" },
  { href: "/finance", label: "Finanzen" },
  { href: "/vouchers", label: "Gutscheine" },
  { href: "/settings", label: "Einstellungen" },
  { href: "/export", label: "Export" },
]

export default function DemoPage() {
  const pathname = usePathname()
  const router = useRouter()
  const initialView = pathname.includes("/member") ? "member" : "admin"
  const [view, setView] = useState<"admin" | "member">(initialView)

  useEffect(() => {
    setView(initialView)
  }, [initialView])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-2xl border border-slate-200/60 bg-white/80 p-5 shadow-sm">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500">Demo</div>
            <h1 className="text-2xl md:text-3xl font-semibold">Avaimo Live Demo</h1>
            <p className="text-sm text-slate-500">
              Wechsel zwischen Admin-Ansicht und Mitglieder-Ansicht. Keine Anmeldung noetig.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setView("admin")
                router.push("/demo")
              }}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                view === "admin"
                  ? "bg-slate-900 text-white"
                  : "border border-slate-300 text-slate-700"
              }`}
            >
              Admin Ansicht
            </button>
            <button
              type="button"
              onClick={() => {
                setView("member")
                router.push("/demo/member")
              }}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                view === "member"
                  ? "bg-slate-900 text-white"
                  : "border border-slate-300 text-slate-700"
              }`}
            >
              Mitglieder Ansicht
            </button>
            <Link href="/" className="rounded-full border border-slate-300 px-4 py-2 text-sm">
              Zurueck zur Website
            </Link>
          </div>
        </div>

        {view === "admin" ? (
          <div className="grid lg:grid-cols-[260px_minmax(0,1fr)] gap-6">
            <aside className="space-y-4">
              <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-4 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
                  Navigation
                </div>
                <SidebarNav slug="demo" items={navItems} accentColor={demoClub.primary_color} basePath="/demo" />
              </div>
            </aside>

            <main className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center text-white font-bold shadow-sm overflow-hidden border border-slate-200"
                    style={{ backgroundColor: demoClub.primary_color }}
                  >
                    <span className="text-xl">{demoClub.name.substring(0, 2).toUpperCase()}</span>
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight">
                      Admin Dashboard
                    </h2>
                    <p className="text-slate-500">Verwaltung fuer {demoClub.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" className="rounded-full" disabled>
                    Vorschau
                  </Button>
                  <Button variant="ghost" className="rounded-full" disabled>
                    Abmelden
                  </Button>
                </div>
              </div>

              <DashboardStats bookings={demoBookings} courts={demoCourts} />

              <div className="grid xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                  <Card className="rounded-2xl border border-slate-200/60 bg-white/80 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Letzte Aktivitaeten</CardTitle>
                      <span className="text-xs text-slate-500">{demoBookings.length} Eintraege</span>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4 max-h-[520px] overflow-auto pr-2">
                        {demoBookings.map((booking) => (
                          <div
                            key={booking.id}
                            className="flex items-center justify-between p-4 border border-slate-200/60 rounded-xl bg-white hover:shadow-sm transition-shadow"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs">
                                {format(new Date(booking.start_time), "dd.MM")}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900">
                                  {booking.courts?.name || "Unbekannter Platz"}
                                </div>
                                <div className="text-sm text-slate-500">
                                  {format(new Date(booking.start_time), "HH:mm")} Uhr - {booking.guest_name}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="text-right hidden sm:block">
                                <div className="font-medium text-slate-900">
                                  {booking.status === "awaiting_payment" || booking.payment_status === "unpaid"
                                    ? "Ausstehend"
                                    : booking.payment_status === "paid_cash"
                                      ? "Vor Ort"
                                      : booking.payment_status === "paid_member"
                                        ? "Abo"
                                        : "Online"}
                                </div>
                                <div className="text-xs text-slate-500 capitalize">{booking.status}</div>
                              </div>
                              <button className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600">
                                Details
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6 xl:sticky xl:top-6 h-fit">
                  <Card className="rounded-2xl border border-slate-200/60 bg-white/80 shadow-sm">
                    <CardHeader>
                      <CardTitle>Schnellzugriff</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {[
                          "Einstellungen",
                          "Gutscheine",
                          "Plaetze",
                          "Sperrzeiten",
                          "Abos",
                          "Mitglieder",
                          "Trainer",
                          "Kurse",
                          "Finanzen",
                          "CSV Export",
                        ].map((label) => (
                          <div
                            key={label}
                            className="rounded-xl border border-slate-200/60 bg-white px-3 py-2 text-slate-700"
                          >
                            {label}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </main>
          </div>
        ) : (
          <div className="min-h-[70vh]">
            <div className="max-w-4xl mx-auto space-y-6">
              <header className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm">
                <div
                  className="absolute -top-10 -right-10 h-40 w-40 rounded-full blur-2xl"
                  style={{ backgroundColor: demoClub.primary_color, opacity: 0.12 }}
                />
                <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/60 bg-white/90 px-3 py-1 text-xs text-slate-700">
                      <Sparkles className="w-3.5 h-3.5" /> Mitglied aktiv
                    </div>
                    <h2 className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight">
                      Hallo Erna!
                    </h2>
                    <p className="text-slate-500">Willkommen bei {demoClub.name}!</p>
                  </div>
                  <div className="flex flex-col items-start md:items-end gap-3 w-full md:w-auto">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/90 text-slate-900 px-4 py-2 text-sm font-semibold border border-slate-200/60">
                      Premium Aktiv
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      <Button variant="outline" className="gap-2 rounded-full w-full sm:w-auto">
                        Einstellungen
                      </Button>
                      <Button variant="outline" className="gap-2 rounded-full w-full sm:w-auto">
                        Dokumente
                      </Button>
                      <Button variant="outline" className="gap-2 rounded-full w-full sm:w-auto">
                        Zur Buchung <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </header>

              <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
                <Card className="rounded-2xl border border-slate-200/60 bg-white/80 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex gap-2 items-center">
                      <Sparkles className="text-slate-700" /> Dein Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-semibold">Aktiv</div>
                    <p className="text-sm text-slate-500 mt-2">Gueltig bis: 31.12.2026</p>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                      {[12, 4, 3].map((val, idx) => (
                        <div key={idx} className="rounded-xl border border-slate-200/60 bg-white/90 px-2 py-2">
                          <div className="text-lg font-semibold">{val}</div>
                          <div className="text-xs text-slate-500">{idx === 0 ? "Siege" : idx === 1 ? "Niederl." : "Streak"}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border border-slate-200/60 bg-white/80 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex gap-2 items-center">
                      <Calendar className="text-slate-700" /> Naechster Termin
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-2xl font-semibold">12.02.2026</div>
                      <div className="text-sm text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        18:30 Uhr
                      </div>
                      <div className="text-sm text-slate-600">Platz 2</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border border-slate-200/60 bg-white/80 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex gap-2 items-center">
                      <User className="text-slate-600" /> Profil
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-slate-500">Kontaktdaten und Angaben.</div>
                  </CardContent>
                </Card>
              </div>

              <Card className="rounded-2xl border border-slate-200/60 bg-white/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex gap-2 items-center">
                    <Calendar className="text-slate-700" /> Deine naechsten Spiele
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {demoBookings.map((b) => (
                      <div
                        key={b.id}
                        className="flex items-center justify-between p-3 border border-slate-200/60 rounded-xl bg-white"
                      >
                        <div>
                          <div className="font-semibold text-base">
                            {format(new Date(b.start_time), "dd.MM.yyyy")}
                          </div>
                          <div className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(b.start_time), "HH:mm")} Uhr
                            <span className="mx-1">-</span>
                            {b.courts?.name}
                          </div>
                        </div>
                        <button className="rounded-full border border-slate-200 px-3 py-1 text-xs">
                          Stornieren
                        </button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
