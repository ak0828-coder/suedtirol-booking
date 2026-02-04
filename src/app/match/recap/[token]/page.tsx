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

  const { recap, booking, club } = data

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
          initialPlayerName={recap.guest_name || "Spieler"}
          initialOpponentName={recap.opponent_name}
          initialResult={recap.result_text}
        />
      </div>
    </div>
  )
}
