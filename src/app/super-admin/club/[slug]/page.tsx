import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FeatureMatrixForm } from "@/components/admin/feature-matrix-form"
import { mergeFeatures } from "@/lib/club-features"

export const dynamic = "force-dynamic"

export default async function SuperAdminClubPage({
  params,
}: {
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

  const features = mergeFeatures(club.feature_flags)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 p-6">
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm">
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
              <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight">Admin Spiegel</h1>
              <p className="text-slate-500">Feature-Matrix fur {club.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/super-admin">
              <Button variant="outline" className="rounded-full">Zuruck</Button>
            </Link>
            <Link href={`/club/${slug}/admin`} target="_blank">
              <Button variant="default" className="rounded-full">Admin Ansicht</Button>
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-6">
          <div className="rounded-2xl border border-slate-200/60 bg-white/80 shadow-sm overflow-hidden">
            <iframe
              title="Admin Vorschau"
              src={`/club/${slug}/admin`}
              className="w-full h-[85vh]"
            />
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                Feature Steuerung
              </div>
              <p className="text-xs text-slate-500">
                Aktiviere oder deaktiviere jedes einzelne Modul. Der Admin sieht die Aenderung sofort.
              </p>
            </div>
            <FeatureMatrixForm clubId={club.id} slug={club.slug} initialFeatures={features} />
          </div>
        </div>
      </div>
    </div>
  )
}
