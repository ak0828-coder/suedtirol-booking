import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { mergeFeatures, mergeFeatureLocks } from "@/lib/club-features"

export async function getAdminContext(slug: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: club } = await supabase
    .from("clubs")
    .select("*")
    .eq("slug", slug)
    .single()

  if (!club) notFound()

  const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL?.toLowerCase()
  const isSuperAdmin = user.email?.toLowerCase() === SUPER_ADMIN_EMAIL
  const hasAccess = club.owner_id === user.id || isSuperAdmin

  const features = mergeFeatures(club.feature_flags)
  const locks = mergeFeatureLocks(club.feature_flags?.locks)

  return { club, user, isSuperAdmin, hasAccess, features, locks }
}
