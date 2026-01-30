"use client"

import { useState } from "react"
import { updateClub } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Settings, Loader2, Upload, Palette } from "lucide-react"

export function EditClubDialog({ club }: { club: any }) {
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [color, setColor] = useState(club.primary_color || "#0f172a")

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    // Wir hängen die ID und den Slug manuell an, da sie nicht im Formular sichtbar sein müssen
    formData.append("clubId", club.id)
    formData.append("slug", club.slug)

    const result = await updateClub(formData)
    
    setIsLoading(false)
    if (result.success) {
      setOpen(false)
      alert("✅ Gespeichert!")
    } else {
      alert("❌ Fehler: " + result.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4 text-slate-500" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Verein bearbeiten: {club.name}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          
          {/* NAME */}
          <div className="space-y-2">
            <Label htmlFor="name">Name des Vereins</Label>
            <Input id="name" name="name" defaultValue={club.name} required />
          </div>

          {/* FARBE (Color Picker) */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
                <Palette className="w-4 h-4"/> Branding Farbe
            </Label>
            <div className="flex gap-2">
                <Input 
                    type="color" 
                    name="primary_color" 
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-12 h-10 p-1 cursor-pointer" 
                />
                <Input 
                    value={color} 
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="#000000" 
                    className="font-mono"
                />
            </div>
          </div>

          {/* LOGO UPLOAD */}
          <div className="space-y-2">
             <Label className="flex items-center gap-2">
                <Upload className="w-4 h-4"/> Logo hochladen
            </Label>
            <Input id="logo" name="logo" type="file" accept="image/*" />
            {club.logo_url && (
                <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
                    <img src={club.logo_url} alt="Logo" className="w-8 h-8 object-contain rounded border" />
                    <span>Aktuelles Logo vorhanden</span>
                </div>
            )}
          </div>

          <div className="pt-4 flex justify-end gap-2">
             <Button type="button" variant="outline" onClick={() => setOpen(false)}>Abbrechen</Button>
             <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Speichern"}
             </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}