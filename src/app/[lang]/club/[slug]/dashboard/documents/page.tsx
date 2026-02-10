import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { getMyDocuments } from "@/app/actions"
import { MemberDocumentsForm } from "@/components/member-documents-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { getReadableTextColor } from "@/lib/color"
import { TourLauncher } from "@/components/tours/tour-launcher"
import { Suspense } from "react"
import { getDictionary } from "@/lib/dictionaries"
import { createTranslator } from "@/lib/translator"

export default async function MemberDocumentsPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}) {
  const { slug, lang } = await params
  const dict = await getDictionary(lang as any)
  const t = createTranslator(dict)
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return notFound()

  const { data: club } = await supabase
    .from("clubs")
    .select("id, name, primary_color")
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

  const primary = club.primary_color || "#0f172a"
  const primaryFg = getReadableTextColor(primary)

  return (
    <div
      className="min-h-screen bg-[#f5f5f7] pb-24 safe-bottom page-enter"
      style={{ ["--club-primary" as any]: primary, ["--club-primary-foreground" as any]: primaryFg }}
    >
      <div className="mx-auto max-w-3xl space-y-6 app-pad pt-4 sm:pt-6">
        <header
          id="tour-documents-header"
          className="rounded-2xl border border-slate-200/60 bg-white/90 p-6 shadow-sm flex flex-wrap items-center justify-between gap-3"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">{t("documents.title", "Meine Dokumente")}</h1>
              <p className="text-sm text-slate-500">{t("documents.club", "Club:")} {club.name}</p>
            </div>
            <Link href={`/${lang}/club/${slug}/dashboard`}>
              <Button variant="outline" className="rounded-full">{t("documents.back", "Zurück")}</Button>
            </Link>
          </div>
          <Suspense fallback={null}>
            <TourLauncher tour="member-documents" storageKey="tour_member_documents_seen" label={t("documents.guide", "Guide")} autoStart />
          </Suspense>
        </header>

        <MemberDocumentsForm clubSlug={slug} documents={documents} />
      </div>
      <MobileBottomNav slug={slug} active="documents" />
    </div>
  )
}
