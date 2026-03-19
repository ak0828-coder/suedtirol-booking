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
    <div
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div
        className="mx-3 mb-3 sm:mx-auto sm:max-w-lg glass-strong rounded-3xl overflow-hidden"
        style={{
          boxShadow: "0 8px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)",
        }}
      >
        <nav className="grid grid-cols-5 px-1 py-1.5">
          {items.map((item) => {
            const Icon = item.icon
            const isActive = active === item.id
            return (
              <Link
                key={item.id}
                href={item.href}
                className="flex flex-col items-center justify-center gap-1 py-2.5 min-h-[52px] rounded-2xl relative transition-all duration-200 active:scale-95"
                style={
                  isActive
                    ? { background: "color-mix(in srgb, var(--club-primary) 16%, transparent)" }
                    : {}
                }
                aria-current={isActive ? "page" : undefined}
              >
                {isActive && (
                  <div
                    className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ backgroundColor: "var(--club-primary)" }}
                  />
                )}
                <Icon
                  className="h-5 w-5 transition-colors"
                  style={{
                    color: isActive ? "var(--club-primary)" : "rgba(255,255,255,0.32)",
                  }}
                  strokeWidth={isActive ? 2.2 : 1.6}
                />
                <span
                  className="text-[10px] font-medium tracking-wide transition-colors"
                  style={{
                    color: isActive ? "var(--club-primary)" : "rgba(255,255,255,0.28)",
                  }}
                >
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
