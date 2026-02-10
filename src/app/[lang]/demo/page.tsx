"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { format } from "date-fns"
import { usePathname, useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SidebarNav } from "@/components/admin/sidebar-nav"
import { DashboardStats } from "@/components/admin/dashboard-stats"
import { Sparkles, Calendar, Clock, User, ArrowRight } from "lucide-react"
import { useI18n } from "@/components/i18n/locale-provider"

const demoClub = {
  name: "TC Bergblick",
  primary_color: "#1F3D2B",
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

export default function DemoPage() {
  const pathname = usePathname()
  const router = useRouter()
  const params = useParams()
  const lang = typeof params?.lang === "string" ? params.lang : "de"
  const { t } = useI18n()
  const initialView = pathname.includes("/member") ? "member" : "admin"
  const [view, setView] = useState<"admin" | "member">(initialView)

  useEffect(() => {
    setView(initialView)
  }, [initialView])

  const navItems = [
    { href: "", label: t("demo.nav.overview", "Übersicht") },
    { href: "/bookings", label: t("demo.nav.bookings", "Buchungen") },
    { href: "/courts", label: t("demo.nav.courts", "Plätze") },
    { href: "/blocks", label: t("demo.nav.blocks", "Sperrzeiten") },
    { href: "/plans", label: t("demo.nav.plans", "Abos") },
    { href: "/members", label: t("demo.nav.members", "Mitglieder") },
    { href: "/trainers", label: t("demo.nav.trainers", "Trainer") },
    { href: "/courses", label: t("demo.nav.courses", "Kurse") },
    { href: "/finance", label: t("demo.nav.finance", "Finanzen") },
    { href: "/vouchers", label: t("demo.nav.vouchers", "Gutscheine") },
    { href: "/settings", label: t("demo.nav.settings", "Einstellungen") },
    { href: "/export", label: t("demo.nav.export", "Export") },
  ]

  return (
    <div className="min-h-screen bg-[#F9F8F4]">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-2xl border border-[#1F3D2B]/15 bg-white/90 p-5 shadow-sm">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-[#1F3D2B]/70">{t("demo.hero.badge", "Demo")}</div>
            <h1 className="text-2xl md:text-3xl font-semibold text-[#0E1A14]">{t("demo.hero.title", "Avaimo Live Demo")}</h1>
            <p className="text-sm text-[#0E1A14]/60">{t("demo.hero.subtitle", "Wechsel zwischen Admin-Ansicht und Mitglieder-Ansicht. Keine Anmeldung nötig.")}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setView("admin")
                router.push(`/${lang}/demo`)
              }}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                view === "admin"
                  ? "bg-[#1F3D2B] text-[#F9F8F4]"
                  : "border border-[#1F3D2B]/30 text-[#1F3D2B]"
              }`}
            >
              {t("demo.hero.admin", "Admin Ansicht")}
            </button>
            <button
              type="button"
              onClick={() => {
                setView("member")
                router.push(`/${lang}/demo/member`)
              }}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                view === "member"
                  ? "bg-[#1F3D2B] text-[#F9F8F4]"
                  : "border border-[#1F3D2B]/30 text-[#1F3D2B]"
              }`}
            >
              {t("demo.hero.member", "Mitglieder Ansicht")}
            </button>
            <Link href={`/${lang}`} className="rounded-full border border-[#1F3D2B]/30 px-4 py-2 text-sm text-[#1F3D2B]">
              {t("demo.hero.back", "Zurück zur Website")}
            </Link>
          </div>
        </div>

        {view === "admin" ? (
          <div className="grid lg:grid-cols-[260px_minmax(0,1fr)] gap-6">
            <aside className="space-y-4">
              <div className="rounded-2xl border border-[#1F3D2B]/15 bg-white/90 p-4 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1F3D2B]/60 mb-3">
                  {t("demo.admin.nav", "Navigation")}
                </div>
                <SidebarNav slug="demo" items={navItems} accentColor={demoClub.primary_color} basePath={`/${lang}/demo`} />
              </div>
            </aside>

            <main className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-[#1F3D2B]/15 bg-white/90 p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center text-white font-bold shadow-sm overflow-hidden border border-slate-200"
                    style={{ backgroundColor: demoClub.primary_color }}
                  >
                    <span className="text-xl">{demoClub.name.substring(0, 2).toUpperCase()}</span>
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-semibold text-[#0E1A14] tracking-tight">
                      {t("demo.admin.title", "Admin Dashboard")}
                    </h2>
                    <p className="text-[#0E1A14]/60">{t("demo.admin.subtitle", "Verwaltung für")} {demoClub.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" className="rounded-full" disabled>
                    {t("demo.admin.preview", "Vorschau")}
                  </Button>
                  <Button variant="ghost" className="rounded-full" disabled>
                    {t("demo.admin.logout", "Abmelden")}
                  </Button>
                </div>
              </div>

              <DashboardStats bookings={demoBookings} courts={demoCourts} />

              <div className="grid xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                  <Card className="rounded-2xl border border-[#1F3D2B]/15 bg-white/90 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>{t("demo.admin.recent", "Letzte Aktivitäten")}</CardTitle>
                      <span className="text-xs text-[#0E1A14]/60">{demoBookings.length} {t("demo.admin.entries", "Einträge")}</span>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4 max-h-[520px] overflow-auto pr-2">
                        {demoBookings.map((booking) => (
                          <div
                            key={booking.id}
                            className="flex items-center justify-between p-4 border border-[#1F3D2B]/15 rounded-xl bg-white hover:shadow-sm transition-shadow"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-[#F9F8F4] flex items-center justify-center font-bold text-[#1F3D2B] text-xs border border-[#1F3D2B]/15">
                                {format(new Date(booking.start_time), "dd.MM")}
                              </div>
                              <div>
                                <div className="font-semibold text-[#0E1A14]">
                                  {booking.courts?.name || t("demo.admin.unknown_court", "Unbekannter Platz")}
                                </div>
                                <div className="text-sm text-[#0E1A14]/60">
                                  {format(new Date(booking.start_time), "HH:mm")} {t("demo.admin.clock", "Uhr")} - {booking.guest_name}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="text-right hidden sm:block">
                                <div className="font-medium text-[#0E1A14]">
                                  {booking.status === "awaiting_payment" || booking.payment_status === "unpaid"
                                    ? t("demo.admin.status.pending", "Ausstehend")
                                    : booking.payment_status === "paid_cash"
                                      ? t("demo.admin.status.cash", "Vor Ort")
                                      : booking.payment_status === "paid_member"
                                        ? t("demo.admin.status.membership", "Abo")
                                        : t("demo.admin.status.online", "Online")}
                                </div>
                                <div className="text-xs text-[#0E1A14]/60 capitalize">{booking.status}</div>
                              </div>
                              <button className="rounded-full border border-[#1F3D2B]/20 px-3 py-1 text-xs text-[#1F3D2B]">
                                {t("demo.admin.details", "Details")}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6 xl:sticky xl:top-6 h-fit">
                  <Card className="rounded-2xl border border-[#1F3D2B]/15 bg-white/90 shadow-sm">
                    <CardHeader>
                      <CardTitle>{t("demo.admin.quick", "Schnellzugriff")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {[
                          t("demo.admin.quick_items.settings", "Einstellungen"),
                          t("demo.admin.quick_items.vouchers", "Gutscheine"),
                          t("demo.admin.quick_items.courts", "Plätze"),
                          t("demo.admin.quick_items.blocks", "Sperrzeiten"),
                          t("demo.admin.quick_items.plans", "Abos"),
                          t("demo.admin.quick_items.members", "Mitglieder"),
                          t("demo.admin.quick_items.trainers", "Trainer"),
                          t("demo.admin.quick_items.courses", "Kurse"),
                          t("demo.admin.quick_items.finance", "Finanzen"),
                          t("demo.admin.quick_items.export", "CSV Export"),
                        ].map((label) => (
                          <div
                            key={label}
                            className="rounded-xl border border-[#1F3D2B]/15 bg-white px-3 py-2 text-[#1F3D2B]"
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
              <header className="relative overflow-hidden rounded-2xl border border-[#1F3D2B]/15 bg-white/90 p-6 shadow-sm">
                <div
                  className="absolute -top-10 -right-10 h-40 w-40 rounded-full blur-2xl"
                  style={{ backgroundColor: demoClub.primary_color, opacity: 0.12 }}
                />
                <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#1F3D2B]/20 bg-white/90 px-3 py-1 text-xs text-[#1F3D2B]">
                      <Sparkles className="w-3.5 h-3.5" /> {t("demo.member.active", "Mitglied aktiv")}
                    </div>
                    <h2 className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight">
                      {t("demo.member.hello", "Hallo Erna!")}
                    </h2>
                    <p className="text-[#0E1A14]/60">{t("demo.member.welcome", "Willkommen bei")} {demoClub.name}!</p>
                  </div>
                  <div className="flex flex-col items-start md:items-end gap-3 w-full md:w-auto">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/90 text-[#0E1A14] px-4 py-2 text-sm font-semibold border border-[#1F3D2B]/20">
                      {t("demo.member.plan", "Premium Aktiv")}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      <Button variant="outline" className="gap-2 rounded-full w-full sm:w-auto">
                        {t("demo.member.settings", "Einstellungen")}
                      </Button>
                      <Button variant="outline" className="gap-2 rounded-full w-full sm:w-auto">
                        {t("demo.member.documents", "Dokumente")}
                      </Button>
                      <Button variant="outline" className="gap-2 rounded-full w-full sm:w-auto">
                        {t("demo.member.booking", "Zur Buchung")} <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </header>

              <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
                <Card className="rounded-2xl border border-[#1F3D2B]/15 bg-white/90 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex gap-2 items-center">
                      <Sparkles className="text-[#1F3D2B]" /> {t("demo.member.status", "Dein Status")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-semibold">{t("demo.member.active_state", "Aktiv")}</div>
                    <p className="text-sm text-[#0E1A14]/60 mt-2">{t("demo.member.valid_until", "gültig bis: 31.12.2026")}</p>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                      {[12, 4, 3].map((val, idx) => (
                        <div key={idx} className="rounded-xl border border-[#1F3D2B]/15 bg-white/90 px-2 py-2">
                          <div className="text-lg font-semibold">{val}</div>
                          <div className="text-xs text-[#0E1A14]/60">
                            {idx === 0 ? t("demo.member.stats.wins", "Siege") : idx === 1 ? t("demo.member.stats.losses", "Niederl.") : t("demo.member.stats.streak", "Streak")}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border border-[#1F3D2B]/15 bg-white/90 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex gap-2 items-center">
                      <Calendar className="text-[#1F3D2B]" /> {t("demo.member.next", "Nächster Termin")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-2xl font-semibold">12.02.2026</div>
                      <div className="text-sm text-[#0E1A14]/60 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        18:30 {t("demo.member.clock", "Uhr")}
                      </div>
                      <div className="text-sm text-[#0E1A14]/70">{t("demo.member.court", "Platz 2")}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border border-[#1F3D2B]/15 bg-white/90 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex gap-2 items-center">
                      <User className="text-[#1F3D2B]" /> {t("demo.member.profile", "Profil")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-[#0E1A14]/60">{t("demo.member.profile_desc", "Kontaktdaten und Angaben.")}</div>
                  </CardContent>
                </Card>
              </div>

              <Card className="rounded-2xl border border-[#1F3D2B]/15 bg-white/90 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex gap-2 items-center">
                    <Calendar className="text-[#1F3D2B]" /> {t("demo.member.upcoming", "Deine nächsten Spiele")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {demoBookings.map((b) => (
                      <div
                        key={b.id}
                        className="flex items-center justify-between p-3 border border-[#1F3D2B]/15 rounded-xl bg-white"
                      >
                        <div>
                          <div className="font-semibold text-base">
                            {format(new Date(b.start_time), "dd.MM.yyyy")}
                          </div>
                          <div className="text-sm text-[#0E1A14]/60 flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(b.start_time), "HH:mm")} {t("demo.member.clock", "Uhr")}
                            <span className="mx-1">-</span>
                            {b.courts?.name}
                          </div>
                        </div>
                        <button className="rounded-full border border-[#1F3D2B]/20 px-3 py-1 text-xs text-[#1F3D2B]">
                          {t("demo.member.cancel", "Stornieren")}
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

