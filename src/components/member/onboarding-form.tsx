"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import SignatureCanvas from "react-signature-canvas"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ContractPreview } from "@/components/contract/contract-preview"
import { ContractData } from "@/components/contract/contract-pdf"
import {
  createMembershipCheckout,
  createMembershipOneTimeCheckout,
  markMembershipPaymentOffline,
  submitMembershipSignature,
  updateProfile,
} from "@/app/actions"
import { Eraser, Loader2, PenLine } from "lucide-react"

type Plan = {
  id: string
  name: string
  price: number
  stripe_price_id?: string | null
}

type InitialMember = {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
}

export function MemberOnboardingForm({
  clubSlug,
  clubName,
  clubLogoUrl,
  contractTitle,
  contractBody,
  contractVersion,
  allowSubscription,
  feeEnabled,
  feeAmount,
  plans,
  initialMember,
}: {
  clubSlug: string
  clubName: string
  clubLogoUrl?: string | null
  contractTitle: string
  contractBody: string
  contractVersion: number
  allowSubscription: boolean
  feeEnabled: boolean
  feeAmount: number
  plans: Plan[]
  initialMember: InitialMember
}) {
  const sigPad = useRef<SignatureCanvas>(null)
  const signatureInterval = useRef<ReturnType<typeof setInterval> | null>(null)
  const [signature, setSignature] = useState<string | null>(null)
  const [accepted, setAccepted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentChoice, setPaymentChoice] = useState<"subscription" | "one_time" | "offline">(
    allowSubscription ? "subscription" : feeEnabled ? "one_time" : "offline"
  )
  const [selectedPlanId, setSelectedPlanId] = useState(plans[0]?.id || "")
  const [formData, setFormData] = useState(initialMember)

  useEffect(() => {
    if (plans.length === 1) setSelectedPlanId(plans[0].id)
  }, [plans])

  useEffect(() => {
    return () => {
      if (signatureInterval.current) clearInterval(signatureInterval.current)
    }
  }, [])

  const formattedDate = useMemo(
    () => new Date().toLocaleDateString("de-DE"),
    []
  )

  const replaceTokens = (text: string) => {
    const fee = feeEnabled ? `${feeAmount.toFixed(2).replace(".", ",")} EUR` : "0 EUR"
    return text
      .replace(/{{\s*name\s*}}/gi, `${formData.firstName} ${formData.lastName}`.trim())
      .replace(/{{\s*first_name\s*}}/gi, formData.firstName)
      .replace(/{{\s*last_name\s*}}/gi, formData.lastName)
      .replace(/{{\s*club\s*}}/gi, clubName)
      .replace(/{{\s*email\s*}}/gi, formData.email)
      .replace(/{{\s*phone\s*}}/gi, formData.phone)
      .replace(/{{\s*address\s*}}/gi, formData.address)
      .replace(/{{\s*city\s*}}/gi, formData.city)
      .replace(/{{\s*fee\s*}}/gi, fee)
      .replace(/{{\s*date\s*}}/gi, formattedDate)
  }

  const contractText = useMemo(() => replaceTokens(contractBody || ""), [
    contractBody,
    formData,
    clubName,
    feeAmount,
    feeEnabled,
    formattedDate,
  ])

  const pdfData: ContractData = {
    clubName,
    clubLogoUrl: clubLogoUrl || undefined,
    clubAddress: "",
    memberName: `${formData.firstName} ${formData.lastName}`.trim(),
    memberAddress: formData.address,
    memberEmail: formData.email,
    memberPhone: formData.phone,
    contractText,
    signatureUrl: signature || undefined,
    signedAt: formattedDate,
    signedCity: formData.city || "Ort",
  }

  const setField = (key: keyof InitialMember, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const updateSignaturePreview = (trim = false) => {
    const pad = sigPad.current
    if (!pad) return
    const canvas = trim ? pad.getTrimmedCanvas() : pad.getCanvas()
    setSignature(canvas.toDataURL("image/png"))
  }

  const startSignatureCapture = () => {
    if (signatureInterval.current) clearInterval(signatureInterval.current)
    signatureInterval.current = setInterval(() => updateSignaturePreview(false), 250)
  }

  const endSignatureCapture = () => {
    if (signatureInterval.current) clearInterval(signatureInterval.current)
    signatureInterval.current = null
    updateSignaturePreview(true)
  }

  const clearSignature = () => {
    sigPad.current?.clear()
    setSignature(null)
  }

  const handleSubmit = async () => {
    setError(null)
    if (!accepted) {
      setError("Bitte akzeptiere den Vertrag, um fortzufahren.")
      return
    }
    if (!signature || sigPad.current?.isEmpty()) {
      setError("Bitte unterschreibe in das Feld.")
      return
    }
    setSaving(true)

    const profileData = new FormData()
    profileData.set("firstName", formData.firstName)
    profileData.set("lastName", formData.lastName)
    profileData.set("phone", formData.phone)
    await updateProfile(profileData)

    const res = await submitMembershipSignature(clubSlug, signature, contractVersion)
    if (!res?.success) {
      setSaving(false)
      setError("Signatur konnte nicht gespeichert werden.")
      return
    }

    if (paymentChoice === "subscription") {
      const plan = plans.find((p) => p.id === selectedPlanId)
      if (!plan) {
        setSaving(false)
        setError("Bitte wähle einen Tarif.")
        return
      }
      const result = await createMembershipCheckout(clubSlug, plan.id, plan.stripe_price_id || "")
      if (result?.url) window.location.href = result.url
      else {
        setSaving(false)
        setError("Zahlungslink konnte nicht erstellt werden.")
      }
      return
    }

    if (paymentChoice === "one_time") {
      const result = await createMembershipOneTimeCheckout(clubSlug)
      if (result?.url) window.location.href = result.url
      else {
        setSaving(false)
        setError("Zahlungslink konnte nicht erstellt werden.")
      }
      return
    }

    if (paymentChoice === "offline") {
      await markMembershipPaymentOffline(clubSlug)
    }
    setSaving(false)
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 md:flex-row">
      <div className="w-full md:w-1/2 px-5 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto flex w-full max-w-xl flex-col gap-8">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Avaimo Vertrag</p>
            <h1 className="text-3xl font-semibold text-slate-900">{contractTitle}</h1>
            <p className="text-slate-500">
              Prüfe deine Angaben, unterschreibe und sieh live, wie dein Vertrag aussieht.
            </p>
          </div>

          <Card className="space-y-5 rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Vorname</Label>
                <Input value={formData.firstName} onChange={(e) => setField("firstName", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Nachname</Label>
                <Input value={formData.lastName} onChange={(e) => setField("lastName", e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Adresse</Label>
              <Input value={formData.address} onChange={(e) => setField("address", e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Ort</Label>
                <Input value={formData.city} onChange={(e) => setField("city", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>E-Mail</Label>
                <Input type="email" value={formData.email} onChange={(e) => setField("email", e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Telefon</Label>
              <Input value={formData.phone} onChange={(e) => setField("phone", e.target.value)} />
            </div>
          </Card>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-sm">
                <PenLine className="h-4 w-4" />
                Deine Unterschrift
              </Label>
              <Button variant="ghost" size="sm" onClick={clearSignature} className="h-8 text-red-500">
                <Eraser className="mr-1 h-3 w-3" />
                Löschen
              </Button>
            </div>
            <div className="overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-sm transition-colors hover:border-slate-400">
              <SignatureCanvas
                ref={sigPad}
                penColor="#0f172a"
                velocityFilterWeight={0.7}
                canvasProps={{ className: "h-48 w-full", style: { width: "100%", height: "192px" } }}
                onBegin={startSignatureCapture}
                onEnd={endSignatureCapture}
              />
            </div>
            <p className="text-xs text-slate-400">Bitte unterschreibe im Feld oben.</p>
          </div>

          <div className="space-y-3">
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
              <span>Ich habe den Vertrag gelesen und akzeptiere ihn.</span>
            </label>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
          </div>

          <Card className="space-y-4 rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">Zahlung wählen</div>
            <div className="grid gap-2 text-sm">
              {allowSubscription && plans.length > 0 ? (
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentChoice === "subscription"}
                    onChange={() => setPaymentChoice("subscription")}
                  />
                  Abo per Stripe (jährlich)
                </label>
              ) : null}
              {feeEnabled ? (
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentChoice === "one_time"}
                    onChange={() => setPaymentChoice("one_time")}
                  />
                  Einmalzahlung ({feeAmount}€)
                </label>
              ) : null}
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentChoice === "offline"}
                  onChange={() => setPaymentChoice("offline")}
                />
                Bar/Überweisung (später)
              </label>
            </div>

            {paymentChoice === "subscription" && plans.length > 1 ? (
              <select
                className="w-full rounded-md border px-3 py-2 text-sm"
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
              >
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} – {p.price}€
                  </option>
                ))}
              </select>
            ) : null}
          </Card>

          <Button
            size="lg"
            className="h-14 w-full rounded-full text-base"
            disabled={!accepted || saving}
            onClick={handleSubmit}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Jetzt zahlungspflichtig beitreten"}
          </Button>
        </div>
      </div>

      <div className="hidden w-full bg-slate-200/60 md:flex md:w-1/2 md:items-center md:justify-center md:p-6 lg:p-8">
        <div className="h-[70vh] w-auto aspect-[1/1.414] shadow-2xl lg:h-[80vh]">
          <ContractPreview data={pdfData} className="h-full w-full" />
        </div>
      </div>
    </div>
  )
}
