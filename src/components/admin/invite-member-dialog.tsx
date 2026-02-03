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

export function InviteMemberDialog({ clubSlug }: { clubSlug: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    formData.append("clubSlug", clubSlug)
    const res = await inviteMember(formData)
    setLoading(false)

    if (res.success) {
      alert("Einladung wurde gesendet!")
      setIsOpen(false)
    } else {
      alert("Fehler: " + res.error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Mitglied einladen
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mitglied einladen</DialogTitle>
          <DialogDescription>
            Das neue Mitglied erhält eine E-Mail mit Zugangsdaten und wird sofort als "Aktiv" freigeschaltet.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail Adresse</Label>
            <Input id="email" name="email" type="email" required placeholder="max@mustermann.de" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Vorname</Label>
              <Input id="firstName" name="firstName" required placeholder="Max" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nachname</Label>
              <Input id="lastName" name="lastName" required placeholder="Mustermann" />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" /> Einladung senden
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
