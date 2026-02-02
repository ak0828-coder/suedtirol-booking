"use client"

import { useState } from "react"
import { createVoucher, deleteVoucher } from "@/app/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Ticket, Trash2, Plus, Loader2 } from "lucide-react"
import { format } from "date-fns"

export function VoucherManager({ vouchers, clubSlug }: { vouchers: any[], clubSlug: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleCreate(formData: FormData) {
        setLoading(true)
        formData.append("clubSlug", clubSlug)
        const res = await createVoucher(formData)
        setLoading(false)
        if (res.success) {
            setIsOpen(false)
        } else {
            alert(res.error)
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <Ticket className="w-5 h-5" /> Gutscheine & Codes
                </CardTitle>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm"><Plus className="w-4 h-4 mr-2"/> Code erstellen</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Neuen Gutschein erstellen</DialogTitle>
                        </DialogHeader>
                        <form action={handleCreate} className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Code (z.B. SOMMER20)</Label>
                                    <Input name="code" placeholder="CODE" required style={{textTransform: 'uppercase'}} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Wert (€)</Label>
                                    <Input name="amount" type="number" step="0.01" required />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Anzahl Nutzungen</Label>
                                    <Input name="usageLimit" type="number" defaultValue="1" min="1" required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Ablaufdatum (Optional)</Label>
                                    <Input name="expiresAt" type="date" />
                                </div>
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? <Loader2 className="animate-spin" /> : "Erstellen"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Wert</TableHead>
                            <TableHead>Nutzung</TableHead>
                            <TableHead>Ablauf</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {vouchers.map((v) => {
                            const isExpired = v.expires_at && new Date(v.expires_at) < new Date()
                            const isUsedUp = (v.usage_count || 0) >= (v.usage_limit || 1)
                            
                            return (
                                <TableRow key={v.id}>
                                    <TableCell className="font-mono font-bold">{v.code}</TableCell>
                                    <TableCell>{v.amount}€</TableCell>
                                    <TableCell>{v.usage_count || 0} / {v.usage_limit || 1}</TableCell>
                                    <TableCell>
                                        {v.expires_at ? format(new Date(v.expires_at), 'dd.MM.yyyy') : 'Unbegrenzt'}
                                    </TableCell>
                                    <TableCell>
                                        {v.is_redeemed || isUsedUp ? (
                                            <Badge variant="secondary">Aufgebraucht</Badge>
                                        ) : isExpired ? (
                                            <Badge variant="destructive">Abgelaufen</Badge>
                                        ) : (
                                            <Badge className="bg-green-600">Aktiv</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="text-red-500 hover:text-red-700"
                                            onClick={async () => {
                                                if(confirm("Löschen?")) await deleteVoucher(v.id, clubSlug)
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                        {vouchers.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-slate-500">Keine Gutscheine vorhanden</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}