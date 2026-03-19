"use client"

import { useState } from "react"
import { createClub } from "@/app/actions" // Importiert die neue Server Action
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export function NewClubForm() {
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const result = await createClub(formData)
    
    setIsLoading(false)
    if (result.success) {
      toast.success(result.message || "Verein erstellt")
      window.location.reload()
    } else {
      toast.error("Fehler: " + result.error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-white">Vereinsname</Label>
          <Input id="name" name="name" placeholder="TC Meran" required className="bg-white/5 border-white/10 text-white placeholder:text-white/20" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug" className="text-white">Slug (URL)</Label>
          <Input id="slug" name="slug" placeholder="tc-meran" required pattern="[a-z0-9-]+" className="bg-white/5 border-white/10 text-white placeholder:text-white/20" />
        </div>
      </div>
      
      <div className="space-y-2 pt-2 border-t border-white/10">
        <Label className="text-white/50">Admin Zugang erstellen</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">E-Mail</Label>
            <Input id="email" name="email" type="email" placeholder="admin@tc-meran.it" required className="bg-white/5 border-white/10 text-white placeholder:text-white/20" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">Passwort</Label>
            <Input id="password" name="password" type="text" placeholder="Geheim123" required minLength={6} className="bg-white/5 border-white/10 text-white placeholder:text-white/20" />
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full bg-[#CBBF9A] text-[#030504] hover:bg-[#CBBF9A]/90 rounded-full font-bold" disabled={isLoading}>
        {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Verein & User erstellen"}
      </Button>
    </form>
  )
}
