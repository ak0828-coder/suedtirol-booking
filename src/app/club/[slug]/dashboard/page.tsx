import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Calendar, Clock, User } from "lucide-react"
import { format } from "date-fns"
import { getProfile } from "@/app/actions"
import { ProfileForm } from "@/components/profile-form"
// NEU: Import für den Button
import { CancelBookingButton } from "@/components/cancel-booking-button"

export default async function MemberDashboard({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect("/login")

  // 2. Member Status Check
  const { data: member } = await supabase
    .from('club_members')
    .select('*, clubs!inner(slug, name, id), membership_plans(name)')
    .eq('user_id', user.id)
    .eq('clubs.slug', slug)
    .single()

  if (!member) {
      return redirect(`/club/${slug}`)
  }

  // 3. Echte Buchungen laden!
  const { data: myBookings } = await supabase
    .from('bookings')
    .select('*, courts(name)')
    .eq('club_id', member.clubs.id)
    .eq('user_id', user.id)
    .gte('start_time', new Date().toISOString()) // Nur zukünftige
    .order('start_time', { ascending: true })

  // 4. Profil laden
  const profile = await getProfile()

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm">
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-emerald-100 blur-2xl" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                Hallo {profile?.first_name || 'Mitglied'}!
              </h1>
              <p className="text-slate-500">Willkommen bei {member.clubs.name}</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-700 px-4 py-2 text-sm font-semibold border border-emerald-100">
              {member.membership_plans?.name || 'Aktiv'}
            </div>
          </div>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Status Karte */}
          <Card className="rounded-2xl border border-slate-200/60 bg-white/80 shadow-sm">
            <CardHeader>
              <CardTitle className="flex gap-2 items-center">
                <Trophy className="text-amber-500" /> Dein Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">Aktiv</div>
              <p className="text-sm text-slate-500 mt-2">
                Gültig bis: {member.valid_until ? new Date(member.valid_until).toLocaleDateString('de-DE') : 'Unbegrenzt'}
              </p>
            </CardContent>
          </Card>

          {/* Buchungs Karte */}
          <Card className="rounded-2xl border border-slate-200/60 bg-white/80 shadow-sm">
            <CardHeader>
              <CardTitle className="flex gap-2 items-center">
                <Calendar className="text-blue-500" /> Deine nächsten Spiele
              </CardTitle>
            </CardHeader>
            <CardContent>
              {myBookings && myBookings.length > 0 ? (
                <div className="space-y-4">
                  {myBookings.map((b: any) => (
                    <div key={b.id} className="flex items-center justify-between p-3 border border-slate-200/60 rounded-xl bg-white hover:shadow-sm transition-shadow">
                      <div>
                        <div className="font-semibold text-base">
                          {format(new Date(b.start_time), 'dd.MM.yyyy')}
                        </div>
                        <div className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(b.start_time), 'HH:mm')} Uhr
                          <span className="mx-1">•</span>
                          {b.courts?.name}
                        </div>
                      </div>
                      <CancelBookingButton bookingId={b.id} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-slate-500 italic mb-2">Keine offenen Buchungen.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Profil Section */}
        <Card className="rounded-2xl border border-slate-200/60 bg-white/80 shadow-sm">
          <CardHeader>
            <CardTitle className="flex gap-2 items-center">
              <User className="text-slate-600" /> Meine Daten
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileForm initialData={profile} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
