"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

type NavItem = { href: string; label: string }

export function SidebarNav({
  slug,
  items,
  accentColor,
}: {
  slug: string
  items: NavItem[]
  accentColor?: string | null
}) {
  const pathname = usePathname()
  const base = `/club/${slug}/admin`

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
                : "border-transparent text-slate-700 hover:bg-slate-50 hover:border-slate-200/60 hover:-translate-y-[1px] hover:shadow-sm"
            )}
            style={isActive ? { color: accent } : undefined}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
