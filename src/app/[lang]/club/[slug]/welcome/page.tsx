import { notFound, redirect } from "next/navigation"
import { stripe } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"
import { getAdminClient } from "@/lib/supabase/admin"
import { getCheckoutEmail } from "@/lib/membership"
import { ensureMembershipFromCheckoutSession } from "@/app/actions"
import { WelcomeClient } from "./welcome-client"

export default async function WelcomePage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; slug: string }>
  searchParams: Promise<{ session_id?: string }>
}) {
  const { lang, slug } = await params
  const { session_id } = (await searchParams) || {}

  if (!session_id) return notFound()

  let stripeSession: any
  try {
    stripeSession = await stripe.checkout.sessions.retrieve(session_id)
  } catch {
    return notFound()
  }

  if (stripeSession.payment_status !== "paid") {
    return notFound()
  }

  const meta = stripeSession.metadata as any
  if (meta?.type !== "membership_subscription") return notFound()

  // Ensure membership exists (idempotent – safe to call multiple times)
  await ensureMembershipFromCheckoutSession(session_id)

  const supabaseAdmin = getAdminClient()
  const { data: club } = await supabaseAdmin
    .from("clubs")
    .select(
      "id, name, logo_url, membership_contract_title, membership_contract_body, membership_contract_version, membership_contract_fields"
    )
    .eq("slug", slug)
    .single()

  if (!club) return notFound()

  const email = getCheckoutEmail(stripeSession) || ""
  const guestPhone = meta?.guestPhone || ""
  const guestFirstName = meta?.guestFirstName || ""
  const guestLastName = meta?.guestLastName || ""

  // Check if the user is already logged in with the same email
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const isLoggedIn = !!user && user.email?.toLowerCase() === email.toLowerCase()

  // Already logged in and contract signed → go straight to dashboard
  if (isLoggedIn) {
    const { data: member } = await supabaseAdmin
      .from("club_members")
      .select("contract_signed_at")
      .eq("user_id", user.id)
      .eq("club_id", club.id)
      .single()
    if (member?.contract_signed_at) {
      redirect(`/${lang}/club/${slug}/dashboard`)
    }
  }

  const safeFields = Array.isArray(club.membership_contract_fields)
    ? (club.membership_contract_fields as any[]).map((f) => ({
        key: String(f?.key || ""),
        label: String(f?.label || ""),
        type:
          f?.type === "textarea" || f?.type === "checkbox" ? f.type : "text",
        required: !!f?.required,
        placeholder: f?.placeholder ? String(f.placeholder) : null,
      }))
    : []

  return (
    <WelcomeClient
      sessionId={session_id}
      clubSlug={slug}
      clubName={club.name || "Club"}
      clubLogoUrl={club.logo_url ?? null}
      contractTitle={club.membership_contract_title || "Mitgliedsvertrag"}
      contractBody={club.membership_contract_body || ""}
      contractVersion={club.membership_contract_version || 1}
      contractFields={safeFields}
      email={email}
      firstName={guestFirstName}
      lastName={guestLastName}
      phone={guestPhone}
      isLoggedIn={isLoggedIn}
      lang={lang}
    />
  )
}
