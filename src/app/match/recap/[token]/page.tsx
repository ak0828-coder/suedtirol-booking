import { getMatchRecapByToken } from "@/app/actions"
import { MatchRecapForm } from "@/components/match-recap-form"
import { format } from "date-fns"
import { notFound } from "next/navigation"

export default async function MatchRecapPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const data = await getMatchRecapByToken(token)

  if (!data) return notFound()

  const { recap, booking, club, playerProfile, members } = data

  const playerName =
    playerProfile?.first_name || playerProfile?.last_name
      ? `${playerProfile?.first_name || ""} ${playerProfile?.last_name || ""}`.trim()
      : recap.guest_name || "Spieler"

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 p-6">
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
