"use client"

import { useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { getMemberAccessForClub } from "@/app/actions"
import Link from "next/link"

type Props = {
  clubName: string
  clubLogoUrl: string | null
  primaryColor: string
}

export default function MemberLoginClient({ clubName, clubLogoUrl, primaryColor }: Props) {
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
  const [showPw, setShowPw] = useState(false)
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

  const initials = clubName.substring(0, 2).toUpperCase()

  return (
    <div
      className="relative min-h-screen overflow-hidden flex items-center justify-center p-6"
      style={{
        background: "#09090b",
        ["--club-primary" as any]: primaryColor,
      }}
    >
      {/* Ambient radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 55% at 50% 110%, color-mix(in srgb, ${primaryColor} 22%, transparent) 0%, transparent 70%)`,
        }}
      />

      {/* Grain texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.028,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "160px",
        }}
      />

      <div className="relative w-full max-w-[360px] anim-scale-in">
        {/* Club branding */}
        <div className="flex flex-col items-center mb-8 anim-fade-up">
          <div className="relative mb-5">
            {/* Glow behind logo */}
            <div
              className="absolute inset-0 rounded-3xl blur-2xl opacity-60 scale-110"
              style={{ backgroundColor: primaryColor }}
            />
            <div
              className="relative w-20 h-20 rounded-3xl flex items-center justify-center text-white text-2xl font-bold overflow-hidden ring-1 ring-white/10"
              style={{ backgroundColor: primaryColor }}
            >
              {clubLogoUrl ? (
                <img src={clubLogoUrl} alt={clubName} className="w-full h-full object-cover" />
              ) : (
                <span className="font-extrabold">{initials}</span>
              )}
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">{clubName}</h1>
          <p className="label-caps text-white/35 mt-1.5">Mitglieder-Login</p>
        </div>

        {/* Glass card */}
        <div
          className="rounded-3xl p-7 space-y-5 anim-fade-up anim-stagger-1"
          style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(24px) saturate(160%)",
            WebkitBackdropFilter: "blur(24px) saturate(160%)",
            border: "1px solid rgba(255,255,255,0.09)",
          }}
        >
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="label-caps text-white/40 block">
                E-Mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="deine@email.com"
                className="input-dark w-full h-12 rounded-2xl px-4 text-sm"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="label-caps text-white/40">
                  Passwort
                </label>
                <Link
                  href={`/${lang}/forgot-password?after=/${lang}/club/${slug}/dashboard`}
                  className="text-[11px] font-light text-white/30 hover:text-white/60 transition-colors"
                >
                  Vergessen?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="input-dark w-full h-12 rounded-2xl px-4 pr-11 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl text-sm text-red-300 anim-slide-up"
                style={{
                  background: "rgba(239,68,68,0.10)",
                  border: "1px solid rgba(239,68,68,0.20)",
                }}
              >
                {errorMessage}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-full font-semibold text-sm text-white btn-press transition-opacity disabled:opacity-60 mt-1"
              style={{
                backgroundColor: primaryColor,
                boxShadow: `0 0 24px color-mix(in srgb, ${primaryColor} 35%, transparent)`,
              }}
            >
              {isLoading ? (
                <Loader2 className="animate-spin h-4 w-4 mx-auto" />
              ) : (
                "Anmelden"
              )}
            </button>
          </form>

          <div className="text-center pt-1">
            <Link
              href={`/${lang}/club/${slug}`}
              className="text-[11px] font-light text-white/25 hover:text-white/55 transition-colors"
            >
              ← Zurück zur Clubseite
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
