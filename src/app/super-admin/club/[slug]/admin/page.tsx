import Link from "next/link"
import { format } from "date-fns"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardStats } from "@/components/admin/dashboard-stats"
import { DeleteBookingButton } from "@/components/admin/delete-button"
import { getAdminContext } from "@/app/club/[slug]/admin/_lib/get-admin-context"
import { FeatureGateToggle } from "@/components/admin/feature-gate-toggle"

export const dynamic = "force-dynamic"

export default async function SuperAdminClubOverviewPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { club, features, locks } = await getAdminContext(slug)
  const supabase = await createClient()

  const { data: courts } = await supabase
    .from("courts")
    .select("*")
    .eq("club_id", club.id)
    .order("name")

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, courts (name)")
    .eq("club_id", club.id)
    .order("start_time", { ascending: false })

  return (
    <>
      <div className="flex items-center justify-between rounded-2xl border border-slate-200/60 bg-white/80 px-6 py-4 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Ubersicht</h2>
          <p className="text-xs text-slate-500">Admin Startseite fur den Verein.</p>
        </div>
        <FeatureGateToggle
          clubId={club.id}
          slug={slug}
          path={["admin", "overview"]}
          lockPath={["locks", "admin", "overview"]}
          label="Tab aktiv"
          enabled={features.admin.overview}
          locked={locks.admin.overview}
        />
      </div>

      {bookings && courts && <DashboardStats bookings={bookings} courts={courts} />}

      <div className="grid xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card className="rounded-2xl border border-slate-200/60 bg-white/80 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Letzte Aktivitaten</CardTitle>
              <span className="text-xs text-slate-500">{bookings?.length || 0} Eintrage</span>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[620px] overflow-auto pr-2">
                {bookings?.map((booking: any) => (
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
                      <DeleteBookingButton id={booking.id} />
                    </div>
                  </div>
                ))}

                {bookings?.length === 0 && (
                  <div className="text-center text-slate-500 py-10">
                    Noch keine Buchungen vorhanden.
                  </div>
                )}
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
                <Link
                  href={`/super-admin/club/${slug}/admin/settings`}
                  className="rounded-xl border border-slate-200/60 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50"
                >
                  Einstellungen
                </Link>
                <Link
                  href={`/super-admin/club/${slug}/admin/vouchers`}
                  className="rounded-xl border border-slate-200/60 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50"
                >
                  Gutscheine
                </Link>
                <Link
                  href={`/super-admin/club/${slug}/admin/courts`}
                  className="rounded-xl border border-slate-200/60 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50"
                >
                  Platze
                </Link>
                <Link
                  href={`/super-admin/club/${slug}/admin/blocks`}
                  className="rounded-xl border border-slate-200/60 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50"
                >
                  Sperrzeiten
                </Link>
                <Link
                  href={`/super-admin/club/${slug}/admin/plans`}
                  className="rounded-xl border border-slate-200/60 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50"
                >
                  Abos
                </Link>
                <Link
                  href={`/super-admin/club/${slug}/admin/members`}
                  className="rounded-xl border border-slate-200/60 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50"
                >
                  Mitglieder
                </Link>
                <Link
                  href={`/super-admin/club/${slug}/admin/trainers`}
                  className="rounded-xl border border-slate-200/60 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50"
                >
                  Trainer
                </Link>
                <Link
                  href={`/super-admin/club/${slug}/admin/courses`}
                  className="rounded-xl border border-slate-200/60 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50"
                >
                  Kurse
                </Link>
                <Link
                  href={`/super-admin/club/${slug}/admin/finance`}
                  className="rounded-xl border border-slate-200/60 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50"
                >
                  Finanzen
                </Link>
                <Link
                  href={`/super-admin/club/${slug}/admin/export`}
                  className="rounded-xl border border-slate-200/60 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50 col-span-2"
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
