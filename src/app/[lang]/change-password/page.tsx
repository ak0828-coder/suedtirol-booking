"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateUserPassword, getMyClubSlug } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function ChangePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (password.length < 6) {
        toast.warning("Passwort muss mindestens 6 Zeichen haben")
        setIsLoading(false)
        return
    }

    const res = await updateUserPassword(password)

    if (res.success) {
        // Passwort geändert! Jetzt holen wir den Slug und leiten weiter
        // Da das Flag 'must_change_password' jetzt weg ist, lässt die Middleware uns durch.
        const slug = await getMyClubSlug()
        router.refresh() // Cookies/Auth neu laden
        
        if (slug === "SUPER_ADMIN_MODE") router.push("/super-admin")
        else if (slug) router.push(`/club/${slug}/admin`)
        else router.push("/")
    } else {
        toast.error("Fehler: " + res.error)
        setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7] p-4">
      <Card className="w-full max-w-md rounded-3xl border border-slate-200/60 bg-white shadow-lg">
        <CardHeader>
          <CardTitle>Passwort ändern</CardTitle>
          <CardDescription>
            Für den ersten Login musst du ein neues, sicheres Passwort festlegen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Neues Passwort</Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                minLength={6}
                placeholder="Mindestens 6 Zeichen"
              />
            </div>
            <Button type="submit" className="w-full bg-slate-900 text-white hover:bg-slate-800" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Speichern & Fortfahren"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
