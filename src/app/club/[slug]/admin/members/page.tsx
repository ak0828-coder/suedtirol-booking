import { getClubMembers } from "@/app/actions"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { InviteMemberDialog } from "@/components/admin/invite-member-dialog"

export default async function AdminMembersPage({ params }: { params: { slug: string } }) {
    // Security Check (bestehende Logik nutzen oder getMyClubSlug)
    const slug = params.slug
    const members = await getClubMembers(slug)

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Mitglieder-Kartei</h1>
                <InviteMemberDialog clubSlug={slug} />
            </div>

            <div className="border rounded-lg bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Attest Gültig bis</TableHead>
                            <TableHead>Telefon</TableHead>
                            <TableHead className="text-right">Aktionen</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {members.map((m: any) => (
                            <TableRow key={m.id}>
                                <TableCell className="font-medium">
                                    {m.profiles?.first_name} {m.profiles?.last_name || "Unbekannt"}
                                    <div className="text-xs text-muted-foreground">{m.profiles?.id}</div> {/* Oder Email wenn wir sie joinen */}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={m.status === 'active' ? 'default' : 'secondary'}>
                                        {m.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {m.medical_certificate_valid_until 
                                        ? new Date(m.medical_certificate_valid_until).toLocaleDateString() 
                                        : <span className="text-red-400 text-sm">Fehlt</span>
                                    }
                                </TableCell>
                                <TableCell>{m.profiles?.phone || "-"}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm">
                                        <Edit className="w-4 h-4 mr-2" />
                                        Details
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
