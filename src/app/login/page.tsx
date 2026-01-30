"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { getMyClubSlug } from "@/app/actions"

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Auto-Logout beim Betreten der Seite, um "Session-Mischmasch" zu verhindern
  useEffect(() => {
    const signOut = async () => {
      await supabase.auth.signOut()
    }
    signOut()
  }, [supabase])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)

    // 1. Login bei Supabase
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setErrorMessage(error.message === "Invalid login credentials" ? "Falsche E-Mail oder Passwort" : error.message)
      setIsLoading(false)
      return
    }

    // 2. Cookies aktualisieren (ganz wichtig!)
    router.refresh()

    // 3. Server fragen: Wohin soll ich?
    try {
        const slug = await getMyClubSlug()

        if (slug === "SUPER_ADMIN_MODE") {
            router.push("/super-admin")
        } else if (slug) {
            router.push(`/club/${slug}/admin`)
        } else {
            // Login erfolgreich, aber kein Club zugeordnet?
            setErrorMessage("Kein Verein gefunden. Bist du sicher, dass du Admin bist?")
            await supabase.auth.signOut() // Wieder ausloggen
        }
    } catch (err) {
        console.error(err)
        setErrorMessage("Server-Fehler beim Abrufen der Daten.")
    } finally {
        setIsLoading(false) // Nur stoppen wenn Fehler oder fertig (bei Redirect egal)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-slate-900 p-8 rounded-xl shadow-lg border dark:border-slate-800">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Admin Login</h1>
          <p className="text-slate-500 mt-2">Südtirol Booking</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail</Label>
            <Input 
              id="email" 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Passwort</Label>
            <Input 
              id="password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">
                {errorMessage}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Anmelden"}
          </Button>
        </form>
      </div>
    </div>
  )
}