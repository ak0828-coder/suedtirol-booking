"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Shield, User, ArrowRight } from "lucide-react"
import { getUserRole } from "@/app/actions"
import Link from "next/link"
import { useI18n } from "@/components/i18n/locale-provider"

export default function LoginClient() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const lang = typeof params?.lang === "string" ? params.lang : "de"
  const nextParam = searchParams?.get("next")
  const safeNext = nextParam && /^\/(?!\/)/.test(nextParam) ? nextParam : null
  const forceLogout = searchParams?.get("force_logout") === "1"
  const { t } = useI18n()
  const supabase = createClient()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [showSelection, setShowSelection] = useState(false)
  const [availableRoles, setAvailableRoles] = useState<any[]>([])

  useEffect(() => {
    if (!forceLogout) return
    const signOut = async () => {
      await supabase.auth.signOut()
    }
    signOut()
  }, [forceLogout, supabase])

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
      if (safeNext) {
        router.push(safeNext)
        return
      }

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
        const roles = (result.roles || []).filter((r: any) => r.role === "club_admin")

        if (roles.length === 0) {
          setErrorMessage("Kein Admin-Zugang. Für Mitglieder bitte den Club-Login verwenden.")
          await supabase.auth.signOut()
          setIsLoading(false)
          return
        } else if (roles.length === 1) {
          const r = roles[0]
          router.push(`/${lang}/club/${r.slug}/admin`)
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
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-[#1F3D2B] text-white font-bold text-lg mb-4 shadow-lg">
              A
            </div>
            <h1 className="text-2xl font-semibold">{t("auth.portal.title", "Willkommen zurück")}</h1>
            <p className="text-slate-500 mt-1 text-sm">{t("auth.portal.subtitle", "Wähle, wohin du möchtest:")}</p>
          </div>

          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/60 shadow-sm p-4 sm:p-5 space-y-2">
            {availableRoles.map((role, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsLoading(true)
                  router.push(`/${lang}/club/${role.slug}/admin`)
                }}
                className="w-full flex items-center justify-between p-4 border border-slate-200/60 rounded-xl cursor-pointer hover:bg-slate-50 hover:border-slate-300 transition-all group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-[#1F3D2B]/10">
                    {role.role === "club_admin" ? (
                      <Shield className="w-4 h-4 text-[#1F3D2B]" />
                    ) : (
                      <User className="w-4 h-4 text-[#1F3D2B]" />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{role.name}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                      {role.role === "club_admin"
                        ? t("auth.portal.admin", "Administrator")
                        : t("auth.portal.member", "Mitglied")}
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7] p-4">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-[#1F3D2B] text-white font-bold text-lg mb-4 shadow-lg">
            A
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {t("auth.login.title", "Admin Login")}
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            {t("auth.login.subtitle", "Vereinsverwaltung")}
          </p>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/60 shadow-sm p-6 sm:p-8 space-y-5">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email">{t("auth.login.email", "E-Mail")}</Label>
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
              <div className="flex justify-between items-center">
                <Label htmlFor="password">{t("auth.login.password", "Passwort")}</Label>
                <Link
                  href={`/${lang}/forgot-password`}
                  className="text-xs text-slate-500 hover:text-slate-900 hover:underline"
                >
                  {t("auth.login.forgot", "Vergessen?")}
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
                t("auth.login.cta", "Anmelden")
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
