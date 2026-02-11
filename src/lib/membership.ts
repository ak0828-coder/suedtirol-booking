import type { SupabaseClient } from "@supabase/supabase-js"

type SupabaseAdmin = SupabaseClient<any, any, any, any, any>

export async function findUserIdByEmail(supabaseAdmin: SupabaseAdmin, email: string) {
  const target = (email || "").trim().toLowerCase()
  if (!target) return null
  const perPage = 1000
  let page = 1
  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage })
    if (error || !data?.users) return null
    const found = data.users.find((u) => u.email?.toLowerCase() === target)
    if (found?.id) return found.id
    if (data.users.length < perPage) return null
    page += 1
  }
}

export function getCheckoutEmail(session: any) {
  return (
    session?.customer_details?.email ||
    session?.customer_email ||
    session?.metadata?.guestEmail ||
    null
  )
}

export async function writeClubMembership(params: {
  supabaseAdmin: SupabaseAdmin
  userId: string
  clubId: string
  planId: string
  subscriptionId?: string | null
  validUntilIso?: string | null
  paymentStatus?: string | null
}) {
  const { supabaseAdmin, userId, clubId, planId, subscriptionId, validUntilIso, paymentStatus } = params
  if (!userId || !clubId || !planId) return { success: false, error: "missing_params" }

  const payload: any = {
    user_id: userId,
    club_id: clubId,
    plan_id: planId,
    stripe_subscription_id: subscriptionId || null,
    status: "active",
  }
  if (paymentStatus) payload.payment_status = paymentStatus
  if (validUntilIso) payload.valid_until = validUntilIso

  const { error: writeError } = await supabaseAdmin
    .from("club_members")
    .upsert(payload, { onConflict: "club_id,user_id" })

  if (writeError) {
    return { success: false, error: "member_write_failed" }
  }

  return { success: true }
}
