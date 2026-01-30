"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { getMyClubSlug } from "@/app/actions" // <--- Importieren

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Sicherheitshalber beim Laden ausloggen (Good Practice)
  useEffect(() => {
    const signOut = async () => {
      await supabase.auth.signOut()
    }
    signOut()
  }, [supabase])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert("Fehler: " + error.message)
      setIsLoading(false)
      return
    }

    router.refresh()

    // 1. Bist DU es? (Super Admin)
    if (email.toLowerCase() === "alexander.kofler06@gmail.com") {
      router.push("/super-admin")
      return
    }

    // 2. Ist es ein VEREIN? (Dynamische Suche)
    // Wir fragen den Server: "Zu welchem Club gehört diese Email?"
    try {
        const slug = await getMyClubSlug()

        if (slug) {
          // Treffer! Ab zum richtigen Dashboard
          router.push(`/club/${slug}/admin`)
        } else {
          // Kein Verein gefunden? Vielleicht nur ein normaler Spieler oder Fehler
          router.push("/") 
        }
    } catch (err) {
        console.error("Fehler beim Abrufen des Clubs:", err)
        alert("Ein unerwarteter Fehler ist aufgetreten.")
        setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-slate-900 p-8 rounded-xl shadow-lg border dark:border-slate-800">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Willkommen zurück</h1>
          <p className="text-slate-500 mt-2">Bitte melde dich an.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="name@example.com" 
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

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Anmelden"}
          </Button>
        </form>
      </div>
    </div>
  )
}