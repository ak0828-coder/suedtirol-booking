import { getMatchRecapByToken } from "@/app/actions"
import { MatchRecapForm } from "@/components/match-recap-form"
import { format } from "date-fns"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function MatchRecapPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const data = await getMatchRecapByToken(token)

  if (!data) return notFound()

  const { recap, booking, club, playerProfile, members } = data

  if (recap.player_user_id) {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 p-6">
          <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200/60 bg-white/90 p-8 shadow-sm space-y-4">
            <h1 className="text-2xl font-semibold text-slate-900">Bitte einloggen</h1>
            <p className="text-slate-600">
              Dieses Ergebnis gehört zu einem Mitglied. Bitte logge dich ein, um den Match-Recap zu
              bearbeiten.
            </p>
            <Link href={`/login?redirect=/match/recap/${token}`}>
              <Button className="rounded-full">Zum Login</Button>
            </Link>
          </div>
        </div>
      )
    }

    if (user.id !== recap.player_user_id) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 p-6">
          <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200/60 bg-white/90 p-8 shadow-sm space-y-4">
            <h1 className="text-2xl font-semibold text-slate-900">Kein Zugriff</h1>
            <p className="text-slate-600">
              Du bist eingeloggt, aber nicht berechtigt, diesen Match-Recap zu bearbeiten.
            </p>
            <Link href="/dashboard">
              <Button variant="outline" className="rounded-full">Zum Dashboard</Button>
            </Link>
          </div>
        </div>
      )
    }
  }

  const playerName =
    playerProfile?.first_name || playerProfile?.last_name
      ? `${playerProfile?.first_name || ""} ${playerProfile?.last_name || ""}`.trim()
      : recap.guest_name || "Spieler"

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 p-4 sm:p-6 safe-bottom">
      <div className="mx-auto max-w-6xl space-y-8">
        <MatchRecapForm
          token={token}
          clubName={club?.name || "Club"}
          clubLogo={club?.logo_url}
          clubColor={club?.primary_color}
          dateLabel={format(new Date(booking.start_time), "dd.MM.yyyy")}
          timeLabel={format(new Date(booking.start_time), "HH:mm")}
          initialPlayerName={playerName}
          initialOpponentName={recap.opponent_name}
          initialResult={recap.result_text}
          isMemberMode={!!recap.player_user_id}
          memberOptions={members}
        />
      </div>
    </div>
  )
}
