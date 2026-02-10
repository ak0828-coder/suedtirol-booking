import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { getAdminContext } from "@/app/[lang]/club/[slug]/admin/_lib/get-admin-context"
import { getMemberDocumentAuditForAdmin, getMemberDocumentsForAdmin } from "@/app/actions"
import { MemberBookingsPanel } from "@/components/admin/member-bookings-panel"
import { AdminMemberQuickActions } from "@/components/admin/member-quick-actions"
import { MemberPaymentsPanel } from "@/components/admin/member-payments-panel"
import { MemberDocumentsAdmin } from "@/components/admin/member-documents-admin"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { notFound } from "next/navigation"
import { FeatureGateToggle } from "@/components/admin/feature-gate-toggle"

export default async function SuperAdminMemberDetailPage({
  params,
}: {
  params: Promise<{ slug: string; memberId: string }>
}) {
  const { slug, memberId } = await params
  const { club, features, locks } = await getAdminContext(slug)

  const supabase = await createClient()
  const { data: member } = await supabase
    .from("club_members")
    .select("id, user_id, status, payment_status, next_payment_at, valid_until, contract_signed_at, contract_version, credit_balance, invite_status, import_email, stripe_subscription_id, plan_id, extra_fields, profiles:user_id(first_name, last_name, phone, id), medical_certificate_valid_until, membership_plans(name)")
    .eq("id", memberId)
    .eq("club_id", club.id)
    .maybeSingle()

  if (!member) return notFound()

  const profile = Array.isArray(member.profiles) ? member.profiles[0] : member.profiles
  const plan = Array.isArray(member.membership_plans) ? member.membership_plans[0] : member.membership_plans
  const extraFields =
    member.extra_fields && typeof member.extra_fields === "object"
      ? Object.entries(member.extra_fields)
      : []

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
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-sm">
        <div>
          <h2 className="text-2xl font-semibold">
            {profile?.first_name} {profile?.last_name || "Unbekannt"}
          </h2>
          <div className="text-sm text-slate-500">{profile?.id}</div>
        </div>
        <Link href={`/super-admin/club/${slug}/admin/members`}>
          <Button variant="outline" className="rounded-full">Zurück</Button>
        </Link>
      </div>

      <div className="rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-sm space-y-2">
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
        <div className="text-sm text-slate-600">Mitgliedschaftsplan: {plan?.name || "Aktiv"}</div>
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
        <div className="text-sm text-slate-600">Vertragsversion: {member.contract_version || "-"}</div>
        <div className="text-sm text-slate-600">Guthaben: {member.credit_balance ?? 0} EUR</div>
        <div className="text-sm text-slate-600">Einladung: {member.invite_status || "-"}</div>
        <div className="text-sm text-slate-600">Stripe Abo: {member.stripe_subscription_id ? "Aktiv" : "-"}</div>
        {extraFields.length > 0 ? (
          <div className="pt-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Zusatzangaben</div>
            <div className="mt-2 space-y-1">
              {extraFields.map(([key, value]) => (
                <div key={key} className="text-sm text-slate-600">
                  {key}: {typeof value === "boolean" ? (value ? "Ja" : "Nein") : String(value || "-")}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <AdminMemberQuickActions
        clubSlug={slug}
        memberId={member.id}
        memberEmail={email}
        contractAvailable={documents.some((d) => d.doc_type === "contract")}
      />

      <MemberBookingsPanel bookings={bookings || []} clubSlug={slug} memberId={member.id} />

      <div className="relative">
        <div className="absolute right-4 top-4 z-10">
          <FeatureGateToggle
            clubId={club.id}
            slug={slug}
            path={["members", "payments"]}
            lockPath={["locks", "members", "payments"]}
            label="Zahlungen"
            enabled={features.members.payments}
            locked={locks.members.payments}
          />
        </div>
        <MemberPaymentsPanel payments={paymentHistory} />
      </div>

      <div className="relative">
        <div className="absolute right-4 top-4 z-10">
          <FeatureGateToggle
            clubId={club.id}
            slug={slug}
            path={["members", "documents"]}
            lockPath={["locks", "members", "documents"]}
            label="Dokumente"
            enabled={features.members.documents}
            locked={locks.members.documents}
          />
        </div>
        <MemberDocumentsAdmin clubSlug={slug} documents={documents} audit={audit} />
      </div>
    </div>
  )
}


