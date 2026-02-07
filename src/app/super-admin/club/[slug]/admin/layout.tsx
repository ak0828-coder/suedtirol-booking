import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { SidebarNav } from "@/components/admin/sidebar-nav"

export const dynamic = "force-dynamic"

const navItems = [
  { href: "", label: "Ubersicht" },
  { href: "/bookings", label: "Buchungen" },
  { href: "/courts", label: "Platze" },
  { href: "/blocks", label: "Sperrzeiten" },
  { href: "/plans", label: "Abos" },
  { href: "/members", label: "Mitglieder" },
  { href: "/vouchers", label: "Gutscheine" },
  { href: "/settings", label: "Einstellungen" },
  { href: "/export", label: "Export" },
]


export default async function SuperAdminClubAdminLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL
  if (!SUPER_ADMIN_EMAIL || !user || user.email?.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
    return redirect("/login")
  }

  const { data: club } = await supabase
    .from("clubs")
    .select("id, name, slug, logo_url, primary_color, feature_flags")
    .eq("slug", slug)
    .single()

  if (!club) return notFound()

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm">
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
              <p className="text-slate-500">Verwaltung fur {club.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/super-admin">
              <Button variant="outline" className="rounded-full">Zuruck</Button>
            </Link>
            <Link href={`/club/${slug}/admin`} target="_blank">
              <Button variant="outline" className="gap-2 rounded-full">
                <ExternalLink className="w-4 h-4" /> Live Admin
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-[260px_minmax(0,1fr)] gap-6">
          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">Navigation</div>
              <SidebarNav
                slug={slug}
                items={navItems}
                accentColor={club.primary_color}
                basePath={`/super-admin/club/${slug}/admin`}
              />
            </div>
          </aside>

          <main className="space-y-6">{children}</main>
        </div>
      </div>
    </div>
  )
}
