"use client"

import { useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { getMemberAccessForClub } from "@/app/actions"
import Link from "next/link"

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
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-[#1F3D2B] text-white font-bold text-lg mb-4 shadow-lg">
            {slug.substring(0, 2).toUpperCase() || "TC"}
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">Mitglieder-Login</h1>
          <p className="text-slate-500 mt-1 text-sm">{slug}</p>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200/60 p-6 sm:p-8 space-y-5">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-xl h-11"
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Passwort</Label>
                <Link
                  href={`/${lang}/forgot-password?after=/${lang}/club/${slug}/dashboard`}
                  className="text-xs text-slate-500 hover:text-slate-900 hover:underline"
                >
                  Passwort vergessen?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-xl h-11"
                autoComplete="current-password"
              />
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                {errorMessage}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 rounded-full text-sm font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Anmelden...
                </>
              ) : (
                "Anmelden"
              )}
            </Button>
          </form>

          <div className="text-center pt-1">
            <Link
              href={`/${lang}/club/${slug}`}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              ← Zurück zum Club
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
