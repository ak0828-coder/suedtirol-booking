import { createClient } from "@/lib/supabase/server"
import { getAdminContext } from "../_lib/get-admin-context"
import { notFound } from "next/navigation"
import { FeatureLockWrapper } from "@/components/admin/feature-lock-wrapper"
import { TrainerManager } from "@/components/admin/trainer-manager"
import { confirmTrainerBooking, rejectTrainerBooking } from "@/app/actions"

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

  const { data: pendingBookings } = await supabase
    .from("bookings")
    .select("id, start_time, end_time, guest_name, trainer_id, trainers(first_name, last_name)")
    .eq("club_id", club.id)
    .eq("booking_type", "trainer")
    .eq("status", "pending_trainer")
    .order("start_time", { ascending: true })

  return (
    <FeatureLockWrapper locked={locked}>
      <div className="rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-sm mb-6">
        <h2 className="text-2xl md:text-3xl font-semibold">Trainer</h2>
        <p className="text-slate-500 text-sm">Trainerprofile, Preise und Auszahlungen.</p>
      </div>

      <div className="rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-sm mb-6">
        <h3 className="text-lg font-semibold text-slate-900">Offene Traineranfragen</h3>
        <div className="mt-3 space-y-2">
          {(pendingBookings || []).map((b: any) => (
            <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/60 bg-white p-4">
              <div>
                <div className="font-medium text-slate-900">
                  {b.trainers ? `${b.trainers.first_name} ${b.trainers.last_name}` : "Trainer"}
                </div>
                <div className="text-xs text-slate-500">
                  {new Date(b.start_time).toLocaleDateString("de-DE")} - {new Date(b.start_time).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} - {new Date(b.end_time).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
                </div>
                <div className="text-xs text-slate-500">Kunde: {b.guest_name || "Mitglied"}</div>
              </div>
              <div className="flex items-center gap-2">
                <form action={confirmTrainerBooking}>
                  <input type="hidden" name="bookingId" value={b.id} />
                  <button className="rounded-full border border-slate-200 px-3 py-1 text-xs">Bestätigen</button>
                </form>
                <form action={rejectTrainerBooking}>
                  <input type="hidden" name="bookingId" value={b.id} />
                  <button className="rounded-full border border-slate-200 px-3 py-1 text-xs text-rose-600">Ablehnen</button>
                </form>
              </div>
            </div>
          ))}
          {(pendingBookings || []).length === 0 ? (
            <div className="text-sm text-slate-500">Keine offenen Anfragen.</div>
          ) : null}
        </div>
      </div>

      <TrainerManager clubSlug={slug} trainers={trainers || []} />
    </FeatureLockWrapper>
  )
}


