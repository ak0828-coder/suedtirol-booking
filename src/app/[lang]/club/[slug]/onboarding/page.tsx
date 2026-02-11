import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { getMembershipContractForMember, getMyDocuments } from "@/app/actions"
import { MemberOnboardingForm } from "@/components/member/onboarding-form"
import { MemberDocumentsForm } from "@/components/member-documents-form"

export default async function MemberOnboardingPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const contract = user ? await getMembershipContractForMember(slug) : null
  if (user && !contract) return notFound()

  const { data: club } = await supabase
    .from("clubs")
    .select("id, name, logo_url")
    .eq("slug", slug)
    .single()
  if (!club) return notFound()

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("first_name, last_name, phone")
        .eq("id", user.id)
        .single()
    : { data: null }

  const documents = user ? await getMyDocuments(slug) : []

  const { data: plans } = await supabase
    .from("membership_plans")
    .select("id, name, price, stripe_price_id")
    .eq("club_id", club?.id)
    .order("price", { ascending: true })

  return (
    <div>
      <MemberOnboardingForm
        clubSlug={slug}
        clubName={club?.name || "Verein"}
        clubLogoUrl={club?.logo_url}
        contractTitle={contract?.title || "Mitgliedschaft"}
        contractBody={contract?.body || ""}
        contractVersion={contract?.version || 1}
        contractFields={contract?.membership_contract_fields || []}
        allowSubscription={contract?.membership_allow_subscription ?? true}
        feeEnabled={contract?.membership_fee_enabled ?? true}
        feeAmount={contract?.membership_fee ?? 0}
        plans={plans || []}
        initialMember={{
          firstName: profile?.first_name || "",
          lastName: profile?.last_name || "",
          email: user?.email || "",
          phone: profile?.phone || "",
          address: "",
          city: "",
        }}
        guestMode={!user}
      />

      {user && (
        <div className="mx-auto max-w-4xl px-5 pb-16">
          <MemberDocumentsForm clubSlug={slug} documents={documents || []} />
        </div>
      )}
    </div>
  )
}
