import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { getAdminContext } from "../../_lib/get-admin-context"
import { getMemberDocumentsForAdmin } from "@/app/actions"
import { MemberDocumentsAdmin } from "@/components/admin/member-documents-admin"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function AdminMemberDetailPage({
  params,
}: {
  params: Promise<{ slug: string; memberId: string }>
}) {
  const { slug, memberId } = await params
  const { club } = await getAdminContext(slug)

  const supabase = await createClient()
  const { data: member } = await supabase
    .from("club_members")
    .select("id, user_id, status, profiles:user_id(first_name, last_name, phone, id), medical_certificate_valid_until")
    .eq("id", memberId)
    .eq("club_id", club.id)
    .single()

  if (!member) return notFound()

  const documents = await getMemberDocumentsForAdmin(slug, member.user_id)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm">
        <div>
          <h2 className="text-2xl font-semibold">
            {member.profiles?.first_name} {member.profiles?.last_name || "Unbekannt"}
          </h2>
          <div className="text-sm text-slate-500">{member.profiles?.id}</div>
        </div>
        <Link href={`/club/${slug}/admin/members`}>
          <Button variant="outline" className="rounded-full">Zurück</Button>
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm space-y-2">
        <div className="text-sm text-slate-600">Status: {member.status}</div>
        <div className="text-sm text-slate-600">Telefon: {member.profiles?.phone || "-"}</div>
        <div className="text-sm text-slate-600">
          Attest gültig bis:{" "}
          {member.medical_certificate_valid_until
            ? new Date(member.medical_certificate_valid_until).toLocaleDateString("de-DE")
            : "Fehlt"}
        </div>
      </div>

      <MemberDocumentsAdmin clubSlug={slug} documents={documents} />
    </div>
  )
}
