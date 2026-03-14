import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { MapPin, Check, LogIn, User, Sparkles, ChevronRight, CalendarDays } from "lucide-react"
import { BookingModal } from "@/components/booking-modal"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MembershipPlans } from "@/components/membership-plans"
import { applyClubDefaults, mergeClubContent } from "@/lib/club-content"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { getReadableTextColor } from "@/lib/color"
import { TourLauncher } from "@/components/tours/tour-launcher"
import { Suspense } from "react"
import { getDictionary } from "@/lib/dictionaries"
import { createTranslator } from "@/lib/translator"

async function getClubData(slug: string) {
  const supabase = await createClient()

  const { data: club } = await supabase
    .from("clubs")
    .select("*")
    .eq("slug", slug)
    .single()

  if (!club) return null

  const { data: courts } = await supabase
    .from("courts")
    .select("*")
    .eq("club_id", club.id)
    .order("name")

  const { data: plans } = await supabase
    .from("membership_plans")
    .select("*")
    .eq("club_id", club.id)
    .order("price", { ascending: true })

  return { club, courts, plans }
}

export default async function ClubPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}) {
  const { slug, lang } = await params
  const dict = await getDictionary(lang as any)
  const t = createTranslator(dict)
  const supabase = await createClient()
  const data = await getClubData(slug)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!data) return notFound()

  const { club, courts, plans } = data
  const primary = club.primary_color || "#0f172a"
  const primaryFg = getReadableTextColor(primary)
  const courtCount = courts?.length || 0
  const minPrice =
    courts && courts.length > 0
      ? Math.min(...courts.map((court: any) => court.price_per_hour || 0))
      : null

  const { data: contentRows } = await supabase
    .from("club_content")
    .select("content")
    .eq("club_id", club.id)
    .limit(1)

  const storedContent = contentRows?.[0]?.content ?? null
  const content = applyClubDefaults(mergeClubContent(storedContent), club.name)

  let isMember = false
  if (user) {
    const { data: member } = await supabase
      .from("club_members")
      .select("id, status, valid_until")
      .eq("club_id", club.id)
      .eq("user_id", user.id)
      .eq("status", "active")
      .single()

    if (member && (!member.valid_until || new Date(member.valid_until) > new Date())) {
      isMember = true
    }
  }

  if (isMember) {
    redirect(`/${lang}/club/${slug}/dashboard`)
  }

  return (
    <div
      className="min-h-screen pb-24 page-enter"
      style={{
        background: "#09090b",
        ["--club-primary" as any]: primary,
        ["--club-primary-foreground" as any]: primaryFg,
      }}
    >
      {/* Grain texture */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          opacity: 0.028,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "160px",
          zIndex: 9998,
        }}
      />

      {/* Top ambient glow */}
      <div
        className="fixed top-0 left-0 right-0 h-[50vh] pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% -10%, color-mix(in srgb, ${primary} 20%, transparent) 0%, transparent 70%)`,
          zIndex: 0,
        }}
      />

      {/* ── HEADER ── */}
      <header
        id="tour-booking-header"
        className="relative z-10 sticky top-0"
        style={{
          background: "rgba(9,9,11,0.80)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="mx-auto max-w-5xl app-pad py-4 flex items-center justify-between gap-3">
          {/* Logo + name */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold overflow-hidden ring-1 ring-white/10 shrink-0"
              style={{ backgroundColor: primary }}
            >
              {club.logo_url ? (
                <img src={club.logo_url} alt={club.name} className="w-full h-full object-cover" />
              ) : (
                <span>{club.name.substring(0, 2).toUpperCase()}</span>
              )}
            </div>
            <span className="text-sm font-semibold text-white truncate hidden sm:block">{club.name}</span>
          </div>

          {/* Nav actions */}
          <div className="flex items-center gap-2">
            <ModeToggle />
            <Suspense fallback={null}>
              <TourLauncher tour="member-booking" storageKey="tour_member_booking_seen" label="Guide" autoStart />
            </Suspense>
            <Link href={`/${lang}/club/${slug}/training`}>
              <button
                id="tour-booking-training"
                className="hidden sm:flex items-center gap-1.5 h-9 px-4 rounded-full text-sm font-medium text-white/70 hover:text-white transition-colors btn-press"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.09)",
                }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                {t("club.nav.training", "Training")}
              </button>
            </Link>

            {user ? (
              <Link href={`/${lang}/club/${slug}/dashboard`}>
                <button
                  className="flex items-center gap-1.5 h-9 px-4 rounded-full text-sm font-medium text-white/80 hover:text-white transition-colors btn-press"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.09)",
                  }}
                >
                  <User className="w-3.5 h-3.5" />
                  {t("club.nav.my_area", "Mein Bereich")}
                </button>
              </Link>
            ) : (
              <Link href={`/${lang}/club/${slug}/login?next=/${lang}/club/${slug}/dashboard`}>
                <button
                  className="flex items-center gap-1.5 h-9 px-4 rounded-full text-sm font-semibold text-white btn-press"
                  style={{
                    backgroundColor: primary,
                    boxShadow: `0 0 20px color-mix(in srgb, ${primary} 30%, transparent)`,
                  }}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  {t("club.nav.login", "Login")}
                </button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative z-10 mx-auto max-w-5xl app-pad pt-14 pb-16 sm:pt-20 sm:pb-24">
        <div className="grid items-center gap-10 md:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
          {/* Left: branding + CTA */}
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            {/* Logo */}
            <div className="relative mb-7 anim-scale-in">
              <div
                className="absolute inset-0 rounded-3xl blur-2xl opacity-50 scale-125"
                style={{ backgroundColor: primary }}
              />
              <div
                className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl flex items-center justify-center text-white text-4xl font-extrabold overflow-hidden ring-1 ring-white/10"
                style={{ backgroundColor: primary }}
              >
                {club.logo_url ? (
                  <img src={club.logo_url} alt={club.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{club.name.substring(0, 2).toUpperCase()}</span>
                )}
              </div>
            </div>

            <p className="label-caps text-white/35 mb-3 anim-fade-up">{content.badges.locationText}</p>

            <h1 className="text-5xl sm:text-6xl font-extrabold text-white tracking-[-0.04em] leading-none anim-fade-up anim-stagger-1">
              {content.hero.title}
            </h1>
            <p className="mt-4 text-base text-white/50 font-light max-w-sm anim-fade-up anim-stagger-2">
              {content.hero.subtitle}
            </p>

            {/* Status badge */}
            <div
              className="mt-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs text-white/60 anim-fade-up anim-stagger-3"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.09)",
              }}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{content.badges.locationText}</span>
              <span className="mx-1 h-3 w-px bg-white/20" />
              <span className="inline-flex items-center gap-1" style={{ color: primary }}>
                <Check className="w-3 h-3" /> {content.badges.statusText}
              </span>
            </div>

            {/* CTA buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto anim-fade-up anim-stagger-4">
              <Link href="#courts">
                <button
                  className="flex items-center justify-center gap-2 h-12 px-7 rounded-full text-sm font-semibold text-white btn-press w-full sm:w-auto touch-44"
                  style={{
                    backgroundColor: primary,
                    boxShadow: `0 0 28px color-mix(in srgb, ${primary} 32%, transparent)`,
                  }}
                >
                  {content.hero.primaryCtaText} <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
              {plans && plans.length > 0 && !isMember && (
                <Link href="#membership">
                  <button
                    className="flex items-center justify-center gap-2 h-12 px-7 rounded-full text-sm font-medium text-white/75 hover:text-white transition-colors btn-press w-full sm:w-auto touch-44"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.10)",
                    }}
                  >
                    {content.hero.secondaryCtaText}
                  </button>
                </Link>
              )}
            </div>
          </div>

          {/* Right: stats panel */}
          <div
            className="rounded-3xl p-6 anim-scale-in anim-stagger-2"
            style={{
              background: "rgba(255,255,255,0.04)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <p className="label-caps text-white/30 mb-5">{content.overview.title}</p>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/50">{content.overview.labelCourts}</span>
                <span className="font-mono text-2xl font-bold text-white">{courtCount}</span>
              </div>
              <div className="h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/50">{content.overview.labelFromPrice}</span>
                <span className="font-mono text-2xl font-bold text-white">
                  {minPrice !== null ? `${minPrice}€` : "—"}
                </span>
              </div>
              <div className="h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/50">{content.overview.labelStatus}</span>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium" style={{ color: primary }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primary }} />
                  {content.badges.statusText}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── COURTS ── */}
      <section className="relative z-10 mx-auto max-w-5xl app-pad">
        <div id="courts" className="flex items-end justify-between mb-8 scroll-mt-24">
          <div>
            <p className="label-caps text-white/30 mb-2">{content.sections.courts.subtitle}</p>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {content.sections.courts.title}
            </h2>
          </div>
        </div>

        <div id="tour-booking-courts" className="grid md:grid-cols-2 gap-5">
          {courts?.map((court: any, idx: number) => {
            const duration = court.duration_minutes || 60
            return (
              <div
                key={court.id}
                id={idx === 0 ? "tour-booking-first" : undefined}
                className={`rounded-3xl overflow-hidden tilt-card anim-slide-up anim-stagger-${Math.min(idx + 1, 6) as 1|2|3|4|5|6}`}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {/* Club color accent stripe */}
                <div
                  className="h-[2px]"
                  style={{ background: `linear-gradient(90deg, ${primary}, transparent)` }}
                />
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div>
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3"
                        style={{
                          background: `color-mix(in srgb, ${primary} 16%, transparent)`,
                          border: `1px solid color-mix(in srgb, ${primary} 25%, transparent)`,
                        }}
                      >
                        <CalendarDays className="w-5 h-5" style={{ color: primary }} />
                      </div>
                      <h3 className="text-xl font-bold text-white tracking-tight">{court.name}</h3>
                      <p className="label-caps text-white/35 mt-1.5 capitalize">
                        {court.sport_type || t("club.courts.sport_default", "Tennis")}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-mono text-3xl font-bold text-white leading-none">
                        {court.price_per_hour}€
                      </p>
                      <p className="label-caps-sm text-white/30 mt-1">
                        / {duration} {t("club.courts.minutes", "Min")}
                      </p>
                    </div>
                  </div>
                  <BookingModal
                    courtId={court.id}
                    courtName={court.name}
                    price={court.price_per_hour}
                    clubSlug={club.slug}
                    durationMinutes={duration}
                    startHour={court.start_hour}
                    endHour={court.end_hour}
                    isMember={isMember}
                    memberPricingMode={club.member_booking_pricing_mode || "full_price"}
                    memberPricingValue={club.member_booking_pricing_value || 0}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {courtCount === 0 && (
          <div
            className="rounded-3xl p-10 text-center anim-fade-up"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px dashed rgba(255,255,255,0.08)",
            }}
          >
            <p className="text-white/30 text-sm">{t("club.courts.empty", "Noch keine Plätze verfügbar.")}</p>
          </div>
        )}

        {/* ── MEMBERSHIP ── */}
        {plans && plans.length > 0 && !isMember && (
          <div id="membership" className="mt-20 mb-12 scroll-mt-24">
            <div className="mb-8">
              <p className="label-caps text-white/30 mb-2">{content.sections.membership.subtitle}</p>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {content.sections.membership.title}
              </h2>
            </div>
            <MembershipPlans
              plans={plans}
              clubSlug={slug}
              title={content.sections.membership.title}
              subtitle={content.sections.membership.subtitle}
              ctaLabel={content.sections.membership.ctaLabel}
            />
          </div>
        )}

        {/* ── FOOTER ── */}
        <footer
          className="mt-16 pt-6 pb-4 text-xs text-white/25"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span>{content.footer.smallText}</span>
            <Link
              href={`/${lang}/club/${slug}/impressum`}
              className="text-white/30 hover:text-white/60 transition-colors"
            >
              {content.footer.impressumLinkText}
            </Link>
          </div>
        </footer>
      </section>

      {/* Mobile floating CTA */}
      <div className="sm:hidden fixed left-4 right-4 bottom-6 z-30">
        <Link href="#courts">
          <button
            className="w-full h-14 rounded-full text-sm font-semibold text-white btn-press touch-44"
            style={{
              backgroundColor: primary,
              boxShadow: `0 8px 32px color-mix(in srgb, ${primary} 40%, transparent)`,
            }}
          >
            {t("club.cta.book_now", "Jetzt buchen")}
          </button>
        </Link>
      </div>

      {user && <MobileBottomNav slug={club.slug} active="home" />}
    </div>
  )
}
