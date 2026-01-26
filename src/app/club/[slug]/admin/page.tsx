import { supabase } from "@/lib/supabase"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { DeleteBookingButton } from "@/components/admin/delete-button"
import { DashboardStats } from "@/components/admin/dashboard-stats" // NEU!

// Kein Cache, immer live Daten
export const dynamic = 'force-dynamic'

export default async function AdminPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  // 1. Club laden
  const { data: club } = await supabase
    .from('clubs')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!club) return notFound()

  // 2. Plätze laden (brauchen wir für die Preise im Dashboard)
  const { data: courts } = await supabase
    .from('courts')
    .select('*')
    .eq('club_id', club.id)

  // 3. Alle Buchungen laden (neueste zuerst)
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      *,
      courts (name)
    `)
    .eq('club_id', club.id)
    .order('start_time', { ascending: false })

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
            <p className="text-slate-500">Übersicht für {club.name}</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-full text-sm font-medium shadow-sm border text-slate-600">
            {format(new Date(), "dd. MMMM yyyy")}
          </div>
        </div>

        {/* DAS NEUE ANALYTICS COCKPIT */}
        {bookings && courts && (
          <DashboardStats bookings={bookings} courts={courts} />
        )}

        {/* DIE LISTE DER LETZTEN BUCHUNGEN */}
        <Card>
          <CardHeader>
            <CardTitle>Letzte Aktivitäten</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bookings?.map((booking: any) => (
                <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg bg-white hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs">
                       {format(new Date(booking.start_time), "dd.MM")}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">
                        {booking.courts.name}
                      </div>
                      <div className="text-sm text-slate-500">
                         {format(new Date(booking.start_time), "HH:mm")} Uhr • {booking.guest_name}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <div className="font-medium text-slate-900">
                        {booking.payment_status === 'paid_cash' ? 'Vor Ort' : 'Online'}
                      </div>
                      <div className="text-xs text-slate-500">Status: {booking.status}</div>
                    </div>
                    {/* Der Löschen Button */}
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
    </div>
  )
}