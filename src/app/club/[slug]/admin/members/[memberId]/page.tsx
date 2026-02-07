import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { notFound } from "next/navigation"
import { getAdminContext } from "../../_lib/get-admin-context"
import { getMemberDocumentAuditForAdmin, getMemberDocumentsForAdmin } from "@/app/actions"
import { MemberDocumentsAdmin } from "@/components/admin/member-documents-admin"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function AdminMemberDetailPage({
  params,
}: {
  params: Promise<{ slug: string; memberId: string }>
}) {
  const { slug, memberId } = await params
  const { club } = await getAdminContext(slug)

  const supabase = await createClient()
  const { data: member } = await supabase
    .from("club_members")
    .select("id, user_id, status, payment_status, next_payment_at, valid_until, contract_signed_at, contract_version, credit_balance, invite_status, import_email, stripe_subscription_id, plan_id, profiles:user_id(first_name, last_name, phone, id), medical_certificate_valid_until, membership_plans(name)")
    .eq("id", memberId)
    .eq("club_id", club.id)
    .maybeSingle()

  if (!member) return notFound()

  const profile = Array.isArray(member.profiles) ? member.profiles[0] : member.profiles

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(member.user_id)
  const email = authUser?.user?.email || member.import_email || "-"

  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, start_time, end_time, status, payment_status, price_paid, courts(name)")
    .eq("club_id", club.id)
    .eq("user_id", member.user_id)
    .order("start_time", { ascending: false })

  const paymentHistory = (bookings || []).filter((b: any) => (b.price_paid || 0) > 0)

  const documents = await getMemberDocumentsForAdmin(slug, member.user_id)
  const audit = await getMemberDocumentAuditForAdmin(slug, member.user_id)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm">
        <div>
          <h2 className="text-2xl font-semibold">
            {profile?.first_name} {profile?.last_name || "Unbekannt"}
          </h2>
          <div className="text-sm text-slate-500">{profile?.id}</div>
        </div>
        <Link href={`/club/${slug}/admin/members`}>
          <Button variant="outline" className="rounded-full">Zurück</Button>
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm space-y-2">
        <div className="text-sm text-slate-600">Status: {member.status}</div>
        <div className="text-sm text-slate-600">Zahlungsstatus: {member.payment_status || "unbekannt"}</div>
        <div className="text-sm text-slate-600">E-Mail: {email}</div>
        <div className="text-sm text-slate-600">
          Nächster Beitrag:{" "}
          {member.next_payment_at ? new Date(member.next_payment_at).toLocaleDateString("de-DE") : "-"}
        </div>
        <div className="text-sm text-slate-600">
          Mitglied gültig bis:{" "}
          {member.valid_until ? new Date(member.valid_until).toLocaleDateString("de-DE") : "-"}
        </div>
        <div className="text-sm text-slate-600">
          Mitgliedschaftsplan: {member.membership_plans?.name || "Aktiv"}
        </div>
        <div className="text-sm text-slate-600">Telefon: {profile?.phone || "-"}</div>
        <div className="text-sm text-slate-600">
          Attest gültig bis:{" "}
          {member.medical_certificate_valid_until
            ? new Date(member.medical_certificate_valid_until).toLocaleDateString("de-DE")
            : "Fehlt"}
        </div>
        <div className="text-sm text-slate-600">
          Vertrag unterschrieben:{" "}
          {member.contract_signed_at ? new Date(member.contract_signed_at).toLocaleDateString("de-DE") : "Nein"}
        </div>
        <div className="text-sm text-slate-600">
          Vertragsversion: {member.contract_version || "-"}
        </div>
        <div className="text-sm text-slate-600">
          Guthaben: {member.credit_balance ?? 0}€
        </div>
        <div className="text-sm text-slate-600">
          Einladung: {member.invite_status || "-"}
        </div>
        <div className="text-sm text-slate-600">
          Stripe Abo: {member.stripe_subscription_id ? "Aktiv" : "—"}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm space-y-3">
        <h3 className="text-sm font-semibold text-slate-800">Buchungsübersicht</h3>
        {bookings && bookings.length > 0 ? (
          <div className="max-h-72 overflow-auto space-y-2 pr-1">
            {bookings.map((b: any) => (
              <div key={b.id} className="rounded-xl border border-slate-200/60 bg-white/90 px-3 py-2 text-sm">
                <div className="font-medium text-slate-800">{b.courts?.name || "Platz"}</div>
                <div className="text-xs text-slate-500">
                  {new Date(b.start_time).toLocaleDateString("de-DE")} · {new Date(b.start_time).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} –{" "}
                  {new Date(b.end_time).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
                </div>
                <div className="text-xs text-slate-500">Status: {b.status} · Zahlung: {b.payment_status}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">Keine Buchungen vorhanden.</p>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm space-y-3">
        <h3 className="text-sm font-semibold text-slate-800">Zahlungsverlauf</h3>
        {paymentHistory.length > 0 ? (
          <div className="max-h-56 overflow-auto space-y-2 pr-1">
            {paymentHistory.map((p: any) => (
              <div key={p.id} className="rounded-xl border border-slate-200/60 bg-white/90 px-3 py-2 text-sm">
                <div className="font-medium text-slate-800">{p.courts?.name || "Platz"}</div>
                <div className="text-xs text-slate-500">
                  {new Date(p.start_time).toLocaleDateString("de-DE")} · {new Date(p.start_time).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
                </div>
                <div className="text-xs text-slate-500">Betrag: {p.price_paid}€ · Status: {p.payment_status}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">Keine Zahlungen erfasst.</p>
        )}
      </div>

      <MemberDocumentsAdmin clubSlug={slug} documents={documents} audit={audit} />
    </div>
  )
}
