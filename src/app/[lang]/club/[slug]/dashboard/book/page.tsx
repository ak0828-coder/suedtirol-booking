import { createClient } from "@/lib/supabase/server"
import { getAdminClient } from "@/lib/supabase/admin"
import { notFound } from "next/navigation"
import { BookingModal } from "@/components/booking-modal"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { Card, CardContent } from "@/components/ui/card"
import { CalendarDays } from "lucide-react"
import { getReadableTextColor } from "@/lib/color"
import { getDictionary } from "@/lib/dictionaries"
import { createTranslator } from "@/lib/translator"

export default async function DashboardBookPage({
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
  if (!user) return notFound()

  const { data: club } = await supabase
    .from("clubs")
    .select("id, name, primary_color, slug, member_booking_pricing_mode, member_booking_pricing_value")
    .eq("slug", slug)
    .single()

  if (!club) return notFound()

  const adminClient = getAdminClient()
  const { data: member } = await adminClient
    .from("club_members")
    .select("id, status, valid_until")
    .eq("club_id", club.id)
    .eq("user_id", user.id)
    .single()

  if (!member) return notFound()

  const isMember =
    member.status === "active" &&
    (!member.valid_until || new Date(member.valid_until) > new Date())

  const { data: courts } = await supabase
    .from("courts")
    .select("*")
    .eq("club_id", club.id)
    .order("name")

  const primary = club.primary_color || "#0f172a"
  const primaryFg = getReadableTextColor(primary)

  return (
    <div
      className="min-h-screen bg-[#f5f5f7] pb-24 safe-bottom page-enter"
      style={{ ["--club-primary" as any]: primary, ["--club-primary-foreground" as any]: primaryFg }}
    >
      <div className="mx-auto max-w-3xl space-y-6 app-pad pt-4 sm:pt-6">
        <header className="rounded-2xl border border-slate-200/60 bg-white/90 p-5 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">{t("book.title", "Platz buchen")}</h1>
          <p className="text-sm text-slate-500 mt-1">{club.name}</p>
        </header>

        {!courts || courts.length === 0 ? (
          <div className="rounded-2xl border border-slate-200/60 bg-white/90 p-6 text-center text-slate-500 shadow-sm">
            {t("book.no_courts", "Keine Plätze verfügbar.")}
          </div>
        ) : (
          <div className="grid gap-4">
            {courts.map((court: any) => {
              const duration = court.duration_minutes || 60
              return (
                <Card
                  key={court.id}
                  className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white/90 shadow-sm"
                >
                  <CardContent className="p-0">
                    <div className="flex items-start gap-4 p-5">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                        <CalendarDays className="w-6 h-6 club-primary-text" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h3 className="font-semibold text-slate-900">{court.name}</h3>
                            <p className="text-sm text-slate-500 capitalize">
                              {court.sport_type || t("book.sport_default", "Tennis")}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="block text-lg font-semibold text-slate-900">
                              {court.price_per_hour}€
                            </span>
                            <span className="text-xs text-slate-400">/ {duration} {t("book.minutes", "Min")}</span>
                          </div>
                        </div>
                        <div className="mt-4">
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
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
      <MobileBottomNav slug={slug} active="book" />
    </div>
  )
}
