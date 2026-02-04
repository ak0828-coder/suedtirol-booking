"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

type NavItem = { href: string; label: string }

export function SidebarNav({
  slug,
  items,
}: {
  slug: string
  items: NavItem[]
}) {
  const pathname = usePathname()
  const base = `/club/${slug}/admin`

  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const href = `${base}${item.href}`
        const isActive = pathname === href

        return (
          <Link
            key={item.label}
            href={href}
            className={cn(
              "relative block rounded-xl border px-3 py-2 text-sm transition-colors",
              isActive
                ? "border-slate-200 bg-slate-100 text-slate-900 font-medium"
                : "border-transparent text-slate-700 hover:bg-slate-50 hover:border-slate-200/60"
            )}
          >
            {isActive && (
              <span
                className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-full bg-slate-900"
                aria-hidden="true"
              />
            )}
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
