"use client"

import Link from "next/link"
import { usePathname, useParams } from "next/navigation"
import { ExternalLink, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SidebarNav } from "@/components/admin/sidebar-nav"

const demoClub = {
  name: "TC Bergblick",
  primary_color: "#1F3D2B",
}

const adminNavItems = [
  { href: "", label: "Übersicht" },
  { href: "/bookings", label: "Buchungen" },
  { href: "/courts", label: "Plätze" },
  { href: "/blocks", label: "Sperrzeiten" },
  { href: "/plans", label: "Abos" },
  { href: "/members", label: "Mitglieder" },
  { href: "/trainers", label: "Trainer" },
  { href: "/courses", label: "Kurse" },
  { href: "/finance", label: "Finanzen" },
  { href: "/vouchers", label: "Gutscheine" },
  { href: "/settings", label: "Einstellungen" },
  { href: "/export", label: "Export" },
]

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const params = useParams()
  const lang = typeof params?.lang === "string" ? params.lang : "de"
  const basePath = `/${lang}/demo`

  const isMemberView = pathname.endsWith("/member")

  const demoBanner = (
    <div className="bg-[#0E1A14] text-[#F9F8F4] text-xs py-2.5 px-4 flex items-center justify-between sticky top-0 z-50 border-b border-white/10">
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-[#CBBF9A] animate-pulse" />
        <span className="font-medium">Demo Modus · TC Bergblick</span>
      </div>
      <div className="flex items-center gap-1 text-[#F9F8F4]/70">
        <Link
          href={basePath}
          className={`px-2.5 py-1 rounded-full transition-colors ${
            !isMemberView
              ? "bg-white/15 text-[#F9F8F4] font-medium"
              : "hover:bg-white/10 hover:text-[#F9F8F4]"
          }`}
        >
          Admin
        </Link>
        <Link
          href={`${basePath}/member`}
          className={`px-2.5 py-1 rounded-full transition-colors ${
            isMemberView
              ? "bg-white/15 text-[#F9F8F4] font-medium"
              : "hover:bg-white/10 hover:text-[#F9F8F4]"
          }`}
        >
          Mitglied
        </Link>
        <span className="mx-1 opacity-20">|</span>
        <Link
          href={`/${lang}`}
          className="flex items-center gap-1 hover:text-[#F9F8F4] transition-colors hover:bg-white/10 px-2.5 py-1 rounded-full"
        >
          <ExternalLink className="h-3 w-3" /> Website
        </Link>
      </div>
    </div>
  )

  if (isMemberView) {
    return (
      <div className="min-h-screen bg-[#f5f5f7]">
        {demoBanner}
        {children}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {demoBanner}
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Admin header – identical to real admin */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center text-white font-bold shadow-sm overflow-hidden border border-slate-200"
                style={{ backgroundColor: demoClub.primary_color }}
              >
                <span className="text-xl">TC</span>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight">
                  Admin Dashboard
                </h1>
                <p className="text-slate-500">Verwaltung für {demoClub.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="gap-2 rounded-full" disabled>
                <ExternalLink className="w-4 h-4" /> Vorschau
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full" disabled title="Abmelden">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Sidebar + content grid */}
          <div className="grid lg:grid-cols-[260px_minmax(0,1fr)] gap-6">
            <aside>
              <div className="rounded-3xl border border-slate-200/60 bg-white/80 p-4 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
                  Navigation
                </div>
                <SidebarNav
                  slug="demo"
                  items={adminNavItems}
                  accentColor={demoClub.primary_color}
                  basePath={basePath}
                />
              </div>
            </aside>
            <main className="space-y-6">{children}</main>
          </div>
        </div>
      </div>
    </div>
  )
}
