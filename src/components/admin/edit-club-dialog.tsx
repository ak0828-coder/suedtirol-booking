"use client"

import { useState } from "react"
import { updateClub } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Settings, Loader2, Upload, Palette } from "lucide-react"
import { useRouter } from "next/navigation"

export function EditClubDialog({ club }: { club: any }) {
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [color, setColor] = useState(club.primary_color || "#0f172a")
  const router = useRouter()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    // Wir hängen die ID und den Slug manuell an, da sie nicht im Formular sichtbar sein müssen
    formData.append("clubId", club.id)
    formData.append("slug", club.slug)
    // Farbe explizit setzen, falls der Color Picker spinnt
    formData.set("primary_color", color)

    const result = await updateClub(formData)
    
    setIsLoading(false)
    
    if (result.success) {
      setOpen(false)
      router.refresh() // Damit man das neue Logo/Farbe gleich sieht
      // alert("✅ Gespeichert!") // Optional, Refresh reicht oft
    } else {
      alert("❌ Fehler: " + result.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-slate-100 text-slate-400 hover:text-slate-700">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white text-slate-900">
        <DialogHeader>
          <DialogTitle>Verein bearbeiten</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          
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
            <div className="flex gap-3">
                <div className="relative">
                    <input 
                        type="color" 
                        value={color} 
                        onChange={(e) => setColor(e.target.value)}
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" 
                    />
                    <div className="w-10 h-10 rounded-md border shadow-sm" style={{ backgroundColor: color }} />
                </div>
                <Input 
                    name="primary_color_text" // Dummy name, wir nutzen state
                    value={color} 
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="#000000" 
                    className="font-mono flex-1"
                />
            </div>
          </div>

          {/* LOGO UPLOAD */}
          <div className="space-y-2">
             <Label className="flex items-center gap-2">
                <Upload className="w-4 h-4"/> Logo hochladen
            </Label>
            <Input id="logo" name="logo" type="file" accept="image/*" className="cursor-pointer" />
            {club.logo_url && (
                <div className="mt-3 p-2 bg-slate-50 rounded border flex items-center gap-3">
                    <img src={club.logo_url} alt="Logo" className="w-8 h-8 object-contain" />
                    <span className="text-xs text-slate-500">Aktuelles Logo</span>
                </div>
            )}
          </div>

          <div className="pt-2 flex justify-end gap-2">
             <Button type="button" variant="outline" onClick={() => setOpen(false)}>Abbrechen</Button>
             <Button type="submit" disabled={isLoading} className="bg-slate-900 text-white hover:bg-slate-800">
                {isLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : "Speichern"}
             </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}