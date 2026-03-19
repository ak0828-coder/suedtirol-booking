"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import SignatureCanvas from "react-signature-canvas"
import { ContractPreview } from "@/components/contract/contract-preview"
import { ContractData } from "@/components/contract/contract-pdf"
import { createMembershipCheckout, submitMembershipSignature, updateProfile } from "@/app/actions"
import { Eraser, Loader2, PenLine, ChevronRight, CheckCircle2, ShieldCheck, Mail, User, MapPin, Phone, Zap, FileText } from "lucide-react"
import { useI18n } from "@/components/i18n/locale-provider"
import { useParams, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"

// --- Reusable Premium Components ---

function SpotlightCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const divRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return
    const div = divRef.current
    const rect = div.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    div.style.setProperty("--mouse-x", `${x}px`)
    div.style.setProperty("--mouse-y", `${y}px`)
  }

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      className={`relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.02] group/spotlight ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover/spotlight:opacity-100"
        style={{
          background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(203,191,154,0.1), transparent 40%)`,
        }}
      />
      {children}
    </div>
  )
}

type Plan = { id: string; name: string; price: number; stripe_price_id?: string | null }
type InitialMember = { firstName: string; lastName: string; email: string; phone: string; address: string; city: string }
type ContractField = { key: string; label: string; type?: "text" | "textarea" | "checkbox"; required?: boolean; placeholder?: string | null }

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
  clubSlug: string; clubName: string; clubLogoUrl?: string | null; contractTitle: string; contractBody: string; contractVersion: number; contractFields: ContractField[]; allowSubscription: boolean; feeEnabled: boolean; feeAmount: number; plans: Plan[]; initialMember: InitialMember; guestMode?: boolean; prePayment?: boolean;
}) {
  const { t } = useI18n()
  const params = useParams()
  const searchParams = useSearchParams()
  const lang = (params?.lang as string) || "de"
  const locale = lang === "it" ? "it-IT" : lang === "en" ? "en-US" : "de-DE"
  const isPostPayment = searchParams?.get("post_payment") === "1"

  const sigPad = useRef<SignatureCanvas>(null)
  const signatureInterval = useRef<ReturnType<typeof setInterval> | null>(null)
  const [signature, setSignature] = useState<string | null>(null)
  const [accepted, setAccepted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlanId, setSelectedPlanId] = useState(searchParams?.get("plan") || plans[0]?.id || "")
  const [formData, setFormData] = useState(initialMember)
  const [customValues, setCustomValues] = useState<Record<string, string | boolean>>({})

  useEffect(() => { if (plans.length === 1) setSelectedPlanId(plans[0].id) }, [plans])
  useEffect(() => { return () => { if (signatureInterval.current) clearInterval(signatureInterval.current) } }, [])

  const formatPrice = (v: number) => Number(v || 0).toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const formattedDate = useMemo(() => new Date().toLocaleDateString(locale), [locale])

  const contractText = useMemo(() => {
    const selectedPlan = plans.find((p) => p.id === selectedPlanId)
    const fee = `${formatPrice(selectedPlan?.price ?? (feeEnabled ? feeAmount : 0))} EUR`
    let res = contractBody
      .replace(/{{\s*name\s*}}/gi, `${formData.firstName} ${formData.lastName}`.trim())
      .replace(/{{\s*first_name\s*}}/gi, formData.firstName).replace(/{{\s*last_name\s*}}/gi, formData.lastName)
      .replace(/{{\s*club\s*}}/gi, clubName).replace(/{{\s*email\s*}}/gi, formData.email)
      .replace(/{{\s*phone\s*}}/gi, formData.phone).replace(/{{\s*address\s*}}/gi, formData.address)
      .replace(/{{\s*city\s*}}/gi, formData.city).replace(/{{\s*fee\s*}}/gi, fee).replace(/{{\s*date\s*}}/gi, formattedDate)
    for (const field of contractFields) {
      const val = customValues[field.key]
      const text = typeof val === "boolean" ? (val ? "Ja" : "Nein") : val || ""
      res = res.replace(new RegExp(`{{\\s*${field.key}\\s*}}`, "gi"), String(text))
    }
    return res
  }, [contractBody, formData, clubName, feeAmount, feeEnabled, formattedDate, contractFields, customValues, selectedPlanId, plans])

  const pdfData: ContractData = {
    clubName, clubLogoUrl: clubLogoUrl || undefined, clubAddress: "", contractTitle,
    memberName: `${formData.firstName} ${formData.lastName}`.trim(),
    memberAddress: formData.address, memberEmail: formData.email, memberPhone: formData.phone,
    customFields: contractFields.filter(f => f.key && f.label).map(f => ({ label: f.label, value: typeof customValues[f.key] === "boolean" ? (customValues[f.key] ? "Ja" : "Nein") : String(customValues[f.key] || "") })),
    contractText, signatureUrl: signature || undefined, signedAt: formattedDate, signedCity: formData.city || "Ort", lang,
  }

  const handleSignature = () => {
    const pad = sigPad.current
    if (!pad) return
    setSignature(pad.getTrimmedCanvas().toDataURL("image/png"))
  }

  const handleSubmit = async () => {
    setError(null)
    if (prePayment) {
      const plan = plans.find(p => p.id === selectedPlanId)
      if (!plan || !formData.email || !formData.firstName || !formData.lastName || !formData.phone) {
        setError("Bitte fülle alle Pflichtfelder aus."); return
      }
      setSaving(true)
      const res = await createMembershipCheckout(clubSlug, plan.id, plan.stripe_price_id || "", { email: formData.email, firstName: formData.firstName, lastName: formData.lastName, phone: formData.phone })
      if (res?.url) { window.location.href = res.url; return }
      setSaving(false); setError(res?.error || "Fehler beim Erstellen der Zahlung."); return
    }

    if (!accepted || !signature || sigPad.current?.isEmpty()) {
      setError("Bitte akzeptiere den Vertrag und unterschreibe."); return
    }
    setSaving(true)
    const profileData = new FormData(); profileData.set("firstName", formData.firstName); profileData.set("lastName", formData.lastName); profileData.set("phone", formData.phone)
    await updateProfile(profileData)
    const res = await submitMembershipSignature(clubSlug, signature, contractVersion, {
      memberName: `${formData.firstName} ${formData.lastName}`.trim(), memberAddress: formData.address, memberEmail: formData.email, memberPhone: formData.phone, signedCity: formData.city || "Ort", signedAt: formattedDate, contractTitle, contractText,
      customFields: contractFields.filter(f => f.key && f.label).map(f => ({ key: f.key, label: f.label, value: customValues[f.key] ?? "" }))
    })
    if (!res?.success) { setSaving(false); setError(res?.error || "Fehler beim Speichern."); return }
    window.location.href = `/${lang}/club/${clubSlug}/dashboard`
  }

  const inputClasses = "w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-white/20 outline-none focus:border-[#CBBF9A]/40 focus:ring-4 focus:ring-[#CBBF9A]/5 transition-all text-sm"
  const labelClasses = "text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2 block px-1"

  return (
    <div className="min-h-screen bg-[#030504] text-[#F9F8F4] flex flex-col lg:flex-row overflow-hidden">
      {/* LEFT: FORM AREA */}
      <div className="flex-1 overflow-y-auto pt-12 pb-24 px-6 lg:px-12 relative z-10">
        <div className="max-w-xl mx-auto space-y-12">
          {/* Header */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
             <Link href={`/${lang}/club/${clubSlug}`} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-[#CBBF9A] mb-8">
                <ChevronRight className="w-3 h-3 rotate-180" /> {clubName}
             </Link>
             <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-4">{contractTitle}</h1>
             <p className="text-white/40 font-light leading-relaxed">
                {t("member_onboarding.subhead")}
             </p>
          </div>

          <div className="space-y-8">
            {/* Step 1: Personal Data */}
            <SpotlightCard className="p-8">
               <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                     <User className="w-5 h-5 text-[#CBBF9A]" />
                  </div>
                  <h3 className="text-xl font-bold">Persönliche Daten</h3>
               </div>
               <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClasses}>Vorname</label>
                    <input value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className={inputClasses} />
                  </div>
                  <div>
                    <label className={labelClasses}>Nachname</label>
                    <input value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className={inputClasses} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClasses}>E-Mail</label>
                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={inputClasses} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClasses}>Telefon</label>
                    <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className={inputClasses} />
                  </div>
                  {!guestMode && (
                    <>
                      <div className="sm:col-span-2">
                        <label className={labelClasses}>Adresse</label>
                        <input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className={inputClasses} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className={labelClasses}>Ort</label>
                        <input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className={inputClasses} />
                      </div>
                    </>
                  )}
               </div>
            </SpotlightCard>

            {/* Step 2: Custom Fields */}
            {!guestMode && !prePayment && contractFields.length > 0 && (
              <SpotlightCard className="p-8">
                 <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                       <FileText className="w-5 h-5 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold">Zusätzliche Informationen</h3>
                 </div>
                 <div className="space-y-6">
                    {contractFields.map(f => (
                      <div key={f.key}>
                        <label className={labelClasses}>{f.label}{f.required && " *"}</label>
                        {f.type === "textarea" ? (
                          <textarea value={String(customValues[f.key] ?? "")} onChange={e => setCustomValues({...customValues, [f.key]: e.target.value})} className={`${inputClasses} h-32 py-3 resize-none`} placeholder={f.placeholder || ""} />
                        ) : f.type === "checkbox" ? (
                          <label className="flex items-center gap-3 cursor-pointer group p-4 rounded-xl bg-white/5 border border-white/5 hover:border-[#CBBF9A]/20 transition-all">
                             <input type="checkbox" checked={customValues[f.key] === true} onChange={e => setCustomValues({...customValues, [f.key]: e.target.checked})} className="w-5 h-5 rounded-md border-white/10 bg-white/5 text-[#CBBF9A] focus:ring-0" />
                             <span className="text-sm text-white/60 group-hover:text-white transition-colors">{f.placeholder || "Zustimmen"}</span>
                          </label>
                        ) : (
                          <input value={String(customValues[f.key] ?? "")} onChange={e => setCustomValues({...customValues, [f.key]: e.target.value})} className={inputClasses} placeholder={f.placeholder || ""} />
                        )}
                      </div>
                    ))}
                 </div>
              </SpotlightCard>
            )}

            {/* Step 3: Signature */}
            {!guestMode && !prePayment && (
              <SpotlightCard className="p-8">
                 <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                          <PenLine className="w-5 h-5 text-purple-400" />
                       </div>
                       <h3 className="text-xl font-bold">Unterschrift</h3>
                    </div>
                    <button onClick={() => { sigPad.current?.clear(); setSignature(null) }} className="text-[10px] font-bold uppercase tracking-widest text-red-400 hover:text-red-300 flex items-center gap-1.5 transition-colors">
                       <Eraser className="w-3 h-3" /> Löschen
                    </button>
                 </div>
                 <div className="bg-white rounded-3xl overflow-hidden mb-4">
                    <SignatureCanvas ref={sigPad} penColor="#030504" onEnd={handleSignature} canvasProps={{ className: "w-full h-48 cursor-crosshair" }} />
                 </div>
                 <p className="text-[10px] text-white/20 text-center uppercase tracking-widest">Bitte unterschreibe im Feld oben</p>
              </SpotlightCard>
            )}

            {/* Accept & Submit */}
            <div className="space-y-6 pt-4">
               {!guestMode && !prePayment && (
                 <label className="flex items-start gap-4 cursor-pointer group">
                    <input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} className="mt-1 w-5 h-5 rounded-md border-white/10 bg-white/5 text-[#CBBF9A] focus:ring-0" />
                    <span className="text-sm text-white/40 group-hover:text-white transition-colors leading-relaxed">
                       Ich bestätige, dass ich den Vertrag und die Bedingungen gelesen habe und diesen zustimme.
                    </span>
                 </label>
               )}

               {error && (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold flex items-center gap-3">
                    <Loader2 className="w-4 h-4 shrink-0" /> {error}
                 </motion.div>
               )}

               <button
                onClick={handleSubmit}
                disabled={saving || (!guestMode && !prePayment && (!accepted || !signature))}
                className="w-full h-16 rounded-2xl bg-[#CBBF9A] text-[#030504] font-black text-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-40 disabled:hover:scale-100 shadow-2xl shadow-[#CBBF9A]/10"
               >
                  {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                    <>
                      {isPostPayment ? "Onboarding abschließen" : prePayment ? "Jetzt bezahlen" : "Jetzt zahlungspflichtig beitreten"}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
               </button>
               <p className="text-[10px] text-center text-white/20 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                  <ShieldCheck className="w-3 h-3" /> Gesicherte Übermittlung
               </p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: PREVIEW AREA */}
      {!guestMode && !isPostPayment && !prePayment && (
        <div className="hidden lg:flex w-[40%] bg-[#0A0D0C] border-l border-white/5 items-center justify-center p-12 relative overflow-hidden">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#CBBF9A]/5 via-transparent to-transparent" />
           <div className="relative w-full max-w-lg aspect-[1/1.414] shadow-[0_30px_100px_rgba(0,0,0,0.8)] rounded-lg overflow-hidden group">
              <div className="absolute inset-0 border border-white/10 rounded-lg pointer-events-none z-20 group-hover:border-white/20 transition-colors" />
              <ContractPreview data={pdfData} className="w-full h-full" />
           </div>
        </div>
      )}
    </div>
  )
}

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
  )
}
