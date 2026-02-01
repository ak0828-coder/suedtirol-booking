"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Shield, User, ArrowRight } from "lucide-react"
import { getUserRole } from "@/app/actions" 
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Für die Auswahl-Ansicht (Portal)
  const [showSelection, setShowSelection] = useState(false)
  const [availableRoles, setAvailableRoles] = useState<any[]>([])

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

    // 1. Supabase Auth Login
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setErrorMessage("Falsche E-Mail oder Passwort.")
      setIsLoading(false)
      return
    }

    router.refresh()

    try {
        // 2. Server fragen: "Welche Rollen habe ich?"
        const result = await getUserRole()

        if (!result) {
             setErrorMessage("Fehler beim Laden des Profils.")
             await supabase.auth.signOut()
             setIsLoading(false)
             return
        }

        // A. Super Admin -> Direkt weiter
        if (result.type === 'super_admin') {
            router.push("/super-admin")
            return
        }

        // B. Normale User prüfen (Multi-Role Check)
        if (result.type === 'multi') {
            const roles = result.roles || []

            if (roles.length === 0) {
                setErrorMessage("Keine Vereine gefunden. Bitte registriere dich erst.")
                await supabase.auth.signOut()
                setIsLoading(false)
            } 
            else if (roles.length === 1) {
                // Nur eine Rolle -> Direkt weiterleiten (kein Auswahl-Screen nötig)
                const r = roles[0]
                if (r.role === 'club_admin') router.push(`/club/${r.slug}/admin`)
                else router.push(`/club/${r.slug}/dashboard`)
            } 
            else {
                // C. MEHRERE ROLLEN -> PORTAL-AUSWAHL ANZEIGEN
                setAvailableRoles(roles)
                setShowSelection(true)
                setIsLoading(false) // Spinner stoppen, damit User wählen kann
            }
        }

    } catch (err) {
        console.error(err)
        setErrorMessage("Login-Fehler.")
        setIsLoading(false)
    }
  }

  // --- AUSWAHL SCREEN (Portal: Wenn User mehrere Rollen hat) ---
  if (showSelection) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
            <div className="w-full max-w-md space-y-6 bg-white dark:bg-slate-900 p-8 rounded-xl shadow-lg border dark:border-slate-800">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">Willkommen zurück! 👋</h1>
                    <p className="text-slate-500 mt-2">Wähle, wohin du möchtest:</p>
                </div>

                <div className="space-y-3">
                    {availableRoles.map((role, index) => (
                        <div 
                            key={index}
                            onClick={() => {
                                setIsLoading(true)
                                if (role.role === 'club_admin') router.push(`/club/${role.slug}/admin`)
                                else router.push(`/club/${role.slug}/dashboard`)
                            }}
                            className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-slate-50 hover:border-slate-300 transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${role.role === 'club_admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-green-100 text-green-700'}`}>
                                    {role.role === 'club_admin' ? <Shield className="w-5 h-5"/> : <User className="w-5 h-5"/>}
                                </div>
                                <div>
                                    <div className="font-semibold">{role.name}</div>
                                    <div className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                                        {role.role === 'club_admin' ? 'Administrator' : 'Mitglied'}
                                    </div>
                                </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-slate-600" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )
  }

  // --- STANDARD LOGIN SCREEN ---
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
            <div className="flex justify-between items-center">
                <Label htmlFor="password">Passwort</Label>
                <Link href="/forgot-password" className="text-xs text-indigo-600 hover:underline">
                    Vergessen?
                </Link>
            </div>
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