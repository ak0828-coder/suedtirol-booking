import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { DeleteBookingButton } from "@/components/admin/delete-button"
import { DashboardStats } from "@/components/admin/dashboard-stats"
import { LogOut, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CourtManager } from "@/components/admin/court-manager"
import { BlockManager } from "@/components/admin/block-manager" 
import { PlanManager } from "@/components/admin/plan-manager" 
import { MemberManager } from "@/components/admin/member-manager" 
import { ClubSettings } from "@/components/admin/club-settings"
import { VoucherManager } from "@/components/admin/voucher-manager"
import { ExportManager } from "@/components/admin/export-manager"
// NEU: Import der Server Action
import { getClubVouchers } from "@/app/actions"

export const dynamic = 'force-dynamic'

export default async function AdminPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect("/login")

  // 2. Club laden
  const { data: club } = await supabase
    .from('clubs')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!club) return notFound()

  // 3. Security Check
  const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL?.toLowerCase()
  const isSuperAdmin = user.email?.toLowerCase() === SUPER_ADMIN_EMAIL
  
  if (club.owner_id !== user.id && !isSuperAdmin) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-red-100 max-w-md">
                <h1 className="text-2xl font-bold text-red-600 mb-2">Zugriff verweigert ⛔</h1>
                <Link href="/login"><Button variant="default">Zum Login</Button></Link>
            </div>
        </div>
    )
  }

  // 4. Daten laden
  const { data: courts } = await supabase.from('courts').select('*').eq('club_id', club.id).order('name')
  const { data: bookings } = await supabase.from('bookings').select(`*, courts (name)`).eq('club_id', club.id).order('start_time', { ascending: false })
  const { data: blockedPeriods } = await supabase.from('blocked_periods').select('*').eq('club_id', club.id).order('start_date', { ascending: true })
  const { data: plans } = await supabase.from('membership_plans').select('*').eq('club_id', club.id)
  const { data: members } = await supabase.from('club_members').select('*').eq('club_id', club.id)
  
  // NEU: Gutscheine über Server Action laden (nutzt Admin Client für RLS Bypass)
  const vouchers = await getClubVouchers(slug)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center text-white font-bold shadow-sm overflow-hidden border border-slate-200"
              style={{ backgroundColor: club.primary_color || '#0f172a' }}
            >
              {club.logo_url ? (
                <img src={club.logo_url} alt={club.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl">{club.name.substring(0, 2).toUpperCase()}</span>
              )}
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight">Dashboard</h1>
              <p className="text-slate-500">Verwaltung für {club.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href={`/club/${slug}`} target="_blank">
              <Button variant="outline" className="gap-2 rounded-full">
                <ExternalLink className="w-4 h-4" /> Vorschau
              </Button>
            </Link>

            <Link href="/login">
              <Button variant="ghost" size="icon" title="Abmelden" className="rounded-full">
                <LogOut className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* STATS */}
        {bookings && courts && (
          <DashboardStats bookings={bookings} courts={courts} />
        )}

        {/* HAUPT-BEREICH */}
        <div className="grid xl:grid-cols-3 gap-6">
          {/* SPALTE 1-2: BUCHUNGEN */}
          <div className="xl:col-span-2 space-y-6">
            <Card className="rounded-2xl border border-slate-200/60 bg-white/80 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Letzte Aktivitäten</CardTitle>
                <span className="text-xs text-slate-500">
                  {bookings?.length || 0} Einträge
                </span>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[620px] overflow-auto pr-2">
                  {bookings?.map((booking: any) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border border-slate-200/60 rounded-xl bg-white hover:shadow-sm transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs">
                          {format(new Date(booking.start_time), "dd.MM")}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">
                            {booking.courts?.name || "Unbekannter Platz"}
                          </div>
                          <div className="text-sm text-slate-500">
                            {format(new Date(booking.start_time), "HH:mm")} Uhr • {booking.guest_name}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                          <div className="font-medium text-slate-900">
                            {booking.payment_status === 'paid_cash' ? 'Vor Ort' : (booking.payment_status === 'paid_member' ? 'Abo' : 'Online')}
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

          {/* SPALTE 3: QUICK ACTIONS */}
          <div className="space-y-6 xl:sticky xl:top-6 h-fit">
            <Card className="rounded-2xl border border-slate-200/60 bg-white/80 shadow-sm">
              <CardHeader>
                <CardTitle>Schnellzugriff</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <a href="#club-settings" className="rounded-xl border border-slate-200/60 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50">Einstellungen</a>
                  <a href="#vouchers" className="rounded-xl border border-slate-200/60 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50">Gutscheine</a>
                  <a href="#courts" className="rounded-xl border border-slate-200/60 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50">Plätze</a>
                  <a href="#blocks" className="rounded-xl border border-slate-200/60 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50">Sperrzeiten</a>
                  <a href="#plans" className="rounded-xl border border-slate-200/60 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50">Abos</a>
                  <a href="#members" className="rounded-xl border border-slate-200/60 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50">Mitglieder</a>
                  <a href="#export" className="rounded-xl border border-slate-200/60 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50 col-span-2">CSV Export</a>
                </div>
              </CardContent>
            </Card>
            <ExportManager clubSlug={slug} />
          </div>
        </div>

        {/* MANAGEMENT GRID */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div id="club-settings"><ClubSettings club={club} /></div>
          <div id="vouchers"><VoucherManager vouchers={vouchers || []} clubSlug={slug} /></div>
          <div id="courts"><CourtManager initialCourts={courts || []} clubSlug={slug} /></div>
          <div id="blocks"><BlockManager clubSlug={slug} courts={courts || []} initialBlocks={blockedPeriods || []} /></div>
          <div id="plans"><PlanManager clubSlug={slug} plans={plans || []} /></div>
          <div id="members"><MemberManager members={members || []} /></div>
        </div>
      </div>
    </div>
  )
}
