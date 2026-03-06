"use client"

import Link from "next/link"
import { format } from "date-fns"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardStats } from "@/components/admin/dashboard-stats"

const demoCourts = [
  { id: "c1", name: "Platz 1", price_per_hour: 28 },
  { id: "c2", name: "Platz 2", price_per_hour: 28 },
  { id: "c3", name: "Platz 3", price_per_hour: 32 },
]

const demoBookings = [
  {
    id: "b1",
    court_id: "c3",
    start_time: new Date(Date.now() - 3600000 * 2).toISOString(),
    guest_name: "Erna M.",
    status: "confirmed",
    payment_status: "paid_stripe",
    courts: { name: "Platz 3" },
  },
  {
    id: "b2",
    court_id: "c1",
    start_time: new Date(Date.now() + 3600000 * 4).toISOString(),
    guest_name: "Alex K.",
    status: "awaiting_payment",
    payment_status: "unpaid",
    courts: { name: "Platz 1" },
  },
  {
    id: "b3",
    court_id: "c2",
    start_time: new Date(Date.now() + 3600000 * 7).toISOString(),
    guest_name: "Maria S.",
    status: "confirmed",
    payment_status: "paid_cash",
    courts: { name: "Platz 2" },
  },
  {
    id: "b4",
    court_id: "c1",
    start_time: new Date(Date.now() - 3600000 * 26).toISOString(),
    guest_name: "Hans B.",
    status: "confirmed",
    payment_status: "paid_member",
    courts: { name: "Platz 1" },
  },
  {
    id: "b5",
    court_id: "c3",
    start_time: new Date(Date.now() - 3600000 * 50).toISOString(),
    guest_name: "Claudia M.",
    status: "confirmed",
    payment_status: "paid_stripe",
    courts: { name: "Platz 3" },
  },
]

export default function DemoOverviewPage() {
  const params = useParams()
  const lang = typeof params?.lang === "string" ? params.lang : "de"
  const basePath = `/${lang}/demo`

  return (
    <>
      <DashboardStats bookings={demoBookings} courts={demoCourts} />

      <div className="grid xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card className="rounded-3xl border border-slate-200/60 bg-white/80 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Letzte Aktivitäten</CardTitle>
              <span className="text-xs text-slate-500">{demoBookings.length} Einträge</span>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[620px] overflow-auto pr-2">
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
                        <div className="font-semibold text-slate-900">{booking.courts?.name}</div>
                        <div className="text-sm text-slate-500">
                          {format(new Date(booking.start_time), "HH:mm")} Uhr · {booking.guest_name}
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
                      <button className="rounded-full border border-slate-200/60 bg-white px-3 py-1 text-xs text-slate-600 hover:bg-slate-50">
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
          <Card className="rounded-3xl border border-slate-200/60 bg-white/80 shadow-sm">
            <CardHeader>
              <CardTitle>Schnellzugriff</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  ["settings", "Einstellungen"],
                  ["vouchers", "Gutscheine"],
                  ["courts", "Plätze"],
                  ["blocks", "Sperrzeiten"],
                  ["plans", "Abos"],
                  ["members", "Mitglieder"],
                  ["trainers", "Trainer"],
                  ["courses", "Kurse"],
                  ["finance", "Finanzen"],
                ].map(([href, label]) => (
                  <Link
                    key={href}
                    href={`${basePath}/${href}`}
                    className="rounded-xl border border-slate-200/60 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    {label}
                  </Link>
                ))}
                <Link
                  href={`${basePath}/export`}
                  className="rounded-xl border border-slate-200/60 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50 col-span-2 transition-colors"
                >
                  CSV Export
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
