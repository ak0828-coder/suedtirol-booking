import { getClubMembers, getImportedMembersCount } from "@/app/actions"
import { InviteMemberDialog } from "@/components/admin/invite-member-dialog"
import { MemberImportWizard } from "@/components/admin/member-import-wizard"
import { ActivationBanner } from "@/components/admin/activation-banner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit } from "lucide-react"
import { getAdminContext } from "../_lib/get-admin-context"

export default async function AdminMembersPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  await getAdminContext(slug)
  const members = await getClubMembers(slug)
  const importedCount = await getImportedMembersCount(slug)

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold">Mitglieder-Kartei</h2>
          <p className="text-slate-500 text-sm">Verwaltung und Einladungen an einem Ort.</p>
        </div>
        <InviteMemberDialog clubSlug={slug} />
      </div>

      <ActivationBanner importedCount={importedCount} clubSlug={slug} />

      <MemberImportWizard clubSlug={slug} />

      <div className="border border-slate-200/60 rounded-2xl bg-white/80 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80">
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Einladung</TableHead>
              <TableHead>Attest</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((m: any) => (
              <TableRow key={m.id} className="hover:bg-slate-50/80">
                <TableCell className="font-medium">
                  {m.profiles?.first_name} {m.profiles?.last_name || "Unbekannt"}
                  <div className="text-xs text-muted-foreground">{m.profiles?.id}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={m.status === "active" ? "default" : "secondary"}>{m.status}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={m.invite_status === "imported" ? "secondary" : "outline"}>
                    {m.invite_status || "none"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {m.medical_certificate_valid_until ? (
                      <div className="text-sm">
                        Gültig bis {new Date(m.medical_certificate_valid_until).toLocaleDateString()}
                      </div>
                    ) : (
                      <span className="text-red-400 text-sm">Fehlt</span>
                    )}
                    {m.latest_med_doc ? (
                      <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-600 anim-pop">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            m.latest_med_doc.review_status === "approved"
                              ? "bg-emerald-400"
                              : m.latest_med_doc.ai_status === "ok"
                              ? "bg-amber-400"
                              : m.latest_med_doc.ai_status === "reject"
                              ? "bg-rose-400"
                              : "bg-slate-300"
                          }`}
                        />
                        {m.latest_med_doc.review_status === "approved"
                          ? "Bestätigt"
                          : m.latest_med_doc.review_status === "rejected"
                          ? "Abgelehnt"
                          : m.latest_med_doc.ai_status === "ok"
                          ? "KI ok"
                          : m.latest_med_doc.ai_status === "reject"
                          ? "KI abgelehnt"
                          : "KI prüft"}
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400">Kein Dokument</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{m.profiles?.phone || "-"}</TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="ghost" size="sm" className="rounded-full">
                    <a href={`/club/${slug}/admin/members/${m.id}`}>
                      <Edit className="w-4 h-4 mr-2" />
                      Details
                    </a>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {members.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-slate-500">
                  Noch keine Mitglieder. Lade jemanden ein!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
