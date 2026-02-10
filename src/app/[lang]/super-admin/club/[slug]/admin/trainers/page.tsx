import { createClient } from "@/lib/supabase/server"
import { getAdminContext } from "@/app/[lang]/club/[slug]/admin/_lib/get-admin-context"
import { FeatureGateToggle } from "@/components/admin/feature-gate-toggle"
import { TrainerManager } from "@/components/admin/trainer-manager"

export const dynamic = "force-dynamic"

export default async function SuperAdminTrainersPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { club, features, locks } = await getAdminContext(slug)
  const supabase = await createClient()
  const { data: trainers } = await supabase
    .from("trainers")
    .select("*")
    .eq("club_id", club.id)
    .order("last_name", { ascending: true })

  return (
    <>
      <div className="rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold">Trainer</h2>
            <p className="text-slate-500 text-sm">Trainerprofile, Preise und Auszahlungen.</p>
          </div>
          <FeatureGateToggle
            clubId={club.id}
            slug={slug}
            path={["admin", "trainers"]}
            lockPath={["locks", "admin", "trainers"]}
            label="Tab aktiv"
            enabled={features.admin.trainers}
            locked={locks.admin.trainers}
          />
        </div>
      </div>

      <TrainerManager clubSlug={slug} trainers={trainers || []} />
    </>
  )
}

