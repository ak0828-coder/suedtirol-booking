"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { updateMemberStatusManual } from "@/app/actions"

export function MemberActionDialog({
  clubSlug,
  member,
  trigger,
}: {
  clubSlug: string
  member: any
  trigger: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const res = await updateMemberStatusManual(member.id, clubSlug, formData)
    setLoading(false)
    if (res?.success) setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Manuelle Erfassung</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select name="status" defaultValue={member.status || "active"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktiv</SelectItem>
                  <SelectItem value="expired">Abgelaufen</SelectItem>
                  <SelectItem value="paused">Pausiert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Mitglied gültig bis</Label>
              <Input type="date" name="valid_until" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ärztliches Zeugnis gültig bis</Label>
              <Input type="date" name="medical_certificate_valid_until" />
            </div>
            <div className="space-y-2">
              <Label>Zahlungsstatus</Label>
              <Select name="payment_status" defaultValue={member.payment_status || "unpaid"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Bezahlt</SelectItem>
                  <SelectItem value="paid_cash">Bar bezahlt</SelectItem>
                  <SelectItem value="paid_bank">Überwiesen</SelectItem>
                  <SelectItem value="unpaid">Offen</SelectItem>
                  <SelectItem value="overdue">Überfällig</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Nächster Beitragseinzug</Label>
            <Input type="date" name="next_payment_at" />
            <p className="text-xs text-slate-500">
              Falls bereits bezahlt, hier das nächste Einzugsdatum setzen.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Interne Notiz</Label>
            <Textarea name="notes" placeholder="z.B. Bar bezahlt am 12.02., Vertrag liegt im Büro." />
          </div>

          <Button className="w-full rounded-full" disabled={loading} type="submit">
            {loading ? "Speichere..." : "Manuell speichern"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
