import { createClient } from "@/lib/supabase/server"
import { getAdminClient } from "@/lib/supabase/admin"
import { getClubRanking } from "@/app/actions"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Trophy } from "lucide-react"
import { AnimatedNumber } from "@/components/animated-number"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { getReadableTextColor } from "@/lib/color"
import { getDictionary } from "@/lib/dictionaries"
import { createTranslator } from "@/lib/translator"

const MEDALS = ["🥇", "🥈", "🥉"]

export default async function ClubLeaderboardPage({
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
    .select("id, name, primary_color")
    .eq("slug", slug)
    .single()

  if (!club) return notFound()

  const adminClient = getAdminClient()
  const { data: member } = await adminClient
    .from("club_members")
    .select("id, status")
    .eq("club_id", club.id)
    .eq("user_id", user.id)
    .single()

  if (!member) return notFound()

  const ranking = await getClubRanking(club.id, 50)

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
              {t("leaderboard.title", "Rangliste")}
            </h1>
            <p className="label-caps text-white/30 mt-0.5">{club.name} · Top 50</p>
          </div>
          <div
            className="ml-auto w-9 h-9 rounded-2xl flex items-center justify-center"
            style={{
              background: `color-mix(in srgb, ${primary} 16%, transparent)`,
              border: `1px solid color-mix(in srgb, ${primary} 28%, transparent)`,
            }}
          >
            <Trophy className="w-4 h-4" style={{ color: primary }} />
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-xl mx-auto px-4 pt-5 space-y-3">
        {ranking.length === 0 ? (
          <div
            className="rounded-3xl p-10 text-center anim-fade-up"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <Trophy className="w-10 h-10 mx-auto mb-3" style={{ color: "rgba(255,255,255,0.12)" }} />
            <p className="text-white/30 text-sm">
              {t("leaderboard.empty", "Noch keine Ranglistenpunkte vorhanden.")}
            </p>
          </div>
        ) : (
          <>
            {/* Top 3 podium */}
            {ranking.length >= 3 && (
              <div className="grid grid-cols-3 gap-2 mb-2 anim-fade-up">
                {[ranking[1], ranking[0], ranking[2]].map((row, i) => {
                  if (!row) return <div key={i} />
                  const positions = [1, 0, 2]
                  const isCenter = i === 1
                  return (
                    <div
                      key={row.userId}
                      className="rounded-3xl p-3 text-center flex flex-col items-center gap-1.5"
                      style={{
                        background: isCenter
                          ? `color-mix(in srgb, ${primary} 14%, rgba(255,255,255,0.04))`
                          : "rgba(255,255,255,0.04)",
                        border: isCenter
                          ? `1px solid color-mix(in srgb, ${primary} 35%, transparent)`
                          : "1px solid rgba(255,255,255,0.08)",
                        paddingTop: isCenter ? "20px" : "12px",
                        paddingBottom: isCenter ? "20px" : "12px",
                      }}
                    >
                      <span className="text-2xl">{MEDALS[positions[i]]}</span>
                      <span className="text-xs font-semibold text-white/80 leading-tight line-clamp-1">
                        {row.name}
                      </span>
                      <span
                        className="font-mono text-xs font-bold"
                        style={{ color: primary }}
                      >
                        <AnimatedNumber value={row.points} /> P
                      </span>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Full list */}
            <div
              className="rounded-3xl overflow-hidden anim-fade-up anim-stagger-1"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div
                className="h-[2px]"
                style={{ background: `linear-gradient(90deg, ${primary}, transparent)` }}
              />
              <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                {ranking.map((row) => (
                  <div
                    key={row.userId}
                    className="flex items-center gap-3 px-5 py-3.5"
                  >
                    <div className="w-7 text-center flex-shrink-0">
                      {row.rank <= 3 ? (
                        <span className="text-base">{MEDALS[row.rank - 1]}</span>
                      ) : (
                        <span className="font-mono text-sm font-medium text-white/25">{row.rank}</span>
                      )}
                    </div>
                    <span className="flex-1 text-sm font-medium text-white/75 truncate">{row.name}</span>
                    <span
                      className="font-mono text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{
                        background: `color-mix(in srgb, ${primary} 15%, transparent)`,
                        color: primary,
                        border: `1px solid color-mix(in srgb, ${primary} 28%, transparent)`,
                      }}
                    >
                      <AnimatedNumber value={row.points} /> {t("leaderboard.points", "Pkt")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <MobileBottomNav slug={slug} active="leaderboard" />
    </div>
  )
}
