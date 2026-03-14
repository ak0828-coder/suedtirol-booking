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
      className="min-h-screen pb-36"
      style={{
        background: "#09090b",
        ["--club-primary" as any]: primary,
        ["--club-primary-foreground" as any]: primaryFg,
      }}
    >
      {/* Ambient top glow */}
      <div
        className="fixed top-0 left-0 right-0 h-64 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 60% 100% at 50% 0%, color-mix(in srgb, ${primary} 12%, transparent) 0%, transparent 100%)`,
          zIndex: 0,
        }}
      />

      {/* Sticky header */}
      <div
        className="sticky top-0 z-20 border-b"
        style={{
          background: "rgba(9,9,11,0.88)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        <div className="max-w-xl mx-auto px-4 py-4 flex items-center gap-3.5">
          <Link
            href={`/${lang}/club/${slug}/dashboard`}
            className="w-10 h-10 rounded-2xl flex items-center justify-center transition-colors"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.09)",
            }}
          >
            <ChevronLeft className="w-5 h-5 text-white/70" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              {t("book.title", "Platz buchen")}
            </h1>
            <p className="label-caps text-white/30 mt-0.5">{club.name}</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-xl mx-auto px-4 pt-5 space-y-4">
        {!courts || courts.length === 0 ? (
          <div
            className="rounded-3xl p-10 text-center anim-fade-up"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <p className="text-white/30 text-sm">{t("book.no_courts", "Keine Plätze verfügbar.")}</p>
          </div>
        ) : (
          courts.map((court: any, idx: number) => {
            const duration = court.duration_minutes || 60
            const mode = club.member_booking_pricing_mode
            const val = club.member_booking_pricing_value || 0
            const base = court.price_per_hour
            let memberPrice = base
            if (isMember && mode === "discount_percent") memberPrice = Math.max(0, base * (1 - val / 100))
            else if (isMember && mode === "member_price") memberPrice = Math.max(0, val)
            const hasDiscount = isMember && memberPrice < base

            return (
              <div
                key={court.id}
                className={`rounded-3xl overflow-hidden tilt-card anim-slide-up anim-stagger-${Math.min(idx + 1, 6) as 1 | 2 | 3 | 4 | 5 | 6}`}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {/* Gradient accent stripe */}
                <div
                  className="h-[2px]"
                  style={{
                    background: `linear-gradient(90deg, ${primary}, transparent)`,
                  }}
                />

                <div className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div>
                      <h3 className="text-xl font-bold text-white tracking-tight">{court.name}</h3>
                      <p className="label-caps text-white/35 mt-1.5 capitalize">
                        {court.sport_type || "Tennis"}
                      </p>
                      {hasDiscount && (
                        <span
                          className="inline-block mt-2 text-[9px] font-medium tracking-[0.12em] uppercase px-2.5 py-1 rounded-full"
                          style={{
                            background: `color-mix(in srgb, ${primary} 18%, transparent)`,
                            color: primary,
                            border: `1px solid color-mix(in srgb, ${primary} 30%, transparent)`,
                          }}
                        >
                          Mitgliederpreis
                        </span>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      {hasDiscount && (
                        <p className="font-mono text-sm text-white/30 line-through text-right">{base}€</p>
                      )}
                      <p className="font-mono text-3xl font-bold text-white leading-none">
                        {hasDiscount ? memberPrice : base}€
                      </p>
                      <p className="label-caps-sm text-white/30 mt-1">/ {duration} Min</p>
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
