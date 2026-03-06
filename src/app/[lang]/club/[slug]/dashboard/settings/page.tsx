import { createClient } from "@/lib/supabase/server"
import { getAdminClient } from "@/lib/supabase/admin"
import { notFound } from "next/navigation"
import { MemberSettingsForm } from "@/components/member-settings-form"
import { ProfileForm } from "@/components/profile-form"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Settings, Trophy } from "lucide-react"
import { getDictionary } from "@/lib/dictionaries"
import { createTranslator } from "@/lib/translator"
import { getProfile } from "@/app/actions"
import { getReadableTextColor } from "@/lib/color"

export default async function MemberSettingsPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}) {
  const { slug, lang } = await params
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

  const adminClient = getAdminClient()
  const { data: member } = await adminClient
    .from("club_members")
    .select("leaderboard_opt_out, status")
    .eq("club_id", club.id)
    .eq("user_id", user.id)
    .single()

  if (!member) return notFound()

  const profile = await getProfile()
  const primary = club.primary_color || "#0f172a"
  const primaryFg = getReadableTextColor(primary)

  return (
    <div
      className="min-h-screen bg-[#f5f5f7] pb-24 safe-bottom page-enter"
      style={{ ["--club-primary" as any]: primary, ["--club-primary-foreground" as any]: primaryFg }}
    >
      <div className="mx-auto max-w-3xl space-y-6 app-pad pt-4 sm:pt-6">
        <header className="rounded-2xl border border-slate-200/60 bg-white/90 p-6 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{t("member_settings.title", "Einstellungen")}</h1>
            <p className="text-sm text-slate-500">{club.name}</p>
          </div>
          <Link href={`/${lang}/club/${slug}/dashboard`}>
            <Button variant="outline" className="rounded-full">{t("member_settings.back", "Zurück")}</Button>
          </Link>
        </header>

        <Card className="rounded-2xl border border-slate-200/60 bg-white/90 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 club-primary-text" />
              {t("member_settings.profile_title", "Persönliche Daten")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileForm profile={profile} />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-200/60 bg-white/90 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 club-primary-text" />
              {t("member_settings.leaderboard_title", "Rangliste")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MemberSettingsForm
              clubSlug={slug}
              initialOptOut={!!member.leaderboard_opt_out}
            />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-200/60 bg-white/90 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 club-primary-text" />
              {t("member_settings.account_title", "Account")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm text-slate-500">
                {t("member_settings.email_label", "E-Mail:")} <span className="font-medium text-slate-800">{user.email}</span>
              </div>
              <Link href={`/${lang}/change-password`}>
                <Button variant="outline" className="rounded-full">
                  {t("member_settings.change_password", "Passwort ändern")}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      <MobileBottomNav slug={slug} active="settings" />
    </div>
  )
}
