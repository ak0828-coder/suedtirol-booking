import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import MemberLoginClient from "./member-login-client"

export default async function ClubMemberLoginPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: club } = await supabase
    .from("clubs")
    .select("name, logo_url, primary_color")
    .eq("slug", slug)
    .single()

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f5f5f7]" />}>
      <MemberLoginClient
        clubName={club?.name || slug}
        clubLogoUrl={club?.logo_url || null}
        primaryColor={club?.primary_color || "#1F3D2B"}
      />
    </Suspense>
  )
}
