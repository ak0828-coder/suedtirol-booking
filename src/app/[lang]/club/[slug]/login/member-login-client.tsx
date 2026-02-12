"use client"

import { useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { getMemberAccessForClub } from "@/app/actions"

export default function MemberLoginClient() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const lang = typeof params?.lang === "string" ? params.lang : "de"
  const slug = typeof params?.slug === "string" ? params.slug : ""
  const nextParam = searchParams?.get("next")
  const safeNext = nextParam && /^\/(?!\/)/.test(nextParam) ? nextParam : null

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setErrorMessage("Falsche E-Mail oder Passwort.")
      setIsLoading(false)
      return
    }

    const access = await getMemberAccessForClub(slug)
    if (!access?.ok) {
      await supabase.auth.signOut()
      setErrorMessage("Dieses Konto ist kein aktives Mitglied in diesem Verein.")
      setIsLoading(false)
      return
    }

    router.refresh()
    router.push(safeNext || `/${lang}/club/${slug}/dashboard`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7] p-4">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-3xl shadow-lg border border-slate-200/60">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Mitglieder-Login</h1>
          <p className="text-slate-500 mt-2">für {slug}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
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

          {errorMessage ? (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">
              {errorMessage}
            </div>
          ) : null}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Anmelden"}
          </Button>
        </form>
      </div>
    </div>
  )
}

