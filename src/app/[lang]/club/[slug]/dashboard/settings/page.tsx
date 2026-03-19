"use client"

import { createClient } from "@/lib/supabase/client"
import { notFound, useParams } from "next/navigation"
import { MemberSettingsForm } from "@/components/member-settings-form"
import { ProfileForm } from "@/components/profile-form"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import Link from "next/link"
import { User, Settings, Trophy, AlertTriangle, ChevronLeft, ChevronRight, ShieldCheck, Mail, Lock, Loader2 } from "lucide-react"
import { useI18n } from "@/components/i18n/locale-provider"
import { DeleteAccountButton } from "@/components/dashboard/delete-account-button"
import { getReadableTextColor } from "@/lib/color"
import { useEffect, useState, useRef } from "react"
import { motion } from "motion/react"

// --- Reusable Premium Components ---

function SpotlightCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const divRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return
    const div = divRef.current
    const rect = div.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    div.style.setProperty("--mouse-x", `${x}px`)
    div.style.setProperty("--mouse-y", `${y}px`)
  }

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      className={`relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] group/spotlight ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover/spotlight:opacity-100"
        style={{
          background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(var(--primary-rgb), 0.15), transparent 40%)`,
        }}
      />
      {children}
    </div>
  )
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : "31, 61, 43"
}

export default function MemberSettingsPage() {
  const params = useParams()
  const slug = params?.slug as string
  const lang = params?.lang as string
  const { t } = useI18n()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: club } = await supabase.from("clubs").select("*").eq("slug", slug).single()
      if (!club) return

      const [{ data: member }, { data: profile }] = await Promise.all([
        supabase.from("club_members").select("leaderboard_opt_out, status").eq("club_id", club.id).eq("user_id", user.id).single(),
        supabase.from("profiles").select("*").eq("id", user.id).single()
      ])

      setData({ club, member, profile, user })
      setLoading(false)
    }
    load()
  }, [slug])

  if (loading) return (
    <div className="min-h-screen bg-[#030504] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
    </div>
  )

  const { club, member, profile, user } = data
  const primary = club.primary_color || "#1F3D2B"
  const primaryRGB = hexToRgb(primary)

  return (
    <div
      className="min-h-screen bg-[#030504] text-[#F9F8F4] selection:bg-[#CBBF9A] selection:text-[#030504] pb-32"
      style={{
        ["--club-primary" as any]: primary,
        ["--primary-rgb" as any]: primaryRGB,
      }}
    >
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#0A1410] via-[#030504] to-[#030504]" />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] rounded-full blur-[120px]"
          style={{ background: `rgba(${primaryRGB}, 0.2)` }}
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 py-4 bg-[#030504]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 flex items-center gap-4">
          <Link href={`/${lang}/club/${slug}/dashboard`} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors group">
            <ChevronLeft className="w-5 h-5 text-white/40 group-hover:text-white" />
          </Link>
          <div>
            <h1 className="text-xl font-black tracking-tight">{t("member_settings.title")}</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#CBBF9A]">{club.name}</p>
          </div>
        </div>
      </header>

      <main className="px-4 max-w-5xl mx-auto pt-8 space-y-6">
        <div className="grid md:grid-cols-2 gap-6 items-start">
          <div className="space-y-6">
            {/* Profile */}
            <SpotlightCard className="p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-[#CBBF9A]/10 border border-[#CBBF9A]/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-[#CBBF9A]" />
                </div>
                <h2 className="text-lg font-bold text-white">{t("member_settings.profile_title")}</h2>
              </div>
              <ProfileForm profile={profile} />
            </SpotlightCard>

            {/* Leaderboard */}
            <SpotlightCard className="p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-blue-400" />
                </div>
                <h2 className="text-lg font-bold text-white">{t("member_settings.leaderboard_title")}</h2>
              </div>
              <MemberSettingsForm clubSlug={slug} initialOptOut={!!member.leaderboard_opt_out} />
            </SpotlightCard>
          </div>

          <div className="space-y-6">
            {/* Account & Security */}
            <SpotlightCard className="p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-purple-400" />
                </div>
                <h2 className="text-lg font-bold text-white">{t("member_settings.account_title")}</h2>
              </div>
              
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-white/20" />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">{t("member_settings.email_label")}</p>
                        <p className="text-sm font-medium text-white/80">{user.email}</p>
                      </div>
                   </div>
                </div>

                <Link href={`/${lang}/change-password`} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
                   <div className="flex items-center gap-3">
                      <Lock className="w-4 h-4 text-white/20" />
                      <span className="text-sm font-bold text-white">{t("member_settings.change_password")}</span>
                   </div>
                   <ChevronRight className="w-4 h-4 text-white/20 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </SpotlightCard>

            {/* Danger Zone */}
            <SpotlightCard className="p-8 border-red-500/20 bg-red-500/5">
               <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                   <AlertTriangle className="w-5 h-5 text-red-500" />
                 </div>
                 <h2 className="text-lg font-bold text-red-500">Datenschutz & Account</h2>
               </div>
               <p className="text-sm text-red-500/60 mb-8 leading-relaxed">
                  Du hast das Recht, die Löschung aller deiner personenbezogenen Daten zu beantragen. 
                  Dieser Vorgang kann nicht rückgängig gemacht werden.
               </p>
               <DeleteAccountButton lang={lang} />
            </SpotlightCard>
          </div>
        </div>
      </main>
    </div>
  )
}
