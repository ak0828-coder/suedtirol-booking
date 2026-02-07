"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Lock } from "lucide-react"

type NavItem = { href: string; label: string; locked?: boolean }

export function SidebarNav({
  slug,
  items,
  accentColor,
  basePath,
}: {
  slug: string
  items: NavItem[]
  accentColor?: string | null
  basePath?: string
}) {
  const pathname = usePathname()
  const base = basePath || `/club/${slug}/admin`

  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const href = `${base}${item.href}`
        const isActive = pathname === href
        const accent = accentColor || "#0f172a"

        return (
          <Link
            key={item.label}
            href={href}
            className={cn(
              "relative block rounded-xl border px-3 py-2 text-sm transition-all duration-150",
              isActive
                ? "border-slate-200 bg-slate-100 font-medium shadow-[inset_0_0_0_1px_rgba(15,23,42,0.04)]"
                : "border-transparent text-slate-700 hover:bg-slate-50 hover:border-slate-200/60 hover:-translate-y-[1px] hover:shadow-sm",
              item.locked ? "opacity-70" : null
            )}
            style={isActive ? { color: accent } : undefined}
            aria-disabled={item.locked ? true : undefined}
          >
            <span className="flex items-center justify-between gap-2">
              <span>{item.label}</span>
              {item.locked ? <Lock className="h-3.5 w-3.5 text-slate-400" /> : null}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
