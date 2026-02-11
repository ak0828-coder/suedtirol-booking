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
}) {
  const { supabaseAdmin, userId, clubId, planId, subscriptionId, validUntilIso } = params
  if (!userId || !clubId || !planId) return { success: false, error: "missing_params" }

  const { data: existing } = await supabaseAdmin
    .from("club_members")
    .select("id")
    .eq("club_id", clubId)
    .eq("user_id", userId)
    .limit(1)

  const payload: any = {
    user_id: userId,
    club_id: clubId,
    plan_id: planId,
    stripe_subscription_id: subscriptionId || null,
    status: "active",
  }
  if (validUntilIso) payload.valid_until = validUntilIso

  let writeError = null
  if (existing?.[0]?.id) {
    const { error } = await supabaseAdmin
      .from("club_members")
      .update(payload)
      .eq("id", existing[0].id)
    writeError = error
  } else {
    const { error } = await supabaseAdmin.from("club_members").insert(payload)
    writeError = error
  }

  if (writeError) {
    return { success: false, error: "member_write_failed" }
  }

  return { success: true }
}
