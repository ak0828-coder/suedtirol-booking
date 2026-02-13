"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

function parseHashParams(hash: string) {
  const cleaned = (hash || "").replace(/^#/, "")
  const sp = new URLSearchParams(cleaned)
  const access_token = sp.get("access_token") || ""
  const refresh_token = sp.get("refresh_token") || ""
  const error_description = sp.get("error_description") || sp.get("error") || ""
  return { access_token, refresh_token, error_description }
}

export default function AuthCallbackClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = useMemo(() => createClient(), [])

  const next = searchParams?.get("next") || "/"
  const safeNext = next.startsWith("/") ? next : "/"
  const code = searchParams?.get("code")

  const [message, setMessage] = useState("Login wird abgeschlossen…")

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      try {
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) throw error
          if (!cancelled) router.replace(safeNext)
          return
        }

        const { access_token, refresh_token, error_description } = parseHashParams(window.location.hash)
        if (error_description) throw new Error(error_description)
        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token })
          if (error) throw error
          if (!cancelled) router.replace(safeNext)
          return
        }

        throw new Error("auth_callback_missing_tokens")
      } catch (err) {
        console.error("auth callback failed:", err)
        if (!cancelled) {
          setMessage("Login fehlgeschlagen. Bitte erneut versuchen.")
          router.replace(`/login?error=auth-code-error`)
        }
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [code, router, safeNext, supabase])

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <div className="text-sm text-slate-600">{message}</div>
      </div>
    </div>
  )
}

