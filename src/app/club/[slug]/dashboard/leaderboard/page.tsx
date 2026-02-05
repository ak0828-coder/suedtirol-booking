import { createClient } from "@/lib/supabase/server"
import { getClubRanking } from "@/app/actions"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy } from "lucide-react"

export default async function ClubLeaderboardPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return notFound()

  const { data: club } = await supabase
    .from("clubs")
    .select("id, name")
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 pb-20">
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <header className="rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Top 50 Rangliste</h1>
              <p className="text-sm text-slate-500">Club: {club.name}</p>
            </div>
            <Link href={`/club/${slug}/dashboard`}>
              <Button variant="outline" className="rounded-full">Zurück</Button>
            </Link>
          </div>
        </header>

        <Card className="rounded-2xl border border-slate-200/60 bg-white/80 shadow-sm">
          <CardHeader>
            <CardTitle className="flex gap-2 items-center">
              <Trophy className="text-amber-500" /> Rangliste
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ranking.length === 0 ? (
              <p className="text-sm text-slate-500">Noch keine Ranglistenpunkte vorhanden.</p>
            ) : (
              <div className="space-y-2">
                {ranking.map((row) => (
                  <div
                    key={row.userId}
                    className={`flex items-center justify-between rounded-xl border border-slate-200/60 bg-white/90 px-3 py-2 text-sm ${row.rank <= 3 ? "anim-pop" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      {row.rank <= 3 ? (
                        <span
                          className={
                            row.rank === 1
                              ? "rounded-full bg-amber-100 text-amber-800 px-2 py-1 text-xs font-semibold"
                              : row.rank === 2
                              ? "rounded-full bg-slate-200 text-slate-700 px-2 py-1 text-xs font-semibold"
                              : "rounded-full bg-amber-50 text-amber-700 px-2 py-1 text-xs font-semibold"
                          }
                        >
                          {row.rank}
                        </span>
                      ) : (
                        <span className="w-8 text-center font-semibold text-slate-500">
                          {row.rank}
                        </span>
                      )}
                      <span className="font-medium text-slate-800">{row.name}</span>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {row.points} Punkte
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
