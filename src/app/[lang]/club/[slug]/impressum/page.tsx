import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { applyClubDefaults, mergeClubContent } from "@/lib/club-content"
import { getDictionary } from "@/lib/dictionaries"
import { createTranslator } from "@/lib/translator"

export default async function ClubImpressumPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}) {
  const { slug, lang } = await params
  const dict = await getDictionary(lang as any)
  const t = createTranslator(dict)
  const supabase = await createClient()

  const { data: club } = await supabase
    .from("clubs")
    .select("*")
    .eq("slug", slug)
    .single()

  if (!club) return notFound()

  const { data: contentRows } = await supabase
    .from("club_content")
    .select("content")
    .eq("club_id", club.id)
    .limit(1)

  const storedContent = contentRows?.[0]?.content ?? null
  const content = applyClubDefaults(mergeClubContent(storedContent), club.name)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 pb-20">
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm">
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">{content.impressum.title}</h1>
          <p className="mt-2 text-sm text-slate-500">{club.name}</p>
        </div>

        <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm">
          {content.impressum.body ? (
            <div className="whitespace-pre-wrap text-sm text-slate-700">{content.impressum.body}</div>
          ) : (
            <div className="text-sm text-slate-500">
              {t("club_impressum.empty", "Impressum Text ist noch leer. Bitte im Admin-CMS ausfüllen.")}
            </div>
          )}
        </div>

        <Link href={`/${lang}/club/${slug}`} className="text-sm text-slate-600 hover:text-slate-900">
          {t("club_impressum.back", "Zurück zur Club-Seite")}
        </Link>
      </div>
    </div>
  )
}
