"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AdminMobileNav({
  slug,
  lang,
  items,
  accentColor,
}: {
  slug: string
  lang: string
  items: { href: string; label: string; locked?: boolean }[]
  accentColor?: string | null
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="lg:hidden">
      <Button
        variant="outline"
        size="icon"
        className="rounded-full"
        onClick={() => setOpen(true)}
        aria-label="Navigation öffnen"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          {/* Drawer */}
          <div className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <span className="font-semibold text-slate-900">Navigation</span>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.locked ? "#" : `/${lang}/club/${slug}/admin${item.href}`}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                    item.locked
                      ? "text-slate-400 cursor-not-allowed"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>{item.label}</span>
                  {item.locked && (
                    <span className="ml-auto text-[10px] rounded-full bg-slate-100 px-2 py-0.5 text-slate-500">
                      Gesperrt
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  )
}
