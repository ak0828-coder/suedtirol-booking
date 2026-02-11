"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import SignatureCanvas from "react-signature-canvas"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ContractPreview } from "@/components/contract/contract-preview"
import { ContractData } from "@/components/contract/contract-pdf"
import { createMembershipCheckout, ensureGuestAccount, submitMembershipSignature, updateProfile } from "@/app/actions"
import { Eraser, Loader2, PenLine } from "lucide-react"
import { useI18n } from "@/components/i18n/locale-provider"
import { useParams, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

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

type ContractField = {
  key: string
  label: string
  type?: "text" | "textarea" | "checkbox"
  required?: boolean
  placeholder?: string | null
}

export function MemberOnboardingForm({
  clubSlug,
  clubName,
  clubLogoUrl,
  contractTitle,
  contractBody,
  contractVersion,
  contractFields,
  allowSubscription,
  feeEnabled,
  feeAmount,
  plans,
  initialMember,
  guestMode = false,
  prePayment = false,
}: {
  clubSlug: string
  clubName: string
  clubLogoUrl?: string | null
  contractTitle: string
  contractBody: string
  contractVersion: number
  contractFields: ContractField[]
  allowSubscription: boolean
  feeEnabled: boolean
  feeAmount: number
  plans: Plan[]
  initialMember: InitialMember
  guestMode?: boolean
  prePayment?: boolean
}) {
  const { t } = useI18n()
  const params = useParams()
  const searchParams = useSearchParams()
  const langRaw = params?.lang
  const lang = typeof langRaw === "string" ? langRaw : Array.isArray(langRaw) ? langRaw[0] : "de"
  const locale = lang === "it" ? "it-IT" : lang === "en" ? "en-US" : "de-DE"
  const isPostPayment = searchParams?.get("post_payment") === "1"

  const sigPad = useRef<SignatureCanvas>(null)
  const signatureInterval = useRef<ReturnType<typeof setInterval> | null>(null)
  const [signature, setSignature] = useState<string | null>(null)
  const [accepted, setAccepted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const initialPlanId = searchParams?.get("plan") || plans[0]?.id || ""
  const [selectedPlanId, setSelectedPlanId] = useState(initialPlanId)
  const [formData, setFormData] = useState(initialMember)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [customValues, setCustomValues] = useState<Record<string, string | boolean>>({})
  const [hasSession, setHasSession] = useState(false)
  useEffect(() => {
    if (plans.length === 1) setSelectedPlanId(plans[0].id)
  }, [plans])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      const email = data?.user?.email || ""
      setHasSession(!!data?.user)
      if (email && !formData.email) {
        setFormData((prev) => ({ ...prev, email }))
      }
    })
  }, [])

  useEffect(() => {
    return () => {
      if (signatureInterval.current) clearInterval(signatureInterval.current)
    }
  }, [])

  const formatPrice = (value: number) =>
    Number(value || 0).toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const formattedDate = useMemo(() => new Date().toLocaleDateString(locale), [locale])

  const replaceTokens = (text: string) => {
    const selectedPlan = plans.find((p) => p.id === selectedPlanId)
    const feeValue = selectedPlan?.price ?? (feeEnabled ? feeAmount : 0)
    const fee = `${formatPrice(feeValue || 0)} EUR`
    let result = text
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

    for (const field of contractFields) {
      const value = customValues[field.key]
      const asText = typeof value === "boolean" ? (value ? t("member_onboarding.yes", "Ja") : t("member_onboarding.no", "Nein")) : value || ""
      if (!field.key) continue
      const pattern = new RegExp(`{{\\s*${field.key}\\s*}}`, "gi")
      result = result.replace(pattern, asText)
    }
    return result
  }

  const contractText = useMemo(() => replaceTokens(contractBody || ""), [
    contractBody,
    formData,
    clubName,
    feeAmount,
    feeEnabled,
    formattedDate,
    contractFields,
    customValues,
    selectedPlanId,
    plans,
  ])

  const pdfData: ContractData = {
    clubName,
    clubLogoUrl: clubLogoUrl || undefined,
    clubAddress: "",
    contractTitle,
    memberName: `${formData.firstName} ${formData.lastName}`.trim(),
    memberAddress: formData.address,
    memberEmail: formData.email,
    memberPhone: formData.phone,
    customFields: contractFields
      .filter((field) => field.key && field.label)
      .map((field) => {
        const value = customValues[field.key]
        return {
          label: field.label,
          value: typeof value === "boolean" ? (value ? t("member_onboarding.yes", "Ja") : t("member_onboarding.no", "Nein")) : value || "",
        }
      }),
    contractText,
    signatureUrl: signature || undefined,
    signedAt: formattedDate,
    signedCity: formData.city || t("member_onboarding.city_fallback", "Ort"),
    lang,
  }

  const setField = (key: keyof InitialMember, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const setCustomValue = (key: string, value: string | boolean) => {
    setCustomValues((prev) => ({ ...prev, [key]: value }))
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
    if (prePayment) {
      const plan = plans.find((p) => p.id === selectedPlanId)
      if (!plan) {
        setError(t("member_onboarding.error_plan", "Bitte wähle einen Tarif."))
        return
      }
      if (!hasSession) {
        if (!formData.email || !formData.email.includes("@")) {
          setError(t("member_onboarding.error_email", "Bitte eine gültige E-Mail angeben."))
          return
        }
        if (!password || password.length < 8) {
          setError(t("member_onboarding.error_password", "Bitte ein Passwort mit mindestens 8 Zeichen angeben."))
          return
        }
        if (password !== confirmPassword) {
          setError(t("member_onboarding.error_password_match", "Passwörter stimmen nicht überein."))
          return
        }
      }
      setSaving(true)

      if (!hasSession) {
        const ensured = await ensureGuestAccount({
          email: formData.email,
          password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
        })
        if (!ensured?.success) {
          setSaving(false)
          setError(ensured?.error || t("member_onboarding.error_account", "Account konnte nicht erstellt werden."))
          return
        }
        if (ensured?.exists) {
          setSaving(false)
          setError(
            t(
              "member_onboarding.error_existing",
              "Es gibt bereits ein Konto mit dieser E-Mail. Bitte einloggen oder Passwort zurücksetzen."
            )
          )
          return
        }

        const supabase = createClient()
        const { data: sessionData, error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password,
        })
        if (!sessionData?.user || signInError) {
          setSaving(false)
          setError(signInError?.message || t("member_onboarding.error_login", "Login fehlgeschlagen. Bitte Passwort prüfen."))
          return
        }
      }

      const profileData = new FormData()
      profileData.set("firstName", formData.firstName)
      profileData.set("lastName", formData.lastName)
      profileData.set("phone", formData.phone)
      await updateProfile(profileData)

      const result = await createMembershipCheckout(clubSlug, plan.id, plan.stripe_price_id || "")
      if (result?.url) {
        window.location.href = result.url
        return
      }
      setSaving(false)
      setError(result?.error || t("member_onboarding.error_payment", "Zahlungslink konnte nicht erstellt werden."))
      return
    }

    if (guestMode) {
      if (!formData.email || !formData.email.includes("@")) {
        setError(t("member_onboarding.error_email", "Bitte eine gültige E-Mail angeben."))
        return
      }
      if (!password || password.length < 8) {
        setError(t("member_onboarding.error_password", "Bitte ein Passwort mit mindestens 8 Zeichen angeben."))
        return
      }
      if (password !== confirmPassword) {
        setError(t("member_onboarding.error_password_match", "Passwörter stimmen nicht überein."))
        return
      }
      const plan = plans.find((p) => p.id === selectedPlanId)
      if (!plan) {
        setError(t("member_onboarding.error_plan", "Bitte wähle einen Tarif."))
        return
      }
      setSaving(true)

      const ensured = await ensureGuestAccount({
        email: formData.email,
        password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      })
      if (!ensured?.success) {
        setSaving(false)
        setError(ensured?.error || t("member_onboarding.error_account", "Account konnte nicht erstellt werden."))
        return
      }
      if (ensured?.exists) {
        setSaving(false)
        setError(
          t(
            "member_onboarding.error_existing",
            "Es gibt bereits ein Konto mit dieser E-Mail. Bitte einloggen oder Passwort zurücksetzen."
          )
        )
        return
      }

      const supabase = createClient()
      const { data: sessionData, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password,
      })
      if (!sessionData?.user || signInError) {
        setSaving(false)
        setError(signInError?.message || t("member_onboarding.error_login", "Login fehlgeschlagen. Bitte Passwort prüfen."))
        return
      }

      const profileData = new FormData()
      profileData.set("firstName", formData.firstName)
      profileData.set("lastName", formData.lastName)
      profileData.set("phone", formData.phone)
      await updateProfile(profileData)

      const result = await createMembershipCheckout(clubSlug, plan.id, plan.stripe_price_id || "")
      if (result?.url) {
        window.location.href = result.url
        return
      }
      setSaving(false)
      setError(result?.error || t("member_onboarding.error_payment", "Zahlungslink konnte nicht erstellt werden."))
      return
    }
    if (!accepted) {
      setError(t("member_onboarding.error_accept", "Bitte akzeptiere den Vertrag, um fortzufahren."))
      return
    }
    if (!signature || sigPad.current?.isEmpty()) {
      setError(t("member_onboarding.error_signature", "Bitte unterschreibe in das Feld."))
      return
    }

    const missingRequired = contractFields.find((field) => {
      if (!field.required) return false
      const value = customValues[field.key]
      if (field.type === "checkbox") return value === true
      return typeof value === "string" ? value.trim().length === 0 : true
    })
    if (missingRequired) {
      const message = t("member_onboarding.error_missing", "Bitte fÃ¼lle das Feld {field} aus.")
      setError(message.replace("{field}", missingRequired.label))
      return
    }
    setSaving(true)

    const profileData = new FormData()
    profileData.set("firstName", formData.firstName)
    profileData.set("lastName", formData.lastName)
    profileData.set("phone", formData.phone)
    await updateProfile(profileData)

    const res = await submitMembershipSignature(
      clubSlug,
      signature,
      contractVersion,
      {
        memberName: `${formData.firstName} ${formData.lastName}`.trim(),
        memberAddress: formData.address,
        memberEmail: formData.email,
        memberPhone: formData.phone,
        signedCity: formData.city || t("member_onboarding.city_fallback", "Ort"),
        signedAt: formattedDate,
        contractTitle,
        contractText,
        customFields: contractFields
          .filter((field) => field.key && field.label)
          .map((field) => ({
            key: field.key,
            label: field.label,
            value: customValues[field.key] ?? "",
          })),
      }
    )
    if (!res?.success) {
      setSaving(false)
      setError(t("member_onboarding.error_save", "Signatur konnte nicht gespeichert werden."))
      return
    }

    if (isPostPayment) {
      window.location.href = `/${lang}/club/${clubSlug}/dashboard`
      return
    }

    const plan = plans.find((p) => p.id === selectedPlanId)
    if (!plan) {
      setSaving(false)
      setError(t("member_onboarding.error_plan", "Bitte wÃ¤hle einen Tarif."))
      return
    }
    const result = await createMembershipCheckout(clubSlug, plan.id, plan.stripe_price_id || "")
    if (result?.url) window.location.href = result.url
    else {
      setSaving(false)
      setError(t("member_onboarding.error_payment", "Zahlungslink konnte nicht erstellt werden."))
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 md:flex-row">
      <div className="w-full md:w-1/2 px-5 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto flex w-full max-w-xl flex-col gap-8">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{t("member_onboarding.kicker", "Avaimo Vertrag")}</p>
            <h1 className="text-3xl font-semibold text-slate-900">{contractTitle}</h1>
            <p className="text-slate-500">
              {t("member_onboarding.subhead", "PrÃ¼fe deine Angaben, unterschreibe und sieh live, wie dein Vertrag aussieht.")}
            </p>
          </div>

          <Card className="space-y-5 rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("member_onboarding.first", "Vorname")}</Label>
                <Input value={formData.firstName} onChange={(e) => setField("firstName", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t("member_onboarding.last", "Nachname")}</Label>
                <Input value={formData.lastName} onChange={(e) => setField("lastName", e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("member_onboarding.email", "E-Mail")}</Label>
              <Input type="email" value={formData.email} onChange={(e) => setField("email", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("member_onboarding.phone", "Telefon")}</Label>
              <Input value={formData.phone} onChange={(e) => setField("phone", e.target.value)} />
            </div>
            {guestMode && !hasSession ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("member_onboarding.password", "Passwort")}</Label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{t("member_onboarding.password_confirm", "Passwort bestätigen")}</Label>
                  <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </div>
              </div>
            ) : null}
            {!guestMode ? (
              <>
                <div className="space-y-2">
                  <Label>{t("member_onboarding.address", "Adresse")}</Label>
                  <Input value={formData.address} onChange={(e) => setField("address", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{t("member_onboarding.city", "Ort")}</Label>
                  <Input value={formData.city} onChange={(e) => setField("city", e.target.value)} />
                </div>
              </>
            ) : null}
          </Card>

          {!guestMode && !prePayment && contractFields.length > 0 ? (
            <Card className="space-y-4 rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">{t("member_onboarding.more", "Weitere Angaben")}</div>
              {contractFields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label>
                    {field.label}
                    {field.required ? " *" : ""}
                  </Label>
                  {field.type === "textarea" ? (
                    <Textarea
                      value={String(customValues[field.key] ?? "")}
                      onChange={(e) => setCustomValue(field.key, e.target.value)}
                      rows={3}
                      placeholder={field.placeholder || undefined}
                    />
                  ) : field.type === "checkbox" ? (
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={customValues[field.key] === true}
                        onChange={(e) => setCustomValue(field.key, e.target.checked)}
                      />
                      <span>{field.placeholder || t("member_onboarding.checkbox", "Ich stimme zu")}</span>
                    </label>
                  ) : (
                    <Input
                      value={String(customValues[field.key] ?? "")}
                      onChange={(e) => setCustomValue(field.key, e.target.value)}
                      placeholder={field.placeholder || undefined}
                    />
                  )}
                </div>
              ))}
            </Card>
          ) : null}

          {!guestMode && !prePayment ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-sm">
                  <PenLine className="h-4 w-4" />
                  {t("member_onboarding.signature", "Deine Unterschrift")}
                </Label>
                <Button variant="ghost" size="sm" onClick={clearSignature} className="h-8 text-red-500">
                  <Eraser className="mr-1 h-3 w-3" />
                  {t("member_onboarding.clear", "LÃ¶schen")}
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
              <p className="text-xs text-slate-400">{t("member_onboarding.signature_hint", "Bitte unterschreibe im Feld oben.")}</p>
            </div>
          ) : null}

          {!guestMode && !prePayment ? (
            <div className="space-y-3">
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
                <span>{t("member_onboarding.accept", "Ich habe den Vertrag gelesen und akzeptiere ihn.")}</span>
              </label>
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
            </div>
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : null}

          {prePayment && (
            <Card className="space-y-4 rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">{t("member_onboarding.plan_title", "Abo wÃ¤hlen")}</div>
              {plans.length > 1 ? (
                <select
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} â€“ {formatPrice(p.price)}â‚¬
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-sm text-slate-600">
                  {plans[0]?.name} – {formatPrice(plans[0]?.price || 0)}€ {t("member_onboarding.per_year", "pro Jahr")}
                </div>
              )}
            </Card>
          )}

          <Button
            size="lg"
            className="h-14 w-full rounded-full text-base"
            disabled={(guestMode ? saving : !accepted || saving)}
            onClick={handleSubmit}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isPostPayment ? (
              t("member_onboarding.cta_finish", "Onboarding abschließen")
            ) : prePayment ? (
              t("member_onboarding.cta_pay", "Jetzt bezahlen")
            ) : (
              t("member_onboarding.cta", "Jetzt zahlungspflichtig beitreten")
            )}
          </Button>
        </div>
      </div>

      {!guestMode && !isPostPayment && !prePayment ? (
        <div className="hidden w-full bg-slate-200/60 md:flex md:w-1/2 md:items-center md:justify-center md:p-6 lg:p-8">
          <div className="h-[70vh] w-auto aspect-[1/1.414] shadow-2xl lg:h-[80vh]">
            <ContractPreview data={pdfData} className="h-full w-full" />
          </div>
        </div>
      ) : null}
    </div>
  )
}


