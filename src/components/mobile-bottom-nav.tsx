"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useI18n } from "@/components/i18n/locale-provider"
import { LayoutDashboard, CalendarPlus, Globe, Dumbbell, User } from "lucide-react"

type MobileBottomNavProps = {
  slug: string
  active: "home" | "dashboard" | "book" | "training" | "settings" | "documents" | "leaderboard"
}

export function MobileBottomNav({ slug, active }: MobileBottomNavProps) {
  const params = useParams()
  const lang = typeof params?.lang === "string" ? params.lang : "de"
  const { t } = useI18n()

  const items = [
    { id: "dashboard", label: t("club.nav.dashboard", "Home"), href: `/${lang}/club/${slug}/dashboard`, icon: LayoutDashboard },
    { id: "book", label: t("club.nav.book", "Buchen"), href: `/${lang}/club/${slug}/dashboard/book`, icon: CalendarPlus },
    { id: "home", label: t("club.nav.club", "Club"), href: `/${lang}/club/${slug}`, icon: Globe },
    { id: "training", label: t("club.nav.training", "Training"), href: `/${lang}/club/${slug}/dashboard/training`, icon: Dumbbell },
    { id: "settings", label: t("club.nav.settings", "Profil"), href: `/${lang}/club/${slug}/dashboard/settings`, icon: User },
  ] as const

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-100 bg-white/95 backdrop-blur-md safe-bottom">
      <nav className="grid grid-cols-5 px-2 py-1">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = active === item.id
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 py-2 rounded-xl text-[11px] font-medium transition-colors ${
                isActive ? "club-primary-text" : "text-slate-400"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className={`h-5 w-5 ${isActive ? "club-primary-text" : "text-slate-400"}`} strokeWidth={isActive ? 2.2 : 1.8} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
