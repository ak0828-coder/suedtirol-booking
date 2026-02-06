import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { getMyDocuments } from "@/app/actions"
import { MemberDocumentsForm } from "@/components/member-documents-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"

export default async function MemberDocumentsPage({
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

  const { data: club } = await supabase
    .from("clubs")
    .select("id, name")
    .eq("slug", slug)
    .single()

  if (!club) return notFound()

  const { data: member } = await supabase
    .from("club_members")
    .select("status")
    .eq("club_id", club.id)
    .eq("user_id", user.id)
    .single()

  if (!member || member.status !== "active") return notFound()

  const documents = await getMyDocuments(slug)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 pb-24 safe-bottom page-enter">
      <div className="mx-auto max-w-3xl space-y-6 app-pad pt-4 sm:pt-6">
        <header className="rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Meine Dokumente</h1>
              <p className="text-sm text-slate-500">Club: {club.name}</p>
            </div>
            <Link href={`/club/${slug}/dashboard`}>
              <Button variant="outline" className="rounded-full">Zurück</Button>
            </Link>
          </div>
        </header>

        <MemberDocumentsForm clubSlug={slug} documents={documents} />
      </div>
      <MobileBottomNav slug={slug} active="documents" />
    </div>
  )
}
