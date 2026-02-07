import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { getMembershipContractForMember } from "@/app/actions"
import { MemberOnboardingForm } from "@/components/member/onboarding-form"

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
  if (!user) return notFound()

  const contract = await getMembershipContractForMember(slug)
  if (!contract) return notFound()

  const { data: club } = await supabase
    .from("clubs")
    .select("id, name, logo_url")
    .eq("slug", slug)
    .single()

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, phone")
    .eq("id", user.id)
    .single()

  const { data: plans } = await supabase
    .from("membership_plans")
    .select("id, name, price, stripe_price_id")
    .eq("club_id", club?.id)
    .order("price", { ascending: true })

  return (
    <MemberOnboardingForm
      clubSlug={slug}
      clubName={club?.name || "Verein"}
      clubLogoUrl={club?.logo_url}
      contractTitle={contract.title}
      contractBody={contract.body}
      contractVersion={contract.version}
      allowSubscription={contract.membership_allow_subscription}
      feeEnabled={contract.membership_fee_enabled}
      feeAmount={contract.membership_fee}
      plans={plans || []}
      initialMember={{
        firstName: profile?.first_name || "",
        lastName: profile?.last_name || "",
        email: user.email || "",
        phone: profile?.phone || "",
        address: "",
        city: "",
      }}
    />
  )
}
