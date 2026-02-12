import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ensureMembershipFromCheckoutSession, getMembershipContractForMember, getMyDocuments } from "@/app/actions"
import { MemberOnboardingForm } from "@/components/member/onboarding-form"
import { MemberDocumentsForm } from "@/components/member-documents-form"

export default async function MemberOnboardingPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; slug: string }>
  searchParams?: Promise<{ post_payment?: string; session_id?: string }>
}) {
  const { slug, lang } = await params
  const { post_payment, session_id } = (await searchParams) || {}
  const isPostPayment = post_payment === "1"
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user && session_id) {
    await ensureMembershipFromCheckoutSession(session_id)
  }

  let contract = user ? await getMembershipContractForMember(slug) : null
  if (!contract) {
    const { data: fallback } = await supabase
      .from("clubs")
      .select(
        "membership_contract_title, membership_contract_body, membership_contract_version, membership_contract_fields, membership_fee, membership_fee_enabled, membership_allow_subscription"
      )
      .eq("slug", slug)
      .single()
    if (fallback) {
      contract = {
        title: fallback.membership_contract_title || "Mitgliedschaft",
        body: fallback.membership_contract_body || "",
        version: fallback.membership_contract_version || 1,
        membership_contract_fields: fallback.membership_contract_fields || [],
        membership_fee: fallback.membership_fee || 0,
        membership_fee_enabled: fallback.membership_fee_enabled ?? true,
        membership_allow_subscription: fallback.membership_allow_subscription ?? true,
      } as any
    }
  }

  const { data: club } = await supabase
    .from("clubs")
    .select("id, name, logo_url")
    .eq("slug", slug)
    .single()
  if (!club) return notFound()

  if (!user && isPostPayment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">Bitte einloggen</h1>
          <p className="mt-2 text-sm text-slate-500">
            Um dein Onboarding abzuschließen, musst du eingeloggt sein.
          </p>
          <a
            href={`/${lang || "de"}/login?next=${encodeURIComponent(
              `/${lang || "de"}/club/${slug}/onboarding?post_payment=1${session_id ? `&session_id=${session_id}` : ""}`
            )}`}
            className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-slate-900 px-4 text-sm font-semibold text-white"
          >
            Zum Login
          </a>
        </div>
      </div>
    )
  }

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("first_name, last_name, phone")
        .eq("id", user.id)
        .single()
    : { data: null }

  if (!contract && isPostPayment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">Zahlung erforderlich</h1>
          <p className="mt-2 text-sm text-slate-500">
            Deine Zahlung wurde noch nicht bestätigt oder es gibt keine aktive Mitgliedschaft.
          </p>
          <a
            href={`/${lang || "de"}/club/${slug}`}
            className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-slate-900 px-4 text-sm font-semibold text-white"
          >
            Zurück zum Club
          </a>
        </div>
      </div>
    )
  }

  const documents = user ? await getMyDocuments(slug) : []
  const safeDocuments = (documents || []).map((d: any) => ({
    id: String(d?.id || ""),
    doc_type: String(d?.doc_type || ""),
    file_name: String(d?.file_name || ""),
    ai_status: String(d?.ai_status || ""),
    review_status: String(d?.review_status || ""),
    temp_valid_until: d?.temp_valid_until || null,
    valid_until: d?.valid_until || null,
    created_at: String(d?.created_at || ""),
  }))

  const { data: plans } = await supabase
    .from("membership_plans")
    .select("id, name, price, stripe_price_id")
    .eq("club_id", club?.id)
    .order("price", { ascending: true })

  const safePlans = (plans || []).map((p: any) => ({
    id: String(p.id),
    name: String(p.name || ""),
    price: Number(p.price || 0),
    stripe_price_id: p.stripe_price_id ?? null,
  }))

  const safeFields = Array.isArray(contract?.membership_contract_fields)
    ? contract!.membership_contract_fields.map((f: any) => ({
        key: String(f?.key || ""),
        label: String(f?.label || ""),
        type: f?.type === "textarea" || f?.type === "checkbox" ? f.type : "text",
        required: !!f?.required,
        placeholder: f?.placeholder ? String(f.placeholder) : null,
      }))
    : []

  const safeContractTitle = typeof contract?.title === "string" ? contract.title : "Mitgliedschaft"
  const safeContractBody = typeof contract?.body === "string" ? contract.body : ""

  return (
    <div>
      <MemberOnboardingForm
        clubSlug={slug}
        clubName={club?.name || "Verein"}
        clubLogoUrl={club?.logo_url}
        contractTitle={safeContractTitle}
        contractBody={safeContractBody}
        contractVersion={contract?.version || 1}
        contractFields={safeFields}
        allowSubscription={contract?.membership_allow_subscription ?? true}
        feeEnabled={contract?.membership_fee_enabled ?? true}
        feeAmount={contract?.membership_fee ?? 0}
        plans={safePlans}
        initialMember={{
          firstName: profile?.first_name || "",
          lastName: profile?.last_name || "",
          email: user?.email || "",
          phone: profile?.phone || "",
          address: "",
          city: "",
        }}
        guestMode={!isPostPayment}
        prePayment={!isPostPayment}
      />

      {user && isPostPayment && (
        <div className="mx-auto max-w-4xl px-5 pb-16">
          <MemberDocumentsForm clubSlug={slug} documents={safeDocuments} />
        </div>
      )}
    </div>
  )
}
