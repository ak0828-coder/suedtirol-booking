"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { getUserRole } from "@/app/actions" // <--- Update auf getUserRole

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Auto-Logout beim Betreten, um Session-Konflikte zu vermeiden
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

    // 1. Supabase Login
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setErrorMessage("Falsche E-Mail oder Passwort.")
      setIsLoading(false)
      return
    }

    // Router refresh damit Server Components den neuen Auth-Status mitbekommen
    router.refresh()

    try {
        // 2. Server fragen: "Wer bin ich?" (Nutzt neue getUserRole Action)
        const result = await getUserRole()

        if (!result) {
             setErrorMessage("Benutzer konnte nicht identifiziert werden.")
             await supabase.auth.signOut()
             setIsLoading(false)
             return
        }

        // 3. Weiche stellen
        if (result.role === 'super_admin') {
            router.push("/super-admin")
        } else if (result.role === 'club_admin' && result.slug) {
            router.push(`/club/${result.slug}/admin`)
        } else if (result.role === 'member' && result.slug) {
            router.push(`/club/${result.slug}/dashboard`) // <--- ZIEL FÜR MITGLIEDER
        } else {
            // Benutzer existiert, hat aber keine spezielle Rolle
            // Leite auf Startseite weiter
            router.push("/") 
        }
    } catch (err) {
        console.error(err)
        setErrorMessage("Server-Fehler beim Abrufen der Daten.")
    } finally {
        // isLoading nicht auf false setzen, wenn wir pushen (verhindert Flackern)
        // nur im Fehlerfall stoppen wir den Spinner hier, 
        // oder wenn der Router Push sehr lange dauert (Timeout Handling optional)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-slate-900 p-8 rounded-xl shadow-lg border dark:border-slate-800">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Login</h1>
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