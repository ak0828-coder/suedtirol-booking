import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AlertTriangle, ArrowRight, CalendarCheck, CalendarX, Clock, Dumbbell, Trophy } from "lucide-react"
import { format } from "date-fns"
import { getMyMemberStats, getProfile } from "@/app/actions"
import { CancelBookingButton } from "@/components/cancel-booking-button"
import Link from "next/link"
import { getReadableTextColor } from "@/lib/color"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { getDictionary } from "@/lib/dictionaries"
import { createTranslator } from "@/lib/translator"
import { getAdminClient } from "@/lib/supabase/admin"
import { BillingPortalButton, CancelMembershipButton } from "@/components/dashboard/subscription-actions"

export default async function MemberDashboard({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; slug: string }>
  searchParams: Promise<{ booking?: string }>
}) {
  const { slug, lang } = await params
  const { booking } = await searchParams
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
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#09090b" }}>
        <div className="w-full max-w-sm text-center space-y-5">
          <div
            className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)" }}
          >
            <CalendarX className="w-7 h-7 text-white/40" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Kein Mitgliedskonto</h1>
            <p className="text-sm text-white/40 mt-1">Für {user.email} existiert keine Mitgliedschaft.</p>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <Link href={`/${lang}/club/${slug}`} className="w-full h-12 rounded-full bg-white text-slate-900 text-sm font-semibold flex items-center justify-center">Zurück zum Club</Link>
            <Link href={`/${lang}/login`} className="w-full h-12 rounded-full text-white/60 text-sm font-medium flex items-center justify-center" style={{ border: "1px solid rgba(255,255,255,0.10)" }}>Account wechseln</Link>
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

  const paymentPaid = ["paid", "paid_stripe", "paid_cash", "paid_member"].includes(member.payment_status)

  return (
    <div
      className="min-h-screen pb-36"
      style={{
        background: "#09090b",
        ["--club-primary" as any]: primary,
        ["--club-primary-foreground" as any]: primaryFg,
      }}
    >
      {/* Grain */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          opacity: 0.025,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "160px",
          zIndex: 9998,
        }}
      />

      {/* ── HERO HEADER ── */}
      <div
        className="relative overflow-hidden px-5 pt-14 pb-14"
        style={{
          background: `linear-gradient(160deg, color-mix(in srgb, ${primary} 85%, #000) 0%, color-mix(in srgb, ${primary} 45%, #000) 100%)`,
        }}
      >
        {/* Decorative circles */}
        <div
          className="absolute -top-20 -right-16 w-72 h-72 rounded-full opacity-15"
          style={{ background: "white" }}
        />
        <div
          className="absolute -bottom-24 -left-12 w-56 h-56 rounded-full opacity-10"
          style={{ background: "white" }}
        />

        <div className="relative max-w-xl mx-auto">
          <div
            className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium text-white/90 mb-5"
            style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.20)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {t("dashboard.badge.active", "Mitglied aktiv")}
            <span className="text-white/40">·</span>
            {member.membership_plans?.name || "Mitgliedschaft"}
          </div>

          <h1 className="text-4xl font-extrabold text-white tracking-[-0.03em] leading-none anim-fade-up">
            {t("dashboard.greeting", "Hallo")},<br />
            {profile?.first_name || user.email?.split("@")[0]}
          </h1>
          <p className="label-caps text-white/50 mt-3">{club.name}</p>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="relative z-10 max-w-xl mx-auto px-4 -mt-5 space-y-4">

        {/* Booking success */}
        {booking === "success" && (
          <div
            className="rounded-2xl p-4 flex items-start gap-3 anim-slide-up"
            style={{
              background: "rgba(52,211,153,0.10)",
              border: "1px solid rgba(52,211,153,0.22)",
              borderLeft: "3px solid rgb(52,211,153)",
            }}
          >
            <CalendarCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-white">Buchung bestätigt!</p>
              <p className="text-xs text-white/45 mt-0.5">Zahlung eingegangen · Bestätigung wurde per E-Mail geschickt.</p>
            </div>
          </div>
        )}

        {/* Contract alert */}
        {!hasContract && (
          <div
            className="rounded-2xl p-4 flex items-start gap-3"
            style={{
              background: "rgba(245,158,11,0.09)",
              border: "1px solid rgba(245,158,11,0.20)",
            }}
          >
            <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">Vertrag ausstehend</p>
              <p className="text-xs text-white/45 mt-0.5">Bitte unterzeichne deinen Mitgliedsvertrag.</p>
            </div>
            <Link
              href={`/${lang}/club/${slug}/onboarding?post_payment=1`}
              className="shrink-0 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
            >
              Jetzt
            </Link>
          </div>
        )}

        {/* Cert alert */}
        {certValidUntil && (certExpired || certExpiringSoon) && (
          <div
            className="rounded-2xl p-4 flex items-start gap-3"
            style={{
              background: certExpired ? "rgba(239,68,68,0.09)" : "rgba(245,158,11,0.09)",
              border: `1px solid ${certExpired ? "rgba(239,68,68,0.20)" : "rgba(245,158,11,0.20)"}`,
            }}
          >
            <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${certExpired ? "text-red-400" : "text-amber-400"}`} />
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold text-white`}>
                {certExpired ? "Ärztl. Zeugnis abgelaufen" : "Ärztl. Zeugnis läuft ab"}
              </p>
              <p className="text-xs text-white/45 mt-0.5">
                {certExpired ? "Bitte lade ein neues Zeugnis hoch." : `Läuft ab am ${certValidUntil.toLocaleDateString("de-DE")}.`}
              </p>
            </div>
            <Link
              href={`/${lang}/club/${slug}/dashboard/documents`}
              className={`shrink-0 text-xs font-semibold ${certExpired ? "text-red-400 hover:text-red-300" : "text-amber-400 hover:text-amber-300"} transition-colors`}
            >
              Hochladen
            </Link>
          </div>
        )}

        {/* ── PRIMARY CTA ── */}
        <Link
          href={`/${lang}/club/${slug}/dashboard/book`}
          className="flex items-center justify-between w-full rounded-3xl p-6 btn-press anim-fade-up"
          style={{
            background: `linear-gradient(135deg, ${primary}, color-mix(in srgb, ${primary} 65%, #000))`,
            boxShadow: `0 8px 32px color-mix(in srgb, ${primary} 35%, transparent)`,
          }}
        >
          <div>
            <p className="label-caps text-white/60">Bereit zu spielen?</p>
            <p className="text-2xl font-extrabold text-white tracking-tight mt-1">Platz buchen</p>
          </div>
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            <ArrowRight className="w-6 h-6 text-white" />
          </div>
        </Link>

        {/* ── NEXT BOOKING ── */}
        {nextBooking ? (
          <div
            className="rounded-3xl p-5 anim-fade-up anim-stagger-1"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <p className="label-caps text-white/30 mb-3">Nächste Buchung</p>
            <div className="flex items-end justify-between">
              <div>
                <p className="font-mono text-3xl font-bold text-white leading-none">
                  {format(new Date(nextBooking.start_time), "dd. MMM")}
                </p>
                <div className="flex items-center gap-2 mt-2 text-sm text-white/50">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="font-mono">{format(new Date(nextBooking.start_time), "HH:mm")}</span>
                  <span className="text-white/25">·</span>
                  <span>{(nextBooking as any).courts?.name}</span>
                </div>
              </div>
              <CancelBookingButton bookingId={nextBooking.id} />
            </div>
          </div>
        ) : (
          <div
            className="rounded-3xl p-5 text-center anim-fade-up anim-stagger-1"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px dashed rgba(255,255,255,0.07)",
            }}
          >
            <p className="text-sm text-white/25">Keine anstehenden Buchungen</p>
          </div>
        )}

        {/* ── STATS ── */}
        <div className="grid grid-cols-3 gap-3 anim-fade-up anim-stagger-2">
          {[
            { label: t("dashboard.stats.wins", "Siege"), value: stats?.wins ?? 0 },
            { label: t("dashboard.stats.losses", "Niederlagen"), value: stats?.losses ?? 0 },
            { label: t("dashboard.stats.streak", "Streak"), value: stats?.win_streak ?? 0 },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl p-4 text-center"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <p className="font-mono text-3xl font-bold text-white">{s.value}</p>
              <p className="label-caps-sm text-white/35 mt-1.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── QUICK LINKS ── */}
        <div className="grid grid-cols-2 gap-3 anim-fade-up anim-stagger-3">
          <Link
            href={`/${lang}/club/${slug}/dashboard/training`}
            className="rounded-2xl p-4 flex items-center gap-3 active:scale-[0.97] transition-transform"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `color-mix(in srgb, ${primary} 18%, transparent)` }}
            >
              <Dumbbell className="w-4 h-4" style={{ color: primary }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Training</p>
              <p className="text-xs text-white/35">& Kurse</p>
            </div>
          </Link>
          <Link
            href={`/${lang}/club/${slug}/dashboard/leaderboard`}
            className="rounded-2xl p-4 flex items-center gap-3 active:scale-[0.97] transition-transform"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `color-mix(in srgb, ${primary} 18%, transparent)` }}
            >
              <Trophy className="w-4 h-4" style={{ color: primary }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Rangliste</p>
              <p className="text-xs text-white/35">Top 50</p>
            </div>
          </Link>
        </div>

        {/* ── MEMBERSHIP CARD ── */}
        <div
          className="rounded-3xl p-5 anim-fade-up anim-stagger-4"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <p className="label-caps text-white/30">Meine Mitgliedschaft</p>
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide"
              style={
                paymentPaid
                  ? { background: "rgba(52,211,153,0.12)", color: "rgb(52,211,153)", border: "1px solid rgba(52,211,153,0.20)" }
                  : member.payment_status === "overdue"
                  ? { background: "rgba(239,68,68,0.12)", color: "rgb(248,113,113)", border: "1px solid rgba(239,68,68,0.20)" }
                  : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.10)" }
              }
            >
              {paymentPaid ? "Bezahlt" : member.payment_status === "overdue" ? "Überfällig" : member.payment_status === "cancelled" ? "Gekündigt" : "Aktiv"}
            </span>
          </div>
          <p className="text-lg font-bold text-white">{member.membership_plans?.name || "Mitgliedschaft"}</p>
          {member.valid_until && (
            <p className="label-caps text-white/30 mt-2">
              Gültig bis{" "}
              <span className="font-mono text-white/60 font-medium normal-case tracking-normal text-[11px]">
                {new Date(member.valid_until).toLocaleDateString("de-DE")}
              </span>
            </p>
          )}
          <div className="flex gap-2 mt-4 flex-wrap">
            <BillingPortalButton clubSlug={slug} returnPath={`/${lang}/club/${slug}/dashboard`} hasStripeCustomer={hasStripeCustomer} />
            {member.stripe_subscription_id && member.payment_status !== "cancelled" && (
              <CancelMembershipButton clubSlug={slug} />
            )}
          </div>
        </div>

        {/* ── UPCOMING BOOKINGS ── */}
        {(upcomingBookings?.length ?? 0) > 1 && (
          <div
            className="rounded-3xl overflow-hidden anim-fade-up anim-stagger-5"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              className="px-5 py-4 flex items-center justify-between"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <p className="text-sm font-semibold text-white">Anstehende Buchungen</p>
              <span
                className="font-mono text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
                style={{ background: `color-mix(in srgb, ${primary} 20%, transparent)`, color: primary }}
              >
                {upcomingBookings!.length}
              </span>
            </div>
            <div>
              {upcomingBookings!.slice(1).map((b: any, idx: number) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between px-5 py-4"
                  style={idx > 0 ? { borderTop: "1px solid rgba(255,255,255,0.05)" } : {}}
                >
                  <div>
                    <p className="text-sm font-medium text-white font-mono">
                      {format(new Date(b.start_time), "dd. MMM · HH:mm")}
                    </p>
                    <p className="text-xs text-white/35 mt-0.5">{b.courts?.name}</p>
                  </div>
                  <CancelBookingButton bookingId={b.id} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PAST GAMES ── */}
        {(pastBookings?.length ?? 0) > 0 && (
          <div
            className="rounded-3xl overflow-hidden anim-fade-up anim-stagger-6"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              className="px-5 py-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <p className="text-sm font-semibold text-white">Letzte Spiele</p>
            </div>
            <div>
              {pastBookings!.map((b: any, idx: number) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between px-5 py-4"
                  style={idx > 0 ? { borderTop: "1px solid rgba(255,255,255,0.05)" } : {}}
                >
                  <div>
                    <p className="text-sm font-medium text-white font-mono">
                      {format(new Date(b.start_time), "dd. MMM · HH:mm")}
                    </p>
                    <p className="text-xs text-white/35 mt-0.5">{(b as any).courts?.name}</p>
                  </div>
                  {recapMap.get(b.id)?.token ? (
                    <Link
                      href={`/${lang}/match/recap/${recapMap.get(b.id).token}`}
                      className="text-xs font-semibold hover:opacity-70 transition-opacity"
                      style={{ color: primary }}
                    >
                      Ergebnis
                    </Link>
                  ) : (
                    <span className="text-xs text-white/20">—</span>
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
