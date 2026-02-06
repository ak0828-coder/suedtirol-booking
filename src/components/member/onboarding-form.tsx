"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { submitMembershipSignature, createMembershipCheckout, createMembershipOneTimeCheckout, markMembershipPaymentOffline } from "@/app/actions"
import { Loader2 } from "lucide-react"

type Plan = {
  id: string
  name: string
  price: number
  stripe_price_id?: string | null
}

export function MemberOnboardingForm({
  clubSlug,
  contractTitle,
  contractBody,
  contractVersion,
  allowSubscription,
  feeEnabled,
  feeAmount,
  plans,
}: {
  clubSlug: string
  contractTitle: string
  contractBody: string
  contractVersion: number
  allowSubscription: boolean
  feeEnabled: boolean
  feeAmount: number
  plans: Plan[]
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [paymentChoice, setPaymentChoice] = useState<"subscription" | "one_time" | "offline">(
    allowSubscription ? "subscription" : feeEnabled ? "one_time" : "offline"
  )
  const [selectedPlanId, setSelectedPlanId] = useState(plans[0]?.id || "")

  useEffect(() => {
    if (plans.length === 1) setSelectedPlanId(plans[0].id)
  }, [plans])

  const startDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.strokeStyle = "#0f172a"
    ctx.beginPath()
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
    setIsDrawing(true)
  }

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
    ctx.stroke()
  }

  const endDraw = () => setIsDrawing(false)

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const handleSubmit = async () => {
    if (!accepted) return
    const canvas = canvasRef.current
    if (!canvas) return
    const dataUrl = canvas.toDataURL("image/png")
    setSaving(true)
    const res = await submitMembershipSignature(clubSlug, dataUrl, contractVersion)
    if (!res?.success) {
      setSaving(false)
      return
    }

    if (paymentChoice === "subscription") {
      const plan = plans.find((p) => p.id === selectedPlanId)
      if (!plan) return
      const result = await createMembershipCheckout(clubSlug, plan.id, plan.stripe_price_id || "")
      if (result?.url) window.location.href = result.url
      else setSaving(false)
      return
    }

    if (paymentChoice === "one_time") {
      const result = await createMembershipOneTimeCheckout(clubSlug)
      if (result?.url) window.location.href = result.url
      else setSaving(false)
      return
    }

    if (paymentChoice === "offline") {
      await markMembershipPaymentOffline(clubSlug)
    }
    setSaving(false)
  }

  return (
    <Card className="rounded-2xl border border-slate-200/60 bg-white/80 shadow-sm">
      <CardHeader>
        <CardTitle>{contractTitle}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-xl border border-slate-200/60 bg-slate-50 p-4 max-h-72 overflow-auto text-sm text-slate-700 whitespace-pre-wrap">
          {contractBody || "Kein Vertragstext hinterlegt."}
        </div>

        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
          <span>Ich habe den Vertrag gelesen und akzeptiere ihn.</span>
        </label>

        <div className="space-y-3">
          <div className="text-sm font-medium">Unterschrift</div>
          <canvas
            ref={canvasRef}
            width={560}
            height={160}
            className="w-full rounded-xl border border-slate-200 bg-white"
            onPointerDown={startDraw}
            onPointerMove={draw}
            onPointerUp={endDraw}
            onPointerLeave={endDraw}
          />
          <Button variant="outline" onClick={clearSignature} className="rounded-full">
            Unterschrift löschen
          </Button>
        </div>

        <div className="space-y-3">
          <div className="text-sm font-medium">Zahlung wählen</div>
          <div className="grid gap-2">
            {allowSubscription && plans.length > 0 && (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentChoice === "subscription"}
                  onChange={() => setPaymentChoice("subscription")}
                />
                Abo per Stripe (jährlich)
              </label>
            )}
            {feeEnabled && (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentChoice === "one_time"}
                  onChange={() => setPaymentChoice("one_time")}
                />
                Einmalzahlung ({feeAmount}€)
              </label>
            )}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="payment"
                checked={paymentChoice === "offline"}
                onChange={() => setPaymentChoice("offline")}
              />
              Bar/Überweisung (später)
            </label>
          </div>

          {paymentChoice === "subscription" && plans.length > 1 && (
            <select
              className="w-full border rounded-md px-3 py-2 text-sm"
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} – {p.price}€
                </option>
              ))}
            </select>
          )}
        </div>

        <Button className="w-full rounded-full" disabled={!accepted || saving} onClick={handleSubmit}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Weiter zur Zahlung"}
        </Button>
      </CardContent>
    </Card>
  )
}
