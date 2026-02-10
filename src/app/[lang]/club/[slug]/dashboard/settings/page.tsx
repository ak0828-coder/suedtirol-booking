import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { MemberSettingsForm } from "@/components/member-settings-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getDictionary } from "@/lib/dictionaries"
import { createTranslator } from "@/lib/translator"

export default async function MemberSettingsPage({
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
    .select("id, name")
    .eq("slug", slug)
    .single()

  if (!club) return notFound()

  const { data: member } = await supabase
    .from("club_members")
    .select("leaderboard_opt_out, status")
    .eq("club_id", club.id)
    .eq("user_id", user.id)
    .single()

  if (!member || member.status !== "active") return notFound()

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 pb-20">
      <div className="mx-auto max-w-3xl space-y-6 p-6">
        <header className="rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">{t("member_settings.title", "Mitglied-Einstellungen")}</h1>
              <p className="text-sm text-slate-500">{t("member_settings.subtitle", "Dein Bereich bei")} {club.name}</p>
            </div>
            <Link href={`/${lang}/club/${slug}/dashboard`}>
              <Button variant="outline" className="rounded-full">{t("member_settings.back", "Zurück")}</Button>
            </Link>
          </div>
        </header>

        <MemberSettingsForm
          clubSlug={slug}
          initialOptOut={!!member.leaderboard_opt_out}
        />
      </div>
    </div>
  )
}
