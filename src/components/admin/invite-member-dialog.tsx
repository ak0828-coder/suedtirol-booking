"use client"

import { useState } from "react"
import { inviteMember } from "@/app/actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Mail, Plus } from "lucide-react"
import { useI18n } from "@/components/i18n/locale-provider"

export function InviteMemberDialog({ clubSlug }: { clubSlug: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { t } = useI18n()

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    formData.append("clubSlug", clubSlug)
    const res = await inviteMember(formData)
    setLoading(false)

    if (res.success) {
      alert(t("admin_invite.sent", "Einladung wurde gesendet!"))
      setIsOpen(false)
    } else {
      alert(t("admin_invite.error", "Fehler") + ": " + res.error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full">
          <Plus className="w-4 h-4 mr-2" />
          {t("admin_invite.cta", "Mitglied einladen")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("admin_invite.title", "Mitglied einladen")}</DialogTitle>
          <DialogDescription>
            {t("admin_invite.desc", "Das neue Mitglied erhält eine E-Mail mit Zugangsdaten und wird sofort als Aktiv freigeschaltet.")}
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="email">{t("admin_invite.email", "E-Mail Adresse")}</Label>
            <Input id="email" name="email" type="email" required placeholder={t("admin_invite.email_ph", "max@mustermann.de")} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">{t("admin_invite.first", "Vorname")}</Label>
              <Input id="firstName" name="firstName" required placeholder={t("admin_invite.first_ph", "Max")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">{t("admin_invite.last", "Nachname")}</Label>
              <Input id="lastName" name="lastName" required placeholder={t("admin_invite.last_ph", "Mustermann")} />
            </div>
          </div>

          <Button type="submit" className="w-full rounded-full" disabled={loading}>
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" /> {t("admin_invite.send", "Einladung senden")}
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
