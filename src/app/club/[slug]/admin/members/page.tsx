import { getClubMembers } from "@/app/actions"
import { useAdminContext } from "@/components/admin/admin-context"
import { InviteMemberDialog } from "@/components/admin/invite-member-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit } from "lucide-react"

export default async function AdminMembersPage() {
  const { slug } = useAdminContext()
  const members = await getClubMembers(slug)

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold">Mitglieder-Kartei</h2>
          <p className="text-slate-500 text-sm">Verwaltung und Einladungen an einem Ort.</p>
        </div>
        <InviteMemberDialog clubSlug={slug} />
      </div>

      <div className="border border-slate-200/60 rounded-2xl bg-white/80 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80">
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Attest Gultig bis</TableHead>
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
                  {m.medical_certificate_valid_until ? (
                    new Date(m.medical_certificate_valid_until).toLocaleDateString()
                  ) : (
                    <span className="text-red-400 text-sm">Fehlt</span>
                  )}
                </TableCell>
                <TableCell>{m.profiles?.phone || "-"}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="rounded-full">
                    <Edit className="w-4 h-4 mr-2" />
                    Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {members.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-slate-500">
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
