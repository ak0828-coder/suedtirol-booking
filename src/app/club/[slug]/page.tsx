import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { CalendarDays, MapPin, Check, LogIn, User, Sparkles, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { BookingModal } from "@/components/booking-modal"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MembershipPlans } from "@/components/membership-plans"
import { applyClubDefaults, mergeClubContent } from "@/lib/club-content"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"

// Helper, um Daten zu holen
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

  // Pläne laden
  const { data: plans } = await supabase
    .from("membership_plans")
    .select("*")
    .eq("club_id", club.id)
    .order("price", { ascending: true })

  return { club, courts, plans }
}

export default async function ClubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const data = await getClubData(slug)

  // Prüfen, ob User eingeloggt ist (für den Header Button)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!data) return notFound()

  const { club, courts, plans } = data
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

  // --- NEU: PRÜFEN OB MEMBER ---
  let isMember = false
  if (user) {
    const { data: member } = await supabase
      .from("club_members")
      .select("id, status, valid_until")
      .eq("club_id", club.id)
      .eq("user_id", user.id)
      .eq("status", "active")
      .single()

    if (member && member.valid_until && new Date(member.valid_until) > new Date()) {
      isMember = true
    }
  }
  // -----------------------------

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 pb-24 safe-bottom transition-colors duration-300 page-enter">
      {/* HEADER */}
      <header className="relative overflow-hidden border-b border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-slate-200/40 blur-3xl dark:bg-slate-700/30" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-rose-200/50 blur-3xl dark:bg-rose-900/20" />
        </div>

        <div className="relative mx-auto max-w-5xl app-pad py-6 sm:py-10">
          {/* Navigation Oben Rechts */}
          <div className="flex items-center justify-end gap-2">
            <ModeToggle />

            {/* LOGIN / DASHBOARD BUTTON */}
            {user ? (
              <Link href="/login">
                <Button variant="outline" className="gap-2 rounded-full btn-press">
                  <User className="w-4 h-4" /> Mein Bereich
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button
                  variant="default"
                  className="gap-2 rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 btn-press"
                >
                  <LogIn className="w-4 h-4" /> Login
                </Button>
              </Link>
            )}
          </div>

          <div className="mt-6 grid items-center gap-6 md:gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <div className="flex flex-col items-center text-center md:items-start md:text-left">
              {/* LOGO */}
              <div
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-xl overflow-hidden border border-white/70 dark:border-slate-800/70 bg-white"
                style={{ backgroundColor: club.primary_color || "#e11d48" }}
              >
                {club.logo_url ? (
                  <img src={club.logo_url} alt={club.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{club.name.substring(0, 2).toUpperCase()}</span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                {content.hero.title}
              </h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md">
                {content.hero.subtitle}
              </p>

              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-700/60 px-3 py-1 text-xs text-slate-600 dark:text-slate-300 shadow-sm">
                <MapPin className="w-3.5 h-3.5" />
                <span>{content.badges.locationText}</span>
                <span className="mx-2 h-3 w-px bg-slate-200 dark:bg-slate-700" />
                <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
                  <Check className="w-3 h-3" /> {content.badges.statusText}
                </span>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <Link href="#courts">
                  <Button className="gap-2 rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 btn-press w-full sm:w-auto touch-44">
                    {content.hero.primaryCtaText} <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
                {plans && plans.length > 0 && !isMember && (
                  <Link href="#membership">
                    <Button variant="outline" className="gap-2 rounded-full btn-press w-full sm:w-auto touch-44">
                      {content.hero.secondaryCtaText}
                    </Button>
                  </Link>
                )}
                {isMember && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50 px-3 py-1 text-xs text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-200">
                    <Sparkles className="w-3.5 h-3.5" />
                    {content.hero.memberBadgeText}
                  </span>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/60 bg-white/85 p-5 sm:p-6 shadow-sm backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/80">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {content.overview.title}
              </div>
              <div className="mt-4 grid gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {content.overview.labelCourts}
                  </span>
                  <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {courtCount}
                  </span>
                </div>
                <div className="h-px bg-slate-200/60 dark:bg-slate-800/60" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {content.overview.labelFromPrice}
                  </span>
                  <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {minPrice !== null ? `${minPrice}€` : "-"}
                  </span>
                </div>
                <div className="h-px bg-slate-200/60 dark:bg-slate-800/60" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {content.overview.labelStatus}
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                    <Check className="w-3.5 h-3.5" /> {content.badges.statusText}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl app-pad mt-8 sm:mt-10">
        {/* SECTION 1: PLÄTZE */}
        <div id="courts" className="flex items-end justify-between mb-6 scroll-mt-24">
          <div>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
              {content.sections.courts.title}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {content.sections.courts.subtitle}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5 sm:gap-6">
          {courts?.map((court: any) => {
            const duration = court.duration_minutes || 60
            return (
              <Card
                key={court.id}
                className="group overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 shadow-sm hover:shadow-md transition-shadow"
              >
                <CardContent className="p-0">
                  <div className="flex flex-col">
                    <div className="flex p-6">
                      <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center mr-4">
                        <CalendarDays className="w-7 h-7 text-slate-500 dark:text-slate-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">
                              {court.name}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                              {court.sport_type || "Tennis"}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="block text-lg font-semibold text-slate-900 dark:text-slate-100">
                              {court.price_per_hour}€
                            </span>
                            <span className="text-xs text-slate-400">/ {duration} Min</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="px-6 pb-6">
      <BookingModal
                        courtId={court.id}
                        courtName={court.name}
                        price={court.price_per_hour}
                        clubSlug={club.slug}
                        durationMinutes={duration}
                        startHour={court.start_hour}
                        endHour={court.end_hour}
                        isMember={isMember}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {courtCount === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-200/70 bg-white/70 p-8 text-center text-sm text-slate-500 dark:border-slate-800/70 dark:bg-slate-900/70 dark:text-slate-400">
            Noch keine Plätze verfügbar.
          </div>
        )}

        {/* SECTION 2: MITGLIEDSCHAFTEN (Anzeige nur, wenn Pläne vorhanden sind und User kein Mitglied ist) */}
        {plans && plans.length > 0 && !isMember && (
          <div id="membership" className="mt-16 mb-12 scroll-mt-24">
            <MembershipPlans
              plans={plans}
              clubSlug={slug}
              title={content.sections.membership.title}
              subtitle={content.sections.membership.subtitle}
              ctaLabel={content.sections.membership.ctaLabel}
            />
          </div>
        )}

        <footer className="mt-16 border-t border-slate-200/60 pt-6 text-sm text-slate-500 dark:border-slate-800/60 dark:text-slate-400">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <span>{content.footer.smallText}</span>
            <Link href={`/club/${slug}/impressum`} className="text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
              {content.footer.impressumLinkText}
            </Link>
          </div>
        </footer>
      </div>

      <div className="sm:hidden fixed left-4 right-4 bottom-20 z-30">
        <Link href="#courts">
          <Button className="w-full rounded-full bg-slate-900 text-white hover:bg-slate-800 btn-press touch-44">
            Jetzt buchen
          </Button>
        </Link>
      </div>

      <MobileBottomNav slug={club.slug} active="home" />
    </div>
  )
}
