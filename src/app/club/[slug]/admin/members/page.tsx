import { getClubMembers, getImportedMembersCount, getMemberAdminDashboardStats, getMembershipContract } from "@/app/actions"
import { InviteMemberDialog } from "@/components/admin/invite-member-dialog"
import { MemberImportWizard } from "@/components/admin/member-import-wizard"
import { ActivationBanner } from "@/components/admin/activation-banner"
import { MemberActionDialog } from "@/components/admin/member-action-dialog"
import { ContractEditor } from "@/components/admin/contract-editor"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, AlertTriangle, CheckCircle, FileText } from "lucide-react"
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
  const stats = await getMemberAdminDashboardStats(slug)
  const contract = await getMembershipContract(slug)

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

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm text-amber-700">Dokumente prüfen</div>
              <div className="text-2xl font-semibold text-amber-900">{stats?.reviewNeeded || 0}</div>
              <div className="text-xs text-amber-700">KI benötigt Bestätigung</div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm text-red-700">Beiträge offen</div>
              <div className="text-2xl font-semibold text-red-900">{stats?.paymentOpen || 0}</div>
              <div className="text-xs text-red-700">Zahlung überfällig</div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm text-emerald-700">Aktive Mitglieder</div>
              <div className="text-2xl font-semibold text-emerald-900">{stats?.activeMembers || 0}</div>
              <div className="text-xs text-emerald-700">Alles im grünen Bereich</div>
            </div>
          </div>
        </div>
      </div>

      <MemberImportWizard clubSlug={slug} />

      {contract && (
        <ContractEditor
          clubSlug={slug}
          clubName={contract.club_name}
          clubLogoUrl={contract.club_logo_url}
          initialTitle={contract.title}
          initialBody={contract.body}
          initialFee={contract.membership_fee}
          feeEnabled={contract.membership_fee_enabled}
          allowSubscription={contract.membership_allow_subscription}
          memberPricingMode={contract.member_booking_pricing_mode}
          memberPricingValue={contract.member_booking_pricing_value}
          version={contract.version}
          updatedAt={contract.updated_at}
        />
      )}

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
                  <div className="flex items-center justify-end gap-2">
                    <MemberActionDialog
                      clubSlug={slug}
                      member={m}
                      trigger={
                        <Button variant="outline" size="sm" className="rounded-full">
                          Manuell
                        </Button>
                      }
                    />
                    <Button asChild variant="ghost" size="sm" className="rounded-full">
                      <a href={`/club/${slug}/admin/members/${m.id}`}>
                        <Edit className="w-4 h-4 mr-2" />
                        Details
                      </a>
                    </Button>
                  </div>
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
