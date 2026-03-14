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
      className="min-h-screen bg-[#f5f5f7] pb-24 safe-bottom page-enter"
      style={{ ["--club-primary" as any]: primary, ["--club-primary-foreground" as any]: primaryFg }}
    >
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-[#f5f5f7]/90 backdrop-blur-md border-b border-slate-200/60">
        <div className="max-w-xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link
            href={`/${lang}/club/${slug}/dashboard`}
            className="w-9 h-9 rounded-xl bg-white border border-slate-200/60 flex items-center justify-center shadow-sm"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">{t("leaderboard.title", "Rangliste")}</h1>
            <p className="text-xs text-slate-400">{club.name} · Top 50</p>
          </div>
          <Trophy className="ml-auto w-5 h-5 text-slate-300" />
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-4 space-y-2">
        {ranking.length === 0 ? (
          <div className="rounded-2xl bg-white border border-slate-200/60 shadow-sm p-10 text-center">
            <Trophy className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">{t("leaderboard.empty", "Noch keine Ranglistenpunkte vorhanden.")}</p>
          </div>
        ) : (
          <>
            {/* Top 3 podium */}
            {ranking.length >= 3 && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[ranking[1], ranking[0], ranking[2]].map((row, i) => {
                  if (!row) return <div key={i} />
                  const positions = [1, 0, 2]
                  const isCenter = i === 1
                  return (
                    <div
                      key={row.userId}
                      className={`rounded-2xl border bg-white shadow-sm p-3 text-center flex flex-col items-center gap-1 ${isCenter ? "ring-2 ring-offset-2" : ""}`}
                      style={isCenter ? { ["--tw-ring-color" as any]: primary } : {}}
                    >
                      <span className="text-2xl">{MEDALS[positions[i]]}</span>
                      <span className="text-xs font-semibold text-slate-700 leading-tight line-clamp-1">{row.name}</span>
                      <span className="text-xs font-bold" style={{ color: primary }}>
                        <AnimatedNumber value={row.points} /> P
                      </span>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Full list */}
            <div className="rounded-2xl bg-white border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-100">
                {ranking.map((row) => (
                  <div
                    key={row.userId}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <div className="w-8 text-center flex-shrink-0">
                      {row.rank <= 3 ? (
                        <span className="text-lg">{MEDALS[row.rank - 1]}</span>
                      ) : (
                        <span className="text-sm font-semibold text-slate-400">{row.rank}</span>
                      )}
                    </div>
                    <span className="flex-1 text-sm font-medium text-slate-800 truncate">{row.name}</span>
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: primary + "18", color: primary }}
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
