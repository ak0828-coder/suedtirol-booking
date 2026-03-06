import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { notFound } from "next/navigation"
import { getAdminContext } from "../../_lib/get-admin-context"
import { getMemberDocumentAuditForAdmin, getMemberDocumentsForAdmin } from "@/app/actions"
import { MemberBookingsPanel } from "@/components/admin/member-bookings-panel"
import { AdminMemberQuickActions } from "@/components/admin/member-quick-actions"
import { MemberPaymentsPanel } from "@/components/admin/member-payments-panel"
import { MemberDocumentsAdmin } from "@/components/admin/member-documents-admin"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FeatureLockWrapper } from "@/components/admin/feature-lock-wrapper"

const memberDetailCopy = {
  de: {
    unknown: "Unbekannt",
    back: "Zurück",
    status: "Status",
    payment_status: "Zahlungsstatus",
    email: "E-Mail",
    next_payment: "Nächster Beitrag",
    valid_until: "Mitglied gültig bis",
    plan: "Mitgliedschaftsplan",
    active: "Aktiv",
    phone: "Telefon",
    cert_until: "Attest gültig bis",
    cert_missing: "Fehlt",
    contract_signed: "Vertrag unterschrieben",
    no: "Nein",
    contract_version: "Vertragsversion",
    credit: "Guthaben",
    invite: "Einladung",
    stripe_sub: "Stripe Abo",
    extra_fields: "Zusatzangaben",
    yes: "Ja",
  },
  en: {
    unknown: "Unknown",
    back: "Back",
    status: "Status",
    payment_status: "Payment status",
    email: "Email",
    next_payment: "Next payment",
    valid_until: "Member valid until",
    plan: "Membership plan",
    active: "Active",
    phone: "Phone",
    cert_until: "Certificate valid until",
    cert_missing: "Missing",
    contract_signed: "Contract signed",
    no: "No",
    contract_version: "Contract version",
    credit: "Credit balance",
    invite: "Invite status",
    stripe_sub: "Stripe subscription",
    extra_fields: "Additional fields",
    yes: "Yes",
  },
  it: {
    unknown: "Sconosciuto",
    back: "Indietro",
    status: "Stato",
    payment_status: "Stato pagamento",
    email: "Email",
    next_payment: "Prossimo pagamento",
    valid_until: "Iscritto fino al",
    plan: "Piano abbonamento",
    active: "Attivo",
    phone: "Telefono",
    cert_until: "Certificato valido fino al",
    cert_missing: "Mancante",
    contract_signed: "Contratto firmato",
    no: "No",
    contract_version: "Versione contratto",
    credit: "Saldo crediti",
    invite: "Stato invito",
    stripe_sub: "Abbonamento Stripe",
    extra_fields: "Campi aggiuntivi",
    yes: "Sì",
  },
}

export default async function AdminMemberDetailPage({
  params,
}: {
  params: Promise<{ slug: string; memberId: string; lang: string }>
}) {
  const { slug, memberId, lang } = await params
  const mc = memberDetailCopy[(lang as keyof typeof memberDetailCopy)] || memberDetailCopy.de
  const { club, features, locks } = await getAdminContext(slug)
  if (!features.admin.members && !locks.admin.members) return notFound()
  const lockedPage = !features.admin.members && locks.admin.members

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
    <FeatureLockWrapper locked={lockedPage} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-sm">
        <div>
          <h2 className="text-2xl font-semibold">
            {profile?.first_name} {profile?.last_name || mc.unknown}
          </h2>
          <div className="text-sm text-slate-500">{profile?.id}</div>
        </div>
        <Link href={`/${lang}/club/${slug}/admin/members`}>
          <Button variant="outline" className="rounded-full">{mc.back}</Button>
        </Link>
      </div>

      <div className="rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-sm space-y-2">
        <div className="text-sm text-slate-600">{mc.status}: {member.status}</div>
        <div className="text-sm text-slate-600">{mc.payment_status}: {member.payment_status || "-"}</div>
        <div className="text-sm text-slate-600">{mc.email}: {email}</div>
        <div className="text-sm text-slate-600">
          {mc.next_payment}:{" "}
          {member.next_payment_at ? new Date(member.next_payment_at).toLocaleDateString(lang === "it" ? "it-IT" : lang === "en" ? "en-US" : "de-DE") : "-"}
        </div>
        <div className="text-sm text-slate-600">
          {mc.valid_until}:{" "}
          {member.valid_until ? new Date(member.valid_until).toLocaleDateString(lang === "it" ? "it-IT" : lang === "en" ? "en-US" : "de-DE") : "-"}
        </div>
        <div className="text-sm text-slate-600">
          {mc.plan}: {plan?.name || mc.active}
        </div>
        <div className="text-sm text-slate-600">{mc.phone}: {profile?.phone || "-"}</div>
        <div className="text-sm text-slate-600">
          {mc.cert_until}:{" "}
          {member.medical_certificate_valid_until
            ? new Date(member.medical_certificate_valid_until).toLocaleDateString(lang === "it" ? "it-IT" : lang === "en" ? "en-US" : "de-DE")
            : mc.cert_missing}
        </div>
        <div className="text-sm text-slate-600">
          {mc.contract_signed}:{" "}
          {member.contract_signed_at ? new Date(member.contract_signed_at).toLocaleDateString(lang === "it" ? "it-IT" : lang === "en" ? "en-US" : "de-DE") : mc.no}
        </div>
        <div className="text-sm text-slate-600">
          {mc.contract_version}: {member.contract_version || "-"}
        </div>
        <div className="text-sm text-slate-600">
          {mc.credit}: {member.credit_balance ?? 0} EUR
        </div>
        <div className="text-sm text-slate-600">
          {mc.invite}: {member.invite_status || "-"}</div>
        <div className="text-sm text-slate-600">
          {mc.stripe_sub}: {member.stripe_subscription_id ? mc.active : "-"}
        </div>
        {extraFields.length > 0 ? (
          <div className="pt-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">{mc.extra_fields}</div>
            <div className="mt-2 space-y-1">
              {extraFields.map(([key, value]) => (
                <div key={key} className="text-sm text-slate-600">
                  {key}: {typeof value === "boolean" ? (value ? mc.yes : mc.no) : String(value || "-")}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {features.members.contract_editor || locks.members.contract_editor ? (
        <FeatureLockWrapper locked={!features.members.contract_editor && locks.members.contract_editor}>
          <AdminMemberQuickActions
            clubSlug={slug}
            memberId={member.id}
            isBlocked={member.status === "blocked"}
            memberEmail={email}
            contractAvailable={documents.some((d) => d.doc_type === "contract")}
          />
        </FeatureLockWrapper>
      ) : null}

      {features.admin.bookings || locks.admin.bookings ? (
        <FeatureLockWrapper locked={!features.admin.bookings && locks.admin.bookings}>
          <MemberBookingsPanel bookings={bookings || []} clubSlug={slug} memberId={member.id} />
        </FeatureLockWrapper>
      ) : null}

      {features.members.payments || locks.members.payments ? (
        <FeatureLockWrapper locked={!features.members.payments && locks.members.payments}>
          <MemberPaymentsPanel payments={paymentHistory} />
        </FeatureLockWrapper>
      ) : null}

      {features.members.documents || locks.members.documents ? (
        <FeatureLockWrapper locked={!features.members.documents && locks.members.documents}>
          <MemberDocumentsAdmin clubSlug={slug} documents={documents} audit={audit} />
        </FeatureLockWrapper>
      ) : null}
    </FeatureLockWrapper>
  )
}

