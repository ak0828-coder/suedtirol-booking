"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { updateMemberStatusManual } from "@/app/actions"
import { useI18n } from "@/components/i18n/locale-provider"

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
  const { t } = useI18n()

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
          <DialogTitle>{t("admin_member_action.title", "Manuelle Erfassung")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("admin_member_action.status", "Status")}</Label>
              <Select name="status" defaultValue={member.status || "active"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{t("admin_member_action.status_active", "Aktiv")}</SelectItem>
                  <SelectItem value="expired">{t("admin_member_action.status_expired", "Abgelaufen")}</SelectItem>
                  <SelectItem value="paused">{t("admin_member_action.status_paused", "Pausiert")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("admin_member_action.valid_until", "Mitglied gültig bis")}</Label>
              <Input type="date" name="valid_until" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("admin_member_action.medical_until", "Ärztliches Zeugnis gültig bis")}</Label>
              <Input type="date" name="medical_certificate_valid_until" />
            </div>
            <div className="space-y-2">
              <Label>{t("admin_member_action.payment_status", "Zahlungsstatus")}</Label>
              <Select name="payment_status" defaultValue={member.payment_status || "unpaid"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">{t("admin_member_action.paid", "Bezahlt")}</SelectItem>
                  <SelectItem value="paid_cash">{t("admin_member_action.paid_cash", "Bar bezahlt")}</SelectItem>
                  <SelectItem value="paid_bank">{t("admin_member_action.paid_bank", "Überwiesen")}</SelectItem>
                  <SelectItem value="unpaid">{t("admin_member_action.unpaid", "Offen")}</SelectItem>
                  <SelectItem value="overdue">{t("admin_member_action.overdue", "Überfällig")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("admin_member_action.next_payment", "Nächster Beitragseinzug")}</Label>
            <Input type="date" name="next_payment_at" />
            <p className="text-xs text-slate-500">
              {t("admin_member_action.next_payment_hint", "Falls bereits bezahlt, hier das nächste Einzugsdatum setzen.")}
            </p>
          </div>

          <div className="space-y-2">
            <Label>{t("admin_member_action.notes", "Interne Notiz")}</Label>
            <Textarea name="notes" placeholder={t("admin_member_action.notes_ph", "z.B. Bar bezahlt am 12.02., Vertrag liegt im Büro.")} />
          </div>

          <Button className="w-full rounded-full" disabled={loading} type="submit">
            {loading ? t("admin_member_action.saving", "Speichere...") : t("admin_member_action.save", "Manuell speichern")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
