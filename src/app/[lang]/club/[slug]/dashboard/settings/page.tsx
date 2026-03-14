import { createClient } from "@/lib/supabase/server"
import { getAdminClient } from "@/lib/supabase/admin"
import { notFound } from "next/navigation"
import { MemberSettingsForm } from "@/components/member-settings-form"
import { ProfileForm } from "@/components/profile-form"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import Link from "next/link"
import { User, Settings, Trophy, AlertTriangle, ChevronLeft } from "lucide-react"
import { getDictionary } from "@/lib/dictionaries"
import { createTranslator } from "@/lib/translator"
import { getProfile } from "@/app/actions"
import { DeleteAccountButton } from "@/components/dashboard/delete-account-button"
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
          background: `radial-gradient(ellipse 60% 100% at 50% 0%, color-mix(in srgb, ${primary} 10%, transparent) 0%, transparent 100%)`,
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
              {t("member_settings.title", "Einstellungen")}
            </h1>
            <p className="label-caps text-white/30 mt-0.5">{club.name}</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-xl mx-auto px-4 pt-5 space-y-4">
        {/* Profile card */}
        <div
          className="rounded-3xl overflow-hidden anim-fade-up"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div
            className="h-[2px]"
            style={{ background: `linear-gradient(90deg, ${primary}, transparent)` }}
          />
          <div className="p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{
                  background: `color-mix(in srgb, ${primary} 18%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${primary} 30%, transparent)`,
                }}
              >
                <User className="w-4 h-4" style={{ color: primary }} />
              </div>
              <span className="font-semibold text-white text-sm">
                {t("member_settings.profile_title", "Persönliche Daten")}
              </span>
            </div>
            <ProfileForm profile={profile} />
          </div>
        </div>

        {/* Leaderboard card */}
        <div
          className="rounded-3xl overflow-hidden anim-fade-up anim-stagger-1"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div
            className="h-[2px]"
            style={{ background: `linear-gradient(90deg, ${primary}, transparent)` }}
          />
          <div className="p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{
                  background: `color-mix(in srgb, ${primary} 18%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${primary} 30%, transparent)`,
                }}
              >
                <Trophy className="w-4 h-4" style={{ color: primary }} />
              </div>
              <span className="font-semibold text-white text-sm">
                {t("member_settings.leaderboard_title", "Rangliste")}
              </span>
            </div>
            <MemberSettingsForm
              clubSlug={slug}
              initialOptOut={!!member.leaderboard_opt_out}
            />
          </div>
        </div>

        {/* Account card */}
        <div
          className="rounded-3xl overflow-hidden anim-fade-up anim-stagger-2"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div
            className="h-[2px]"
            style={{ background: `linear-gradient(90deg, ${primary}, transparent)` }}
          />
          <div className="p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{
                  background: `color-mix(in srgb, ${primary} 18%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${primary} 30%, transparent)`,
                }}
              >
                <Settings className="w-4 h-4" style={{ color: primary }} />
              </div>
              <span className="font-semibold text-white text-sm">
                {t("member_settings.account_title", "Account")}
              </span>
            </div>
            <div className="space-y-4">
              <div>
                <p className="label-caps text-white/30 mb-1">
                  {t("member_settings.email_label", "E-Mail")}
                </p>
                <p className="text-sm font-medium text-white/80">{user.email}</p>
              </div>
              <Link
                href={`/${lang}/change-password`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium transition-colors"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                {t("member_settings.change_password", "Passwort ändern")}
              </Link>
            </div>
          </div>
        </div>

        {/* Danger zone card */}
        <div
          className="rounded-3xl overflow-hidden anim-fade-up anim-stagger-3"
          style={{
            background: "rgba(239,68,68,0.04)",
            border: "1px solid rgba(239,68,68,0.15)",
          }}
        >
          <div
            className="h-[2px]"
            style={{ background: "linear-gradient(90deg, rgba(239,68,68,0.6), transparent)" }}
          />
          <div className="p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="w-4 h-4 text-red-400" />
              </div>
              <span className="font-semibold text-red-400 text-sm">
                Datenschutz &amp; Account löschen
              </span>
            </div>
            <p className="text-sm text-white/35 mb-4 leading-relaxed">
              Du hast das Recht, die Löschung aller deiner personenbezogenen Daten zu beantragen (DSGVO Art. 17).
              Alle Mitgliedschaften und Buchungen werden dabei anonymisiert.
            </p>
            <DeleteAccountButton lang={lang} />
          </div>
        </div>
      </div>

      <MobileBottomNav slug={slug} active="settings" />
    </div>
  )
}
