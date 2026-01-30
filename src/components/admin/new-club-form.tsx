"use client"

import { useState } from "react"
import { createClub } from "@/app/actions" // Importiert jetzt die neue Server Action
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

export function NewClubForm() {
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const result = await createClub(formData)
    
    setIsLoading(false)
    if (result.success) {
      alert(`✅ ${result.message}\n\nBitte Daten notieren:\nEmail: ${formData.get('email')}\nPasswort: ${formData.get('password')}`)
      window.location.reload()
    } else {
      alert("❌ Fehler: " + result.error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Vereinsname</Label>
          <Input id="name" name="name" placeholder="TC Meran" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug (URL)</Label>
          <Input id="slug" name="slug" placeholder="tc-meran" required pattern="[a-z0-9-]+" />
        </div>
      </div>
      
      <div className="space-y-2 pt-2 border-t">
        <Label className="text-slate-500">Admin Zugang erstellen</Label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail</Label>
            <Input id="email" name="email" type="email" placeholder="admin@tc-meran.it" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Passwort</Label>
            <Input id="password" name="password" type="text" placeholder="Geheim123" required minLength={6} />
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full bg-slate-900 text-white" disabled={isLoading}>
        {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Verein & User erstellen"}
      </Button>
    </form>
  )
}