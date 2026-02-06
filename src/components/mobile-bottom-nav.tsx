"use client"

import Link from "next/link"
import { Home, LayoutDashboard, FileText, Trophy } from "lucide-react"

type MobileBottomNavProps = {
  slug: string
  active: "home" | "dashboard" | "documents" | "leaderboard"
}

export function MobileBottomNav({ slug, active }: MobileBottomNavProps) {
  const items = [
    { id: "home", label: "Club", href: `/club/${slug}`, icon: Home },
    { id: "dashboard", label: "Dashboard", href: `/club/${slug}/dashboard`, icon: LayoutDashboard },
    { id: "documents", label: "Dokumente", href: `/club/${slug}/dashboard/documents`, icon: FileText },
    { id: "leaderboard", label: "Ranking", href: `/club/${slug}/dashboard/leaderboard`, icon: Trophy },
  ] as const

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/70 bg-white/90 backdrop-blur safe-bottom">
      <nav className="grid grid-cols-4 gap-1 px-2 py-2">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = active === item.id
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[11px] ${
                isActive ? "text-slate-900" : "text-slate-500"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className={`h-5 w-5 ${isActive ? "text-slate-900" : "text-slate-400"}`} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
