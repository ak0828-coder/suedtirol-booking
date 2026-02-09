"use client"

import { useState } from "react"
import { updateClub } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Save, Settings } from "lucide-react"

export function ClubSettings({ club, isSuperAdmin = false }: { club: any; isSuperAdmin?: boolean }) {
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    const res = await updateClub(formData)
    setLoading(false)
    if (res.success) {
      alert("Gespeichert!")
    } else {
      alert(res.error)
    }
  }

  return (
    <Card className="rounded-2xl border border-slate-200/60 bg-white/80 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" /> Vereinseinstellungen
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="clubId" value={club.id} />
          <input type="hidden" name="slug" value={club.slug} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Vereinsname</Label>
              <Input id="name" name="name" defaultValue={club.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="primary_color">Primärfarbe (Hex)</Label>
              <div className="flex gap-2">
                <Input
                  id="primary_color"
                  name="primary_color"
                  type="color"
                  className="w-12 h-10 p-1"
                  defaultValue={club.primary_color}
                />
                <Input
                  name="primary_color_text"
                  defaultValue={club.primary_color}
                  className="uppercase"
                  onChange={() => {
                    // Optional: Sync logic wenn man tippt
                  }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cancellation">Stornierungsfrist (für Mitglieder)</Label>
            <Select name="cancellation_buffer_hours" defaultValue={String(club.cancellation_buffer_hours || "24")}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Wähle eine Frist" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Keine Frist (Jederzeit)</SelectItem>
                <SelectItem value="1">1 Stunde vorher</SelectItem>
                <SelectItem value="6">6 Stunden vorher</SelectItem>
                <SelectItem value="12">12 Stunden vorher</SelectItem>
                <SelectItem value="24">24 Stunden vorher</SelectItem>
                <SelectItem value="48">48 Stunden vorher</SelectItem>
                <SelectItem value="72">72 Stunden vorher</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
              Wie viele Stunden vor Spielbeginn darf noch kostenlos storniert werden?
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">Logo ändern (Optional)</Label>
            <Input id="logo" name="logo" type="file" accept="image/*" />
          </div>

          {isSuperAdmin ? (
            <div className="space-y-2">
              <Label htmlFor="application_fee_cents">Avaimo Provision pro Buchung (Cent)</Label>
              <Input
                id="application_fee_cents"
                name="application_fee_cents"
                type="number"
                min="0"
                step="1"
                defaultValue={club.application_fee_cents ?? 0}
              />
              <p className="text-xs text-slate-500">
                0 = keine Provision. 100 = 1,00 EUR.
              </p>
            </div>
          ) : null}

          <div className="pt-2">
            <Button type="submit" disabled={loading} className="w-full md:w-auto rounded-full">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Speichern
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
