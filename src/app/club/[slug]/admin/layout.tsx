import Link from "next/link"
import { LogOut, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SidebarNav } from "@/components/admin/sidebar-nav"
import { getAdminContext } from "./_lib/get-admin-context"

export const dynamic = "force-dynamic"

const navItems = [
  { href: "", label: "Übersicht" },
  { href: "/bookings", label: "Buchungen" },
  { href: "/courts", label: "Plätze" },
  { href: "/blocks", label: "Sperrzeiten" },
  { href: "/plans", label: "Abos" },
  { href: "/members", label: "Mitglieder" },
  { href: "/vouchers", label: "Gutscheine" },
  { href: "/settings", label: "Einstellungen" },
  { href: "/export", label: "Export" },
]

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { club, user, isSuperAdmin, hasAccess, features, locks } = await getAdminContext(slug)

  if (!hasAccess) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7]">
        <div className="text-center p-8 bg-white rounded-3xl shadow-lg border border-red-100 max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Zugriff verweigert</h1>
          <Link href="/login">
            <Button variant="default">Zum Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  const nav = [
    { href: "", label: "Übersicht", enabled: features.admin.overview, locked: locks.admin.overview },
    { href: "/bookings", label: "Buchungen", enabled: features.admin.bookings, locked: locks.admin.bookings },
    { href: "/courts", label: "Plätze", enabled: features.admin.courts, locked: locks.admin.courts },
    { href: "/blocks", label: "Sperrzeiten", enabled: features.admin.blocks, locked: locks.admin.blocks },
    { href: "/plans", label: "Abos", enabled: features.admin.plans, locked: locks.admin.plans },
    { href: "/members", label: "Mitglieder", enabled: features.admin.members, locked: locks.admin.members },
    { href: "/trainers", label: "Trainer", enabled: features.admin.trainers, locked: locks.admin.trainers },
    { href: "/courses", label: "Kurse", enabled: features.admin.courses, locked: locks.admin.courses },
    { href: "/finance", label: "Finanzen", enabled: features.admin.finance, locked: locks.admin.finance },
    { href: "/vouchers", label: "Gutscheine", enabled: features.admin.vouchers, locked: locks.admin.vouchers },
    { href: "/settings", label: "Einstellungen", enabled: features.admin.settings, locked: locks.admin.settings },
    { href: "/export", label: "Export", enabled: features.admin.export, locked: locks.admin.export },
  ]

  const filtered = nav
    .filter((item) => item.enabled || item.locked)
    .map((item) => ({
      href: item.href,
      label: item.label,
      locked: !item.enabled && item.locked,
    }))

  return (
    <div className="min-h-screen bg-[#f5f5f7] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center text-white font-bold shadow-sm overflow-hidden border border-slate-200"
              style={{ backgroundColor: club.primary_color || "#0f172a" }}
            >
              {club.logo_url ? (
                <img src={club.logo_url} alt={club.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl">{club.name.substring(0, 2).toUpperCase()}</span>
              )}
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight">
                Admin Dashboard
              </h1>
              <p className="text-slate-500">Verwaltung für {club.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href={`/club/${slug}`} target="_blank">
              <Button variant="outline" className="gap-2 rounded-full">
                <ExternalLink className="w-4 h-4" /> Vorschau
              </Button>
            </Link>

            <Link href="/login">
              <Button variant="ghost" size="icon" title="Abmelden" className="rounded-full">
                <LogOut className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-[260px_minmax(0,1fr)] gap-6">
          <aside className="space-y-4">
            <div className="rounded-3xl border border-slate-200/60 bg-white/80 p-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
                Navigation
              </div>
              <SidebarNav slug={slug} items={filtered} accentColor={club.primary_color} />
            </div>
          </aside>

          <main className="space-y-6">{children}</main>
        </div>
      </div>
    </div>
  )
}
