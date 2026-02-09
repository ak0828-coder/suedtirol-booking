"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { createStripeConnectAccount, checkStripeStatus } from "@/app/actions"
import { Loader2, CheckCircle, CreditCard, AlertCircle } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

export function StripeConnectButton({
  clubSlug,
  initialConnected,
}: {
  clubSlug: string
  initialConnected: boolean
}) {
  const [loading, setLoading] = useState(false)
  const [connected, setConnected] = useState(initialConnected)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    if (searchParams.get("stripe_connected") === "true") {
      verifyStatus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const verifyStatus = async () => {
    setLoading(true)
    setError(null)
    const res = await checkStripeStatus(clubSlug)
    setConnected(res?.connected || false)
    setLoading(false)
    if (res?.error) setError(res.error)
    router.refresh()
  }

  const handleConnect = async () => {
    setLoading(true)
    setError(null)
    const res = await createStripeConnectAccount(clubSlug)
    if (res?.url) {
      window.location.href = res.url
      return
    }
    setLoading(false)
    setError(res?.error || "Unbekannter Fehler")
  }

  if (connected) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 flex items-start gap-4">
        <div className="bg-emerald-100 p-2 rounded-full text-emerald-600 mt-1">
          <CheckCircle className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-semibold text-emerald-800 text-lg">Auszahlungen aktiv</h4>
          <p className="text-emerald-700">
            Der Verein ist erfolgreich mit Stripe verbunden. Zahlungen werden automatisch
            weitergeleitet.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-4 mb-4">
        <div className="bg-[#635BFF]/10 p-3 rounded-full text-[#635BFF]">
          <CreditCard className="w-8 h-8" />
        </div>
        <div>
          <h3 className="font-semibold text-xl text-slate-900">Online-Zahlungen aktivieren</h3>
          <p className="text-slate-500">
            Verbinde das Bankkonto des Vereins, um Zahlungen zu empfangen.
          </p>
        </div>
      </div>

      <div className="bg-blue-50 text-blue-800 text-sm p-3 rounded-md mb-6 flex gap-2">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <p>Du wirst zu Stripe weitergeleitet, um die Identität des Vereins zu bestätigen.</p>
      </div>

      <Button
        onClick={handleConnect}
        disabled={loading}
        className="w-full py-6 text-lg bg-[#635BFF] hover:bg-[#534be0] text-white transition-all shadow-md hover:shadow-lg"
      >
        {loading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : null}
        Jetzt mit Stripe verbinden
      </Button>
      {error ? <div className="mt-3 text-sm text-red-600">{error}</div> : null}
    </div>
  )
}
