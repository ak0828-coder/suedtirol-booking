import { createClient } from "@/lib/supabase/server"
import { getAdminContext } from "../_lib/get-admin-context"
import { notFound } from "next/navigation"
import { FeatureLockWrapper } from "@/components/admin/feature-lock-wrapper"
import { TrainerManager } from "@/components/admin/trainer-manager"

export const dynamic = "force-dynamic"

export default async function AdminTrainersPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { club, features, locks } = await getAdminContext(slug)
  if (!features.admin.trainers && !locks.admin.trainers) return notFound()
  const locked = !features.admin.trainers && locks.admin.trainers

  const supabase = await createClient()
  const { data: trainers } = await supabase
    .from("trainers")
    .select("*")
    .eq("club_id", club.id)
    .order("last_name", { ascending: true })

  return (
    <FeatureLockWrapper locked={locked}>
      <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm mb-6">
        <h2 className="text-2xl md:text-3xl font-semibold">Trainer</h2>
        <p className="text-slate-500 text-sm">Trainerprofile, Preise und Auszahlungen.</p>
      </div>
      <TrainerManager clubSlug={slug} trainers={trainers || []} />
    </FeatureLockWrapper>
  )
}
