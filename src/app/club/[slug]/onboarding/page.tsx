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
    .select("id")
    .eq("slug", slug)
    .single()

  const { data: plans } = await supabase
    .from("membership_plans")
    .select("id, name, price, stripe_price_id")
    .eq("club_id", club?.id)
    .order("price", { ascending: true })

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 py-10">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-2xl md:text-3xl font-semibold mb-6">Mitgliedschaft aktivieren</h1>
        <MemberOnboardingForm
          clubSlug={slug}
          contractTitle={contract.title}
          contractBody={contract.body}
          contractVersion={contract.version}
          allowSubscription={contract.membership_allow_subscription}
          feeEnabled={contract.membership_fee_enabled}
          feeAmount={contract.membership_fee}
          plans={plans || []}
        />
      </div>
    </div>
  )
}
