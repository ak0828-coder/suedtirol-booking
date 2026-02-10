"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Shield, User, ArrowRight } from "lucide-react"
import { getUserRole } from "@/app/actions"
import Link from "next/link"
import { useI18n } from "@/components/i18n/locale-provider"

export default function LoginPage() {
  const router = useRouter()
  const params = useParams()
  const lang = typeof params?.lang === "string" ? params.lang : "de"
  const { t } = useI18n()
  const supabase = createClient()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [showSelection, setShowSelection] = useState(false)
  const [availableRoles, setAvailableRoles] = useState<any[]>([])

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

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setErrorMessage(t("auth.login.error", "Falsche E-Mail oder Passwort."))
      setIsLoading(false)
      return
    }

    router.refresh()

    try {
      const result = await getUserRole()

      if (!result) {
        setErrorMessage(t("auth.login.profile_error", "Fehler beim Laden des Profils."))
        await supabase.auth.signOut()
        setIsLoading(false)
        return
      }

      if (result.type === "super_admin") {
        router.push(`/${lang}/super-admin`)
        return
      }

      if (result.type === "multi") {
        const roles = result.roles || []

        if (roles.length === 0) {
          setErrorMessage(t("auth.login.no_club", "Keine Vereine gefunden. Bitte registriere dich erst."))
          await supabase.auth.signOut()
          setIsLoading(false)
        } else if (roles.length === 1) {
          const r = roles[0]
          if (r.role === "club_admin") router.push(`/${lang}/club/${r.slug}/admin`)
          else router.push(`/${lang}/club/${r.slug}/dashboard`)
        } else {
          setAvailableRoles(roles)
          setShowSelection(true)
          setIsLoading(false)
        }
      }
    } catch (err) {
      console.error(err)
      setErrorMessage(t("auth.login.generic_error", "Login-Fehler."))
      setIsLoading(false)
    }
  }

  if (showSelection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7] p-4">
        <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-3xl shadow-lg border border-slate-200/60">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">{t("auth.portal.title", "Willkommen zurück")}</h1>
            <p className="text-slate-500 mt-2">{t("auth.portal.subtitle", "Wähle, wohin du möchtest:")}</p>
          </div>

          <div className="space-y-3">
            {availableRoles.map((role, index) => (
              <div
                key={index}
                onClick={() => {
                  setIsLoading(true)
                  if (role.role === "club_admin") router.push(`/${lang}/club/${role.slug}/admin`)
                  else router.push(`/${lang}/club/${role.slug}/dashboard`)
                }}
                className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-slate-50 hover:border-slate-300 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-full ${role.role === "club_admin" ? "bg-indigo-100 text-indigo-700" : "bg-green-100 text-green-700"}`}
                  >
                    {role.role === "club_admin" ? <Shield className="w-5 h-5" /> : <User className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="font-semibold">{role.name}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                      {role.role === "club_admin" ? t("auth.portal.admin", "Administrator") : t("auth.portal.member", "Mitglied")}
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7] p-4">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-3xl shadow-lg border border-slate-200/60">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{t("auth.login.title", "Login")}</h1>
          <p className="text-slate-500 mt-2">{t("auth.login.subtitle", "Südtirol Booking")}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">{t("auth.login.email", "E-Mail")}</Label>
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
              <Label htmlFor="password">{t("auth.login.password", "Passwort")}</Label>
              <Link href={`/${lang}/forgot-password`} className="text-xs text-indigo-600 hover:underline">
                {t("auth.login.forgot", "Vergessen?")}
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
            {isLoading ? <Loader2 className="animate-spin mr-2" /> : t("auth.login.cta", "Anmelden")}
          </Button>
        </form>
      </div>
    </div>
  )
}

