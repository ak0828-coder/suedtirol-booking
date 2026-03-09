import { createClient } from "@/lib/supabase/server"
import { getAdminClient } from "@/lib/supabase/admin"
import { notFound } from "next/navigation"
import { BookingModal } from "@/components/booking-modal"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { getReadableTextColor } from "@/lib/color"
import { getDictionary } from "@/lib/dictionaries"
import { createTranslator } from "@/lib/translator"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export default async function DashboardBookPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}) {
  const { slug, lang } = await params
  const dict = await getDictionary(lang as any)
  const t = createTranslator(dict)
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
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

  const isMember = member.status === "active" && (!member.valid_until || new Date(member.valid_until) > new Date())

  const { data: courts } = await supabase
    .from("courts")
    .select("*")
    .eq("club_id", club.id)
    .order("name")

  const primary = club.primary_color || "#1F3D2B"
  const primaryFg = getReadableTextColor(primary)

  return (
    <div
      className="min-h-screen bg-[#f5f5f7] pb-28"
      style={{ ["--club-primary" as any]: primary, ["--club-primary-foreground" as any]: primaryFg }}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#f5f5f7]/90 backdrop-blur-md border-b border-slate-200/60">
        <div className="max-w-xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href={`/${lang}/club/${slug}/dashboard`} className="w-9 h-9 rounded-xl bg-white border border-slate-200/60 flex items-center justify-center shadow-sm">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">{t("book.title", "Platz buchen")}</h1>
            <p className="text-xs text-slate-400">{club.name}</p>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-4 space-y-3">
        {!courts || courts.length === 0 ? (
          <div className="rounded-2xl bg-white border border-slate-200/60 shadow-sm p-8 text-center">
            <p className="text-slate-400 text-sm">{t("book.no_courts", "Keine Plätze verfügbar.")}</p>
          </div>
        ) : (
          courts.map((court: any) => {
            const duration = court.duration_minutes || 60
            return (
              <div key={court.id} className="rounded-2xl bg-white border border-slate-200/60 shadow-sm overflow-hidden">
                {/* Color accent bar */}
                <div className="h-1.5" style={{ backgroundColor: primary }} />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{court.name}</h3>
                      <p className="text-sm text-slate-400 mt-0.5 capitalize">{court.sport_type || "Tennis"}</p>
                    </div>
                    <div className="text-right">
                      {(() => {
                        const mode = club.member_booking_pricing_mode
                        const val = club.member_booking_pricing_value || 0
                        const base = court.price_per_hour
                        let memberPrice = base
                        if (isMember && mode === "discount_percent") memberPrice = Math.max(0, base * (1 - val / 100))
                        else if (isMember && mode === "member_price") memberPrice = Math.max(0, val)
                        const hasDiscount = isMember && memberPrice < base
                        return (
                          <>
                            {hasDiscount && <p className="text-xs text-slate-400 line-through text-right">{base}€</p>}
                            <p className="text-2xl font-bold text-slate-900">{hasDiscount ? memberPrice : base}€</p>
                            <p className="text-xs text-slate-400">/ {duration} Min</p>
                            {hasDiscount && <p className="text-xs font-medium mt-0.5" style={{ color: primary }}>Mitgliederpreis</p>}
                          </>
                        )
                      })()}
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
          })
        )}
      </div>

      <MobileBottomNav slug={slug} active="book" />
    </div>
  )
}
