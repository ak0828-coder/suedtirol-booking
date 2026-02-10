import { createClient } from "@/lib/supabase/server"
import { getClubRanking } from "@/app/actions"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy } from "lucide-react"
import { AnimatedNumber } from "@/components/animated-number"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { getReadableTextColor } from "@/lib/color"
import { getDictionary } from "@/lib/dictionaries"
import { createTranslator } from "@/lib/translator"

export default async function ClubLeaderboardPage({
  params,
}: {
  params: { lang: string; slug: string }
}) {
  const { slug, lang } = params
  const dict = await getDictionary(lang as any)
  const t = createTranslator(dict)
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return notFound()

  const { data: club } = await supabase
    .from("clubs")
    .select("id, name, primary_color")
    .eq("slug", slug)
    .single()

  if (!club) return notFound()

  const { data: member } = await supabase
    .from("club_members")
    .select("id, status")
    .eq("club_id", club.id)
    .eq("user_id", user.id)
    .single()

  if (!member || member.status !== "active") return notFound()

  const ranking = await getClubRanking(club.id, 50)

  const primary = club.primary_color || "#0f172a"
  const primaryFg = getReadableTextColor(primary)

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 pb-24 safe-bottom page-enter"
      style={{ ["--club-primary" as any]: primary, ["--club-primary-foreground" as any]: primaryFg }}
    >
      <div className="mx-auto max-w-4xl space-y-6 app-pad pt-4 sm:pt-6">
        <header className="rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">{t("leaderboard.title", "Top 50 Rangliste")}</h1>
              <p className="text-sm text-slate-500">{t("leaderboard.club", "Club:")} {club.name}</p>
            </div>
            <Link href={`/${lang}/club/${slug}/dashboard`}>
              <Button variant="outline" className="rounded-full">{t("leaderboard.back", "Zurück")}</Button>
            </Link>
          </div>
        </header>

        <Card className="rounded-2xl border border-slate-200/60 bg-white/80 shadow-sm">
          <CardHeader>
            <CardTitle className="flex gap-2 items-center">
              <Trophy className="club-primary-text" /> {t("leaderboard.heading", "Rangliste")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ranking.length === 0 ? (
              <p className="text-sm text-slate-500">{t("leaderboard.empty", "Noch keine Ranglistenpunkte vorhanden.")}</p>
            ) : (
              <div className="space-y-2">
                {ranking.map((row) => (
                  <div
                    key={row.userId}
                    className={`flex items-center justify-between rounded-xl border border-slate-200/60 bg-white/90 px-3 py-2 text-sm ${row.rank <= 3 ? "anim-pop" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      {row.rank <= 3 ? (
                        <span className="rounded-full border club-primary-border px-2 py-1 text-xs font-semibold club-primary-text">
                          {row.rank}
                        </span>
                      ) : (
                        <span className="w-8 text-center font-semibold text-slate-500">
                          {row.rank}
                        </span>
                      )}
                      <span className="font-medium text-slate-800">{row.name}</span>
                    </div>
                    <span className="rounded-full border club-primary-border px-3 py-1 text-xs font-semibold club-primary-text">
                      <AnimatedNumber value={row.points} /> {t("leaderboard.points", "Punkte")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <MobileBottomNav slug={slug} active="leaderboard" />
    </div>
  )
}
