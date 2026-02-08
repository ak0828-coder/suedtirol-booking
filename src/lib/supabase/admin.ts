import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Admin client for server-side routes (bypass RLS).
export function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
