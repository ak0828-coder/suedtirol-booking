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
import { useI18n } from "@/components/i18n/locale-provider"
import { useParams } from "next/navigation"

export function VoucherManager({ vouchers, clubSlug }: { vouchers: any[], clubSlug: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const { t } = useI18n()
    const params = useParams()
    const langRaw = params?.lang
    const lang = typeof langRaw === "string" ? langRaw : Array.isArray(langRaw) ? langRaw[0] : "de"
    const locale = lang === "it" ? "it-IT" : lang === "en" ? "en-US" : "de-DE"

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
        <Card className="rounded-2xl border border-slate-200/60 bg-white/80 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <Ticket className="w-5 h-5" /> {t("admin_vouchers.title", "Gutscheine & Codes")}
                </CardTitle>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="rounded-full"><Plus className="w-4 h-4 mr-2"/> {t("admin_vouchers.create", "Code erstellen")}</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t("admin_vouchers.new", "Neuen Gutschein erstellen")}</DialogTitle>
                        </DialogHeader>
                        <form action={handleCreate} className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>{t("admin_vouchers.code", "Code (z.B. SOMMER20)")}</Label>
                                    <Input name="code" placeholder="CODE" required style={{textTransform: 'uppercase'}} />
                                </div>
                                <div className="space-y-2">
                                    <Label>{t("admin_vouchers.amount", "Wert (€)")}</Label>
                                    <Input name="amount" type="number" step="0.01" required />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>{t("admin_vouchers.usage", "Anzahl Nutzungen")}</Label>
                                    <Input name="usageLimit" type="number" defaultValue="1" min="1" required />
                                </div>
                                <div className="space-y-2">
                                    <Label>{t("admin_vouchers.expires", "Ablaufdatum (Optional)")}</Label>
                                    <Input name="expiresAt" type="date" />
                                </div>
                            </div>
                            <Button type="submit" className="w-full rounded-full" disabled={loading}>
                                {loading ? <Loader2 className="animate-spin" /> : t("admin_vouchers.submit", "Erstellen")}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50/80">
                            <TableHead>{t("admin_vouchers.col_code", "Code")}</TableHead>
                            <TableHead>{t("admin_vouchers.col_amount", "Wert")}</TableHead>
                            <TableHead>{t("admin_vouchers.col_usage", "Nutzung")}</TableHead>
                            <TableHead>{t("admin_vouchers.col_expires", "Ablauf")}</TableHead>
                            <TableHead>{t("admin_vouchers.col_status", "Status")}</TableHead>
                            <TableHead className="text-right">{t("admin_vouchers.col_action", "Action")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {vouchers.map((v) => {
                            const isExpired = v.expires_at && new Date(v.expires_at) < new Date()
                            const isUsedUp = (v.usage_count || 0) >= (v.usage_limit || 1)

                            return (
                                <TableRow key={v.id} className="hover:bg-slate-50/80">
                                    <TableCell className="font-mono font-bold">{v.code}</TableCell>
                                    <TableCell>{v.amount}€</TableCell>
                                    <TableCell>{v.usage_count || 0} / {v.usage_limit || 1}</TableCell>
                                    <TableCell>
                                        {v.expires_at ? format(new Date(v.expires_at), 'dd.MM.yyyy') : t("admin_vouchers.unlimited", "Unbegrenzt")}
                                    </TableCell>
                                    <TableCell>
                                        {v.is_redeemed || isUsedUp ? (
                                            <Badge variant="secondary">{t("admin_vouchers.used", "Aufgebraucht")}</Badge>
                                        ) : isExpired ? (
                                            <Badge variant="destructive">{t("admin_vouchers.expired", "Abgelaufen")}</Badge>
                                        ) : (
                                            <Badge className="bg-green-600">{t("admin_vouchers.active", "Aktiv")}</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-700 rounded-full"
                                            onClick={async () => {
                                                if(confirm(t("admin_vouchers.confirm", "Löschen?"))) await deleteVoucher(v.id, clubSlug)
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
                                <TableCell colSpan={6} className="text-center text-slate-500">{t("admin_vouchers.empty", "Keine Gutscheine vorhanden")}</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
