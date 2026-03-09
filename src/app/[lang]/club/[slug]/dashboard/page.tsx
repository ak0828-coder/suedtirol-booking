import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AlertTriangle, ArrowRight, CalendarCheck, CalendarX, ChevronRight, Clock, Dumbbell, Sparkles, Trophy } from "lucide-react"
import { format } from "date-fns"
import { getClubRanking, getMyBadges, getMyMemberStats, getProfile } from "@/app/actions"
import { CancelBookingButton } from "@/components/cancel-booking-button"
import Link from "next/link"
import { getReadableTextColor } from "@/lib/color"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { Suspense } from "react"
import { getDictionary } from "@/lib/dictionaries"
import { createTranslator } from "@/lib/translator"
import { getAdminClient } from "@/lib/supabase/admin"
import { BillingPortalButton, CancelMembershipButton } from "@/components/dashboard/subscription-actions"

export default async function MemberDashboard({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}) {
  const { slug, lang } = await params
  const dict = await getDictionary(lang as any)
  const t = createTranslator(dict)
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/${lang}/club/${slug}/login?next=/${lang}/club/${slug}/dashboard`)
  }

  const { data: club } = await supabase
    .from("clubs")
    .select("id, name, primary_color")
    .eq("slug", slug)
    .single()

  if (!club) redirect(`/${lang}`)

  const supabaseAdmin = getAdminClient()
  const { data: member } = await supabaseAdmin
    .from("club_members")
    .select("*, membership_plans(name), contract_signed_at, medical_certificate_valid_until")
    .eq("user_id", user.id)
    .eq("club_id", club.id)
    .single()

  if (!member) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
            <CalendarX className="w-7 h-7 text-slate-400" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900">Kein Mitgliedskonto</h1>
          <p className="text-sm text-slate-500">Für {user.email} existiert keine Mitgliedschaft in diesem Verein.</p>
          <div className="flex flex-col gap-2 pt-2">
            <Link href={`/${lang}/club/${slug}`} className="w-full h-11 rounded-full bg-slate-900 text-white text-sm font-medium flex items-center justify-center">Zurück zum Club</Link>
            <Link href={`/${lang}/login`} className="w-full h-11 rounded-full border border-slate-200 text-slate-700 text-sm font-medium flex items-center justify-center">Account wechseln</Link>
          </div>
        </div>
      </div>
    )
  }

  const certValidUntil = member?.medical_certificate_valid_until ? new Date(member.medical_certificate_valid_until) : null
  const certExpiringSoon = certValidUntil ? (certValidUntil.getTime() - Date.now()) / (1000 * 60 * 60 * 24) < 30 : false
  const certExpired = certValidUntil ? certValidUntil < new Date() : false

  const { data: contractDocs } = await supabase
    .from("member_documents")
    .select("id")
    .eq("club_id", club.id)
    .eq("user_id", user.id)
    .in("doc_type", ["membership_contract", "contract"])
    .limit(1)

  const hasContract = !!member.contract_signed_at || (contractDocs?.length || 0) > 0

  const { data: upcomingBookings } = await supabase
    .from("bookings")
    .select("*, courts(name)")
    .eq("club_id", club.id)
    .eq("user_id", user.id)
    .gte("start_time", new Date().toISOString())
    .order("start_time", { ascending: true })

  const pastStart = new Date()
  pastStart.setDate(pastStart.getDate() - 7)
  const { data: pastBookings } = await supabase
    .from("bookings")
    .select("*, courts(name)")
    .eq("club_id", club.id)
    .eq("user_id", user.id)
    .gte("start_time", pastStart.toISOString())
    .lt("start_time", new Date().toISOString())
    .order("start_time", { ascending: false })
    .limit(5)

  const bookingIds = [...(upcomingBookings || []), ...(pastBookings || [])].map((b: any) => b.id)
  const { data: recaps } = bookingIds.length
    ? await supabase.from("match_recaps").select("booking_id, token, completed_at").in("booking_id", bookingIds)
    : { data: [] }
  const recapMap = new Map((recaps || []).map((r: any) => [r.booking_id, r]))

  const { data: profileData } = await supabase.from("profiles").select("stripe_customer_id").eq("id", user.id).single()
  const hasStripeCustomer = !!profileData?.stripe_customer_id

  const profile = await getProfile()
  const stats = await getMyMemberStats(club.id)

  const nextBooking = upcomingBookings?.[0] ?? null
  const primary = club.primary_color || "#1F3D2B"
  const primaryFg = getReadableTextColor(primary)

  return (
    <div
      className="min-h-screen bg-[#f5f5f7] pb-28"
      style={{ ["--club-primary" as any]: primary, ["--club-primary-foreground" as any]: primaryFg }}
    >
      {/* Hero header */}
      <div className="relative overflow-hidden px-5 pt-12 pb-10" style={{ backgroundColor: primary }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, white 0%, transparent 60%)" }} />
        <div className="relative max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/90 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {t("dashboard.badge.active", "Mitglied aktiv")} · {member.membership_plans?.name || "Mitgliedschaft"}
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {t("dashboard.greeting", "Hallo")}, {profile?.first_name || user.email?.split("@")[0]}!
          </h1>
          <p className="text-white/60 mt-1 text-sm">{club.name}</p>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 -mt-5 space-y-4">

        {/* Alerts */}
        {!hasContract && (
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-900">Vertrag ausstehend</p>
              <p className="text-xs text-amber-700 mt-0.5">Bitte unterzeichne deinen Mitgliedsvertrag.</p>
            </div>
            <Link href={`/${lang}/club/${slug}/onboarding?post_payment=1`} className="shrink-0 text-xs font-medium text-amber-900 underline underline-offset-2">Jetzt</Link>
          </div>
        )}

        {certValidUntil && (certExpired || certExpiringSoon) && (
          <div className={`rounded-2xl border p-4 flex items-start gap-3 ${certExpired ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"}`}>
            <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${certExpired ? "text-red-600" : "text-amber-600"}`} />
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${certExpired ? "text-red-900" : "text-amber-900"}`}>
                {certExpired ? "Ärztl. Zeugnis abgelaufen" : "Ärztl. Zeugnis läuft ab"}
              </p>
              <p className={`text-xs mt-0.5 ${certExpired ? "text-red-700" : "text-amber-700"}`}>
                {certExpired ? "Bitte lade ein neues Zeugnis hoch." : `Läuft ab am ${certValidUntil.toLocaleDateString("de-DE")}.`}
              </p>
            </div>
            <Link href={`/${lang}/club/${slug}/dashboard/documents`} className={`shrink-0 text-xs font-medium underline underline-offset-2 ${certExpired ? "text-red-900" : "text-amber-900"}`}>Hochladen</Link>
          </div>
        )}

        {/* Primary CTA */}
        <Link
          href={`/${lang}/club/${slug}/dashboard/book`}
          className="flex items-center justify-between w-full rounded-2xl p-5 text-left shadow-sm active:scale-[0.98] transition-transform"
          style={{ backgroundColor: primary, color: primaryFg }}
        >
          <div>
            <p className="text-xs font-medium opacity-70">Bereit zu spielen?</p>
            <p className="text-xl font-bold mt-0.5">Platz buchen</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
            <ArrowRight className="w-6 h-6" />
          </div>
        </Link>

        {/* Next booking */}
        {nextBooking ? (
          <div className="rounded-2xl bg-white border border-slate-200/60 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Nächste Buchung</p>
              <CalendarCheck className="w-4 h-4 text-slate-300" />
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-900">{format(new Date(nextBooking.start_time), "dd. MMM")}</p>
                <div className="flex items-center gap-2 mt-1.5 text-sm text-slate-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{format(new Date(nextBooking.start_time), "HH:mm")} Uhr</span>
                  <span>·</span>
                  <span>{(nextBooking as any).courts?.name}</span>
                </div>
              </div>
              <CancelBookingButton bookingId={nextBooking.id} />
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-white border border-slate-200/60 shadow-sm p-5 text-center">
            <p className="text-sm text-slate-400">Keine anstehenden Buchungen</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: t("dashboard.stats.wins", "Siege"), value: stats?.wins ?? 0 },
            { label: t("dashboard.stats.losses", "Niederlagen"), value: stats?.losses ?? 0 },
            { label: t("dashboard.stats.streak", "Streak"), value: stats?.win_streak ?? 0 },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl bg-white border border-slate-200/60 shadow-sm p-4 text-center">
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-3">
          <Link href={`/${lang}/club/${slug}/dashboard/training`} className="rounded-2xl bg-white border border-slate-200/60 shadow-sm p-4 flex items-center gap-3 active:scale-[0.98] transition-transform">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: primary + "20" }}>
              <Dumbbell className="w-4 h-4" style={{ color: primary }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Training</p>
              <p className="text-xs text-slate-400">& Kurse</p>
            </div>
          </Link>
          <Link href={`/${lang}/club/${slug}/dashboard/leaderboard`} className="rounded-2xl bg-white border border-slate-200/60 shadow-sm p-4 flex items-center gap-3 active:scale-[0.98] transition-transform">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: primary + "20" }}>
              <Trophy className="w-4 h-4" style={{ color: primary }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Rangliste</p>
              <p className="text-xs text-slate-400">Top 50</p>
            </div>
          </Link>
        </div>

        {/* Membership card */}
        <div className="rounded-2xl bg-white border border-slate-200/60 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Meine Mitgliedschaft</p>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
              member.payment_status === "paid" || member.payment_status === "paid_stripe" || member.payment_status === "paid_cash"
                ? "bg-green-100 text-green-700"
                : member.payment_status === "overdue" ? "bg-red-100 text-red-700"
                : "bg-slate-100 text-slate-600"
            }`}>
              {member.payment_status === "paid" || member.payment_status === "paid_stripe" || member.payment_status === "paid_cash" ? "Bezahlt"
                : member.payment_status === "overdue" ? "Überfällig"
                : member.payment_status === "cancelled" ? "Gekündigt" : "Aktiv"}
            </span>
          </div>
          <p className="text-lg font-semibold text-slate-900">{member.membership_plans?.name || "Mitgliedschaft"}</p>
          {member.valid_until && (
            <p className="text-sm text-slate-500 mt-1">
              Gültig bis {new Date(member.valid_until).toLocaleDateString("de-DE")}
            </p>
          )}
          <div className="flex gap-2 mt-4 flex-wrap">
            <BillingPortalButton clubSlug={slug} returnPath={`/${lang}/club/${slug}/dashboard`} hasStripeCustomer={hasStripeCustomer} />
            {member.stripe_subscription_id && member.payment_status !== "cancelled" && (
              <CancelMembershipButton clubSlug={slug} />
            )}
          </div>
        </div>

        {/* Upcoming bookings list */}
        {(upcomingBookings?.length ?? 0) > 1 && (
          <div className="rounded-2xl bg-white border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">Anstehende Buchungen</p>
              <span className="text-xs text-slate-400">{upcomingBookings!.length}</span>
            </div>
            <div className="divide-y divide-slate-100">
              {upcomingBookings!.slice(1).map((b: any) => (
                <div key={b.id} className="flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{format(new Date(b.start_time), "dd. MMM · HH:mm")} Uhr</p>
                    <p className="text-xs text-slate-400 mt-0.5">{b.courts?.name}</p>
                  </div>
                  <CancelBookingButton bookingId={b.id} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Past bookings */}
        {(pastBookings?.length ?? 0) > 0 && (
          <div className="rounded-2xl bg-white border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <p className="text-sm font-semibold text-slate-900">Letzte Spiele</p>
            </div>
            <div className="divide-y divide-slate-100">
              {pastBookings!.map((b: any) => (
                <div key={b.id} className="flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{format(new Date(b.start_time), "dd. MMM · HH:mm")} Uhr</p>
                    <p className="text-xs text-slate-400 mt-0.5">{(b as any).courts?.name}</p>
                  </div>
                  {recapMap.get(b.id)?.token ? (
                    <Link href={`/${lang}/match/recap/${recapMap.get(b.id).token}`} className="text-xs font-medium underline underline-offset-2" style={{ color: primary }}>Ergebnis</Link>
                  ) : (
                    <span className="text-xs text-slate-300">—</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      <MobileBottomNav slug={slug} active="dashboard" />
    </div>
  )
}
