"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const COOKIE_KEY = "avaimo_cookie_consent"

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(COOKIE_KEY)) {
      setVisible(true)
    }
  }, [])

  const accept = () => {
    localStorage.setItem(COOKIE_KEY, "accepted")
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-lg p-4 md:p-6 flex flex-col md:flex-row md:items-center gap-4">
        <p className="text-sm text-slate-600 flex-1">
          Diese Website verwendet notwendige Cookies für die Authentifizierung und grundlegende Funktionen.
          Weitere Informationen in unserer{" "}
          <Link href="/de/privacy" className="underline text-slate-800 hover:text-slate-900">
            Datenschutzerklärung
          </Link>
          .
        </p>
        <div className="flex gap-2 shrink-0">
          <Button size="sm" onClick={accept} className="rounded-full">
            Verstanden
          </Button>
        </div>
      </div>
    </div>
  )
}
