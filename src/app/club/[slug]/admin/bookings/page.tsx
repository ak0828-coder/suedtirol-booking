import { format } from "date-fns"
import { createClient } from "@/lib/supabase/server"
import { useAdminContext } from "@/components/admin/admin-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DeleteBookingButton } from "@/components/admin/delete-button"

export const dynamic = "force-dynamic"

export default async function AdminBookingsPage() {
  const { club } = useAdminContext()
  const supabase = await createClient()

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, courts (name)")
    .eq("club_id", club.id)
    .order("start_time", { ascending: false })

  return (
    <>
      <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm">
        <h2 className="text-2xl md:text-3xl font-semibold">Buchungen</h2>
        <p className="text-slate-500 text-sm">Alle Buchungen an einem Ort.</p>
      </div>

      <Card className="rounded-2xl border border-slate-200/60 bg-white/80 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Aktivitat</CardTitle>
          <span className="text-xs text-slate-500">{bookings?.length || 0} Eintrage</span>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
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
                      {booking.payment_status === "paid_cash"
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
    </>
  )
}
