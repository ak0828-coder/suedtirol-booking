import { getMatchRecapByToken } from "@/app/actions"
import { MatchRecapForm } from "@/components/match-recap-form"
import { format } from "date-fns"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getReadableTextColor } from "@/lib/color"

const recapCopy = {
  de: {
    login_title: "Bitte einloggen",
    login_desc: "Dieses Ergebnis gehört zu einem Mitglied. Bitte logge dich ein, um den Match-Recap zu bearbeiten.",
    login_btn: "Zum Login",
    no_access_title: "Kein Zugriff",
    no_access_desc: "Du bist eingeloggt, aber nicht berechtigt, diesen Match-Recap zu bearbeiten.",
    dashboard_btn: "Zum Dashboard",
    player_fallback: "Spieler",
  },
  en: {
    login_title: "Please sign in",
    login_desc: "This result belongs to a member. Please sign in to edit the match recap.",
    login_btn: "Sign in",
    no_access_title: "No access",
    no_access_desc: "You are signed in but not authorised to edit this match recap.",
    dashboard_btn: "Go to dashboard",
    player_fallback: "Player",
  },
  it: {
    login_title: "Accedi",
    login_desc: "Questo risultato appartiene a un socio. Accedi per modificare il match recap.",
    login_btn: "Accedi",
    no_access_title: "Accesso negato",
    no_access_desc: "Sei connesso ma non sei autorizzato a modificare questo match recap.",
    dashboard_btn: "Vai alla dashboard",
    player_fallback: "Giocatore",
  },
}

export default async function MatchRecapPage({
  params,
}: {
  params: Promise<{ token: string; lang: string }>
}) {
  const { token, lang: langRaw } = await params
  const lang = langRaw === "en" ? "en" : langRaw === "it" ? "it" : "de"
  const rc = recapCopy[lang as keyof typeof recapCopy]
  const data = await getMatchRecapByToken(token)

  if (!data) return notFound()

  const { recap, booking, club, playerProfile, members } = data

  const primary = club?.primary_color || "#0f172a"
  const primaryFg = getReadableTextColor(primary)

  if (recap.player_user_id) {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 p-6">
          <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200/60 bg-white/90 p-8 shadow-sm space-y-4">
            <h1 className="text-2xl font-semibold text-slate-900">{rc.login_title}</h1>
            <p className="text-slate-600">{rc.login_desc}</p>
            <Link href={`/${lang}/login?redirect=/${lang}/match/recap/${token}`}>
              <Button className="rounded-full">{rc.login_btn}</Button>
            </Link>
          </div>
        </div>
      )
    }

    if (user.id !== recap.player_user_id) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 p-6">
          <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200/60 bg-white/90 p-8 shadow-sm space-y-4">
            <h1 className="text-2xl font-semibold text-slate-900">{rc.no_access_title}</h1>
            <p className="text-slate-600">{rc.no_access_desc}</p>
            <Link href={`/${lang}`}>
              <Button variant="outline" className="rounded-full">{rc.dashboard_btn}</Button>
            </Link>
          </div>
        </div>
      )
    }
  }

  const playerName =
    playerProfile?.first_name || playerProfile?.last_name
      ? `${playerProfile?.first_name || ""} ${playerProfile?.last_name || ""}`.trim()
      : recap.guest_name || rc.player_fallback
  const memberOptions =
    (members || []).map((m: any) => ({
      id: m.id,
      label: m.name || `${m.first_name || ""} ${m.last_name || ""}`.trim(),
    })) || []

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 p-4 sm:p-6 safe-bottom page-enter"
      style={{ ["--club-primary" as any]: primary, ["--club-primary-foreground" as any]: primaryFg }}
    >
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
          memberOptions={memberOptions}
        />
      </div>
    </div>
  )
}
