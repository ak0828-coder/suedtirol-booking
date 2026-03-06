"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useI18n } from "@/components/i18n/locale-provider"
import { LayoutDashboard, FileText, Trophy, CalendarPlus, Settings, Dumbbell, Home } from "lucide-react"

type MobileBottomNavProps = {
  slug: string
  active: "home" | "dashboard" | "documents" | "leaderboard" | "book" | "settings" | "training"
}

export function MobileBottomNav({ slug, active }: MobileBottomNavProps) {
  const params = useParams()
  const lang = typeof params?.lang === "string" ? params.lang : "de"
  const { t } = useI18n()
  const items = [
    { id: "home", label: t("club.nav.club", "Club"), href: `/${lang}/club/${slug}`, icon: Home },
    { id: "dashboard", label: t("club.nav.dashboard", "Home"), href: `/${lang}/club/${slug}/dashboard`, icon: LayoutDashboard },
    { id: "book", label: t("club.nav.book", "Buchen"), href: `/${lang}/club/${slug}/dashboard/book`, icon: CalendarPlus },
    { id: "training", label: t("club.nav.training", "Training"), href: `/${lang}/club/${slug}/dashboard/training`, icon: Dumbbell },
    { id: "documents", label: t("club.nav.documents", "Docs"), href: `/${lang}/club/${slug}/dashboard/documents`, icon: FileText },
    { id: "leaderboard", label: t("club.nav.leaderboard", "Ranking"), href: `/${lang}/club/${slug}/dashboard/leaderboard`, icon: Trophy },
    { id: "settings", label: t("club.nav.settings", "Profil"), href: `/${lang}/club/${slug}/dashboard/settings`, icon: Settings },
  ] as const

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/70 bg-white/90 backdrop-blur safe-bottom">
      <nav className="grid grid-cols-7 gap-0 px-0.5 py-1.5">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = active === item.id
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 rounded-lg px-0.5 py-1.5 text-[9px] ${
                isActive ? "text-slate-900" : "text-slate-500"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className={`h-[18px] w-[18px] ${isActive ? "club-primary-text" : "text-slate-400"}`} />
              <span className="truncate max-w-full leading-tight">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
