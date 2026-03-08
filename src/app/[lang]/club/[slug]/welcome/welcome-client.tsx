"use client"

import { useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import SignatureCanvas from "react-signature-canvas"
import { createClient } from "@/lib/supabase/client"
import { setMemberPassword, submitMembershipSignature } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, Eraser, Eye, EyeOff, Loader2 } from "lucide-react"

type ContractField = {
  key: string
  label: string
  type?: "text" | "textarea" | "checkbox"
  required?: boolean
  placeholder?: string | null
}

type Props = {
  sessionId: string
  clubSlug: string
  clubName: string
  clubLogoUrl: string | null
  contractTitle: string
  contractBody: string
  contractVersion: number
  contractFields: ContractField[]
  email: string
  firstName: string
  lastName: string
  phone: string
  isLoggedIn: boolean
  lang: string
}

export function WelcomeClient({
  sessionId,
  clubSlug,
  clubName,
  clubLogoUrl,
  contractTitle,
  contractBody,
  contractVersion,
  contractFields,
  email,
  firstName,
  lastName,
  phone,
  isLoggedIn,
  lang,
}: Props) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const sigPad = useRef<SignatureCanvas>(null)

  const [password, setPassword] = useState("")
  const [confirmPw, setConfirmPw] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [signedCity, setSignedCity] = useState("")
  const [customValues, setCustomValues] = useState<Record<string, string | boolean>>({})
  const [signature, setSignature] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fullName = `${firstName} ${lastName}`.trim() || email

  const contractText = useMemo(() => {
    let text = contractBody || ""
    text = text
      .replace(/\{\{\s*name\s*\}\}/gi, fullName)
      .replace(/\{\{\s*first_name\s*\}\}/gi, firstName)
      .replace(/\{\{\s*last_name\s*\}\}/gi, lastName)
      .replace(/\{\{\s*email\s*\}\}/gi, email)
      .replace(/\{\{\s*phone\s*\}\}/gi, phone)
      .replace(/\{\{\s*club\s*\}\}/gi, clubName)
    for (const field of contractFields) {
      if (!field.key) continue
      const val = customValues[field.key]
      const asText = typeof val === "boolean" ? (val ? "Ja" : "Nein") : val || ""
      text = text.replace(new RegExp(`\\{\\{\\s*${field.key}\\s*\\}\\}`, "gi"), asText)
    }
    return text
  }, [contractBody, firstName, lastName, email, phone, clubName, customValues, contractFields, fullName])

  const handleSignEnd = () => {
    if (sigPad.current && !sigPad.current.isEmpty()) {
      setSignature(sigPad.current.toDataURL("image/png"))
    }
  }

  const handleSubmit = async () => {
    setError(null)

    if (!isLoggedIn) {
      if (password.length < 8) {
        setError("Passwort muss mindestens 8 Zeichen haben.")
        return
      }
      if (password !== confirmPw) {
        setError("Passwörter stimmen nicht überein.")
        return
      }
    }
    if (!accepted) {
      setError("Bitte akzeptiere den Vertrag.")
      return
    }
    if (!signature || sigPad.current?.isEmpty()) {
      setError("Bitte unterschreibe in das Feld.")
      return
    }

    const missingRequired = contractFields.find((f) => {
      if (!f.required) return false
      const val = customValues[f.key]
      if (f.type === "checkbox") return val !== true
      return !val || String(val).trim() === ""
    })
    if (missingRequired) {
      setError(`Bitte fülle das Feld "${missingRequired.label}" aus.`)
      return
    }

    setSaving(true)
    try {
      // Step 1: Set password + sign in (only for new users)
      if (!isLoggedIn) {
        const res = await setMemberPassword(sessionId, password)
        if (!res.success) {
          setError(res.error || "Passwort konnte nicht gesetzt werden.")
          setSaving(false)
          return
        }
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: res.email!,
          password,
        })
        if (signInError) {
          setError("Login fehlgeschlagen: " + signInError.message)
          setSaving(false)
          return
        }
      }

      // Step 2: Sign contract
      const res = await submitMembershipSignature(
        clubSlug,
        signature,
        contractVersion,
        {
          memberName: fullName,
          memberAddress: "",
          memberEmail: email,
          memberPhone: phone,
          signedCity: signedCity || "",
          signedAt: new Date().toLocaleString("de-AT"),
          contractTitle,
          contractText,
          customFields: contractFields
            .filter((f) => f.key && f.label)
            .map((f) => ({
              key: f.key,
              label: f.label,
              value: customValues[f.key] ?? "",
            })),
        }
      )

      if (!res?.success) {
        setError(res?.error || "Vertrag konnte nicht gespeichert werden.")
        setSaving(false)
        return
      }

      // Done — go to dashboard
      router.push(`/${lang}/club/${clubSlug}/dashboard`)
    } catch (err: any) {
      setError(err?.message || "Unbekannter Fehler")
      setSaving(false)
    }
  }

  const pwStrength = (() => {
    if (!password) return 0
    let s = 0
    if (password.length >= 8) s++
    if (/[A-Z]/.test(password)) s++
    if (/[0-9]/.test(password)) s++
    if (/[^A-Za-z0-9]/.test(password)) s++
    return s
  })()

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-6">
          {clubLogoUrl && (
            <img
              src={clubLogoUrl}
              alt={clubName}
              className="h-10 mx-auto mb-4 object-contain"
            />
          )}
          <div className="inline-flex items-center gap-2 text-green-600 text-sm font-medium mb-2">
            <CheckCircle2 className="h-4 w-4" />
            Zahlung erfolgreich
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">Fast geschafft!</h1>
          <p className="text-slate-500 mt-1 text-sm">
            {isLoggedIn
              ? "Unterschreibe den Mitgliedsvertrag, um das Onboarding abzuschließen."
              : "Setze dein Passwort und unterschreibe den Vertrag – dann bist du dabei."}
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm divide-y divide-slate-100">
          {/* Password section (new users only) */}
          {!isLoggedIn && (
            <div className="p-6 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Passwort festlegen
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Passwort</Label>
                  <div className="relative">
                    <Input
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mind. 8 Zeichen"
                      className="pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {password.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            i <= pwStrength
                              ? ["", "bg-red-400", "bg-amber-400", "bg-blue-400", "bg-green-500"][pwStrength]
                              : "bg-slate-100"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label>Bestätigen</Label>
                  <Input
                    type="password"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    placeholder="Wiederholen"
                  />
                  {confirmPw && password === confirmPw && (
                    <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                      <CheckCircle2 className="h-3 w-3" /> Stimmt überein
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Contract */}
          <div className="p-6 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              {contractTitle}
            </p>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 max-h-52 overflow-y-auto text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {contractText || "Kein Vertragstext hinterlegt."}
            </div>

            {/* Custom fields */}
            {contractFields.length > 0 && (
              <div className="space-y-3">
                {contractFields.map((field) => (
                  <div key={field.key} className="space-y-1.5">
                    <Label>
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {field.type === "checkbox" ? (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={customValues[field.key] === true}
                          onChange={(e) =>
                            setCustomValues((v) => ({ ...v, [field.key]: e.target.checked }))
                          }
                          className="h-4 w-4 rounded border-slate-300 accent-slate-900"
                        />
                        <span className="text-sm text-slate-600">{field.placeholder || field.label}</span>
                      </label>
                    ) : field.type === "textarea" ? (
                      <textarea
                        value={String(customValues[field.key] || "")}
                        onChange={(e) =>
                          setCustomValues((v) => ({ ...v, [field.key]: e.target.value }))
                        }
                        placeholder={field.placeholder || ""}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 min-h-[80px]"
                      />
                    ) : (
                      <Input
                        value={String(customValues[field.key] || "")}
                        onChange={(e) =>
                          setCustomValues((v) => ({ ...v, [field.key]: e.target.value }))
                        }
                        placeholder={field.placeholder || ""}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-slate-900 flex-shrink-0"
              />
              <span className="text-sm text-slate-600">
                Ich habe den Vertrag gelesen und akzeptiere die Bedingungen.
              </span>
            </label>
          </div>

          {/* Signature */}
          <div className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Unterschrift
              </p>
              <button
                type="button"
                onClick={() => {
                  sigPad.current?.clear()
                  setSignature(null)
                }}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600"
              >
                <Eraser className="h-3.5 w-3.5" /> Löschen
              </button>
            </div>
            <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden touch-none">
              <SignatureCanvas
                ref={sigPad}
                onEnd={handleSignEnd}
                penColor="#0f172a"
                canvasProps={{ className: "w-full h-28" }}
              />
            </div>
            <p className="text-xs text-slate-400 text-center">
              Mit Maus oder Finger unterschreiben
            </p>

            <div className="space-y-1.5 pt-1">
              <Label className="text-slate-600">
                Ort <span className="text-slate-400 font-normal text-xs">(optional)</span>
              </Label>
              <Input
                value={signedCity}
                onChange={(e) => setSignedCity(e.target.value)}
                placeholder="z.B. Bozen"
                className="max-w-xs"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="p-6 space-y-3">
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm p-3">
                {error}
              </div>
            )}
            <Button
              onClick={handleSubmit}
              disabled={saving}
              className="w-full h-12 rounded-full text-sm font-medium"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Wird gespeichert…
                </>
              ) : (
                "Mitgliedschaft abschließen →"
              )}
            </Button>
            {!isLoggedIn && (
              <p className="text-center text-xs text-slate-400">
                Bereits ein Konto?{" "}
                <a
                  href={`/${lang}/club/${clubSlug}/login?next=/${lang}/club/${clubSlug}/welcome?session_id=${encodeURIComponent(sessionId)}`}
                  className="text-slate-600 underline underline-offset-2"
                >
                  Einloggen
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
