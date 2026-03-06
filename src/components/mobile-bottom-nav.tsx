"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useI18n } from "@/components/i18n/locale-provider"
import { Home, LayoutDashboard, FileText, Trophy, CalendarPlus, Settings } from "lucide-react"

type MobileBottomNavProps = {
  slug: string
  active: "home" | "dashboard" | "documents" | "leaderboard" | "book" | "settings"
}

export function MobileBottomNav({ slug, active }: MobileBottomNavProps) {
  const params = useParams()
  const lang = typeof params?.lang === "string" ? params.lang : "de"
  const { t } = useI18n()
  const items = [
    { id: "home", label: t("club.nav.club", "Club"), href: `/${lang}/club/${slug}`, icon: Home },
    { id: "dashboard", label: t("club.nav.dashboard", "Home"), href: `/${lang}/club/${slug}/dashboard`, icon: LayoutDashboard },
    { id: "book", label: t("club.nav.book", "Buchen"), href: `/${lang}/club/${slug}/dashboard/book`, icon: CalendarPlus },
    { id: "documents", label: t("club.nav.documents", "Dokumente"), href: `/${lang}/club/${slug}/dashboard/documents`, icon: FileText },
    { id: "leaderboard", label: t("club.nav.leaderboard", "Ranking"), href: `/${lang}/club/${slug}/dashboard/leaderboard`, icon: Trophy },
    { id: "settings", label: t("club.nav.settings", "Settings"), href: `/${lang}/club/${slug}/dashboard/settings`, icon: Settings },
  ] as const

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/70 bg-white/90 backdrop-blur safe-bottom">
      <nav className="grid grid-cols-6 gap-0.5 px-1 py-2">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = active === item.id
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-2 text-[10px] ${
                isActive ? "text-slate-900" : "text-slate-500"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className={`h-5 w-5 ${isActive ? "club-primary-text" : "text-slate-400"}`} />
              <span className="truncate max-w-full">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
