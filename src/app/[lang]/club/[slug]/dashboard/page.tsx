import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Calendar, Clock, User, Sparkles, ArrowRight } from "lucide-react"
import { format } from "date-fns"
import { getClubRanking, getMyBadges, getMyMemberStats, getProfile } from "@/app/actions"
import { ProfileForm } from "@/components/profile-form"
import { CancelBookingButton } from "@/components/cancel-booking-button"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getReadableTextColor } from "@/lib/color"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { TourLauncher } from "@/components/tours/tour-launcher"
import { Suspense } from "react"
import { getDictionary } from "@/lib/dictionaries"
import { createTranslator } from "@/lib/translator"

export default async function MemberDashboard({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}) {
  const { slug, lang } = await params
  const dict = await getDictionary(lang as any)
  const t = createTranslator(dict)
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return redirect(`/${lang}/login`)

  const { data: member } = await supabase
    .from("club_members")
    .select("*, clubs!inner(slug, name, id, primary_color), membership_plans(name), contract_signed_at")
    .eq("user_id", user.id)
    .eq("clubs.slug", slug)
    .single()

  if (!member) {
    return redirect(`/${lang}/club/${slug}`)
  }

  const { data: medicalDocs } = await supabase
    .from("member_documents")
    .select("id")
    .eq("club_id", member.clubs.id)
    .eq("user_id", user.id)
    .eq("doc_type", "medical_certificate")
    .limit(1)

  const hasContract = !!member.contract_signed_at
  const hasMedical = (medicalDocs?.length || 0) > 0
  if (!hasContract || !hasMedical) {
    return redirect(`/${lang}/club/${slug}/onboarding?post_payment=1`)
  }

  const { data: upcomingBookings } = await supabase
    .from("bookings")
    .select("*, courts(name)")
    .eq("club_id", member.clubs.id)
    .eq("user_id", user.id)
    .gte("start_time", new Date().toISOString())
    .order("start_time", { ascending: true })

  const pastStart = new Date()
  pastStart.setDate(pastStart.getDate() - 7)

  const { data: pastBookings } = await supabase
    .from("bookings")
    .select("*, courts(name)")
    .eq("club_id", member.clubs.id)
    .eq("user_id", user.id)
    .gte("start_time", pastStart.toISOString())
    .lt("start_time", new Date().toISOString())
    .order("start_time", { ascending: false })

  const bookingIds = [...(upcomingBookings || []), ...(pastBookings || [])].map((b: any) => b.id)
  const { data: recaps } = bookingIds.length
    ? await supabase
        .from("match_recaps")
        .select("booking_id, token, completed_at")
        .in("booking_id", bookingIds)
    : { data: [] }

  const recapMap = new Map((recaps || []).map((r: any) => [r.booking_id, r]))

  const profile = await getProfile()
  const ranking = await getClubRanking(member.clubs.id)
  const stats = await getMyMemberStats(member.clubs.id)
  const badges = await getMyBadges(member.clubs.id)

  const nextBooking = upcomingBookings && upcomingBookings.length > 0 ? upcomingBookings[0] : null

  const primary = member.clubs.primary_color || "#0f172a"
  const primaryFg = getReadableTextColor(primary)

  return (
    <div
      className="min-h-screen bg-[#f5f5f7] pb-24 safe-bottom page-enter"
      style={{ ["--club-primary" as any]: primary, ["--club-primary-foreground" as any]: primaryFg }}
    >
      <div className="max-w-4xl mx-auto space-y-6 app-pad pt-4 sm:pt-6">
        <header id="tour-member-header" className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white/80 p-5 sm:p-6 shadow-sm">
          <div
            className="absolute -top-10 -right-10 h-40 w-40 rounded-full blur-2xl"
            style={{ backgroundColor: "var(--club-primary)", opacity: 0.12 }}
          />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border club-primary-border bg-white/90 px-3 py-1 text-xs club-primary-text">
                <Sparkles className="w-3.5 h-3.5" />
                {t("dashboard.badge.active", "Mitglied aktiv")}
              </div>
              <h1 className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight">
                {t("dashboard.greeting", "Hallo")} {profile?.first_name || t("dashboard.guest", "Mitglied")}!
              </h1>
              <p className="text-slate-500">{t("dashboard.welcome", "Willkommen bei")} {member.clubs.name}!</p>
            </div>
            <div className="flex flex-col items-start md:items-end gap-3 w-full md:w-auto">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/90 text-slate-900 px-4 py-2 text-sm font-semibold border border-slate-200/60">
                {member.membership_plans?.name || t("dashboard.status.active", "Aktiv")}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Suspense fallback={null}>
                  <TourLauncher tour="member-dashboard" storageKey="tour_member_dashboard_seen" label={t("dashboard.guide", "Guide")} autoStart />
                </Suspense>
                <Link href={`/${lang}/club/${slug}/dashboard/settings`}>
                  <Button variant="outline" className="gap-2 rounded-full btn-press w-full sm:w-auto">
                    {t("dashboard.actions.settings", "Einstellungen")}
                  </Button>
                </Link>
                <Link href={`/${lang}/club/${slug}/dashboard/documents`}>
                  <Button variant="outline" className="gap-2 rounded-full btn-press w-full sm:w-auto">
                    {t("dashboard.actions.documents", "Dokumente")}
                  </Button>
                </Link>
                <Link href={`/${lang}/club/${slug}`}>
                  <Button id="tour-member-book" variant="outline" className="gap-2 rounded-full btn-press w-full sm:w-auto">
                    {t("dashboard.actions.booking", "Zur Buchung")} <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
          <Card id="tour-member-next" className="rounded-2xl border border-slate-200/60 bg-white/80 shadow-sm">
            <CardHeader>
              <CardTitle className="flex gap-2 items-center">
                <Trophy className="club-primary-text" /> {t("dashboard.cards.status", "Dein Status")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{t("dashboard.status.active", "Aktiv")}</div>
              <p className="text-sm text-slate-500 mt-2">
                {t("dashboard.valid_until", "Gültig bis:")}{" "}
                {member.valid_until
                  ? new Date(member.valid_until).toLocaleDateString(lang === "it" ? "it-IT" : lang === "en" ? "en-US" : "de-DE")
                  : t("dashboard.unlimited", "Unbegrenzt")}
              </p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl border border-slate-200/60 bg-white/90 px-2 py-2">
                  <div className="text-lg font-semibold">{stats?.wins ?? 0}</div>
                  <div className="text-xs text-slate-500">{t("dashboard.stats.wins", "Siege")}</div>
                </div>
                <div className="rounded-xl border border-slate-200/60 bg-white/90 px-2 py-2">
                  <div className="text-lg font-semibold">{stats?.losses ?? 0}</div>
                  <div className="text-xs text-slate-500">{t("dashboard.stats.losses", "Niederl.")}</div>
                </div>
                <div className="rounded-xl border border-slate-200/60 bg-white/90 px-2 py-2">
                  <div className="text-lg font-semibold">{stats?.win_streak ?? 0}</div>
                  <div className="text-xs text-slate-500">{t("dashboard.stats.streak", "Streak")}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card id="tour-member-profile" className="rounded-2xl border border-slate-200/60 bg-white/80 shadow-sm">
            <CardHeader>
              <CardTitle className="flex gap-2 items-center">
                <Calendar className="club-primary-text" /> {t("dashboard.cards.next", "Nächster Termin")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {nextBooking ? (
                <div className="space-y-2">
                  <div className="text-2xl font-semibold">
                    {format(new Date(nextBooking.start_time), "dd.MM.yyyy")}
                  </div>
                  <div className="text-sm text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(new Date(nextBooking.start_time), "HH:mm")} {t("dashboard.clock", "Uhr")}
                  </div>
                  <div className="text-sm text-slate-600">{nextBooking.courts?.name}</div>
                </div>
              ) : (
                <div className="text-sm text-slate-500">{t("dashboard.no_upcoming", "Keine anstehenden Termine.")}</div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-slate-200/60 bg-white/80 shadow-sm">
            <CardHeader>
              <CardTitle className="flex gap-2 items-center">
                <User className="text-slate-600" /> {t("dashboard.cards.profile", "Profil")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-slate-500">
                {t("dashboard.profile_desc", "Pflege deine Kontaktdaten und Angaben.")}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-slate-200/60 bg-white/80 shadow-sm md:col-span-2">
            <CardHeader>
              <CardTitle className="flex gap-2 items-center">
                <Sparkles className="club-primary-text" /> {t("dashboard.cards.leaderboard", "Club Rangliste")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ranking.length === 0 ? (
                <p className="text-sm text-slate-500">{t("dashboard.leaderboard_empty", "Noch keine Ranglistenpunkte vorhanden.")}</p>
              ) : (
                <div className="space-y-2">
                  {ranking.map((row) => (
                    <div
                      key={row.userId}
                      className="flex items-center justify-between rounded-xl border border-slate-200/60 bg-white/90 px-3 py-2 text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 text-center font-semibold text-slate-500">
                          {row.rank}
                        </span>
                        <span className="font-medium text-slate-800">{row.name}</span>
                      </div>
                      <span className="rounded-full border club-primary-border px-3 py-1 text-xs font-semibold club-primary-text">
                        {row.points} {t("dashboard.points", "Punkte")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4">
                <Link href={`/${lang}/club/${slug}/dashboard/leaderboard`}>
                  <Button variant="outline" className="rounded-full btn-press w-full sm:w-auto">
                    {t("dashboard.leaderboard_cta", "Top 50 ansehen")}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card id="tour-member-upcoming" className="rounded-2xl border border-slate-200/60 bg-white/80 shadow-sm md:col-span-3">
            <CardHeader>
              <CardTitle className="flex gap-2 items-center">
                <Sparkles className="club-primary-text" /> {t("dashboard.cards.badges", "Badges & Erfolge")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {badges.length === 0 ? (
                <p className="text-sm text-slate-500">{t("dashboard.badges_empty", "Spiele dein erstes Match, um Badges zu sammeln.")}</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {badges.map((b) => (
                    <div
                      key={b.id}
                      className="rounded-full border border-slate-200/60 bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 anim-pop"
                      title={b.desc}
                    >
                      {b.label}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-2xl border border-slate-200/60 bg-white/80 shadow-sm">
          <CardHeader>
            <CardTitle className="flex gap-2 items-center">
              <Calendar className="club-primary-text" /> {t("dashboard.cards.upcoming", "Deine nächsten Spiele")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingBookings && upcomingBookings.length > 0 ? (
              <div className="space-y-4">
                {upcomingBookings.map((b: any) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between p-3 border border-slate-200/60 rounded-xl bg-white hover:shadow-sm transition-shadow"
                  >
                    <div>
                      <div className="font-semibold text-base">
                        {format(new Date(b.start_time), "dd.MM.yyyy")}
                      </div>
                      <div className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(b.start_time), "HH:mm")} {t("dashboard.clock", "Uhr")}
                        <span className="mx-1">•</span>
                        {b.courts?.name}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CancelBookingButton bookingId={b.id} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-slate-500 italic mb-2">{t("dashboard.no_open", "Keine offenen Buchungen.")}</p>
                <Link href={`/${lang}/club/${slug}`}>
                  <Button variant="outline" className="rounded-full">
                    {t("dashboard.book_now", "Jetzt buchen")}
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-200/60 bg-white/80 shadow-sm">
          <CardHeader>
            <CardTitle className="flex gap-2 items-center">
              <Calendar className="club-primary-text" /> {t("dashboard.cards.past", "Letzte Spiele")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pastBookings && pastBookings.length > 0 ? (
              <div className="space-y-4">
                {pastBookings.map((b: any) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between p-3 border border-slate-200/60 rounded-xl bg-white hover:shadow-sm transition-shadow"
                  >
                    <div>
                      <div className="font-semibold text-base">
                        {format(new Date(b.start_time), "dd.MM.yyyy")}
                      </div>
                      <div className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(b.start_time), "HH:mm")} {t("dashboard.clock", "Uhr")}
                        <span className="mx-1">•</span>
                        {b.courts?.name}
                      </div>
                    </div>
                    {recapMap.get(b.id)?.token ? (
                      <Link href={`/${lang}/match/recap/${recapMap.get(b.id).token}`}>
                        <Button variant="outline" size="sm" className="rounded-full">
                          {t("dashboard.recap", "Ergebnis eintragen")}
                        </Button>
                      </Link>
                    ) : (
                      <span className="text-xs text-slate-500">{t("dashboard.recap_pending", "Wird vorbereitet...")}</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-slate-500 italic mb-2">{t("dashboard.no_past", "Noch keine Spiele in den letzten 7 Tagen.")}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-200/60 bg-white/80 shadow-sm">
          <CardHeader>
            <CardTitle className="flex gap-2 items-center">
              <User className="text-slate-600" /> {t("dashboard.cards.profile_data", "Meine Daten")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileForm profile={profile} />
          </CardContent>
        </Card>
      </div>
      <MobileBottomNav slug={slug} active="dashboard" />
    </div>
  )
}
