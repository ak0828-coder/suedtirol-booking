"use client"

import { useState, useEffect, useRef } from "react"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { de, it, enUS } from "date-fns/locale"
import { createBooking, getBookedSlots, createCheckoutSession, getBlockedDates, validateCreditCode } from "@/app/actions"
import { generateTimeSlots, isDateBlocked } from "@/lib/utils"
import { 
  Loader2, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Ticket, 
  CalendarDays, 
  X, 
  Zap, 
  ShieldCheck, 
  User, 
  ArrowRight 
} from "lucide-react"
import { useParams } from "next/navigation"
import { useI18n } from "@/components/i18n/locale-provider"
import { format } from "date-fns"
import { motion, AnimatePresence } from "motion/react"

interface BookingModalProps {
  courtId: string
  courtName: string
  price: number
  clubSlug: string
  durationMinutes: number
  startHour?: number
  endHour?: number
  isMember?: boolean
  memberPricingMode?: "full_price" | "discount_percent" | "member_price"
  memberPricingValue?: number
}

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
      className={`relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] group/spotlight ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover/spotlight:opacity-100"
        style={{
          background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(var(--primary-rgb), 0.1), transparent 40%)`,
        }}
      />
      {children}
    </div>
  )
}

export function BookingModal({
  courtId,
  courtName,
  price,
  clubSlug,
  durationMinutes,
  startHour,
  endHour,
  isMember,
  memberPricingMode = "full_price",
  memberPricingValue = 0,
}: BookingModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isBooking, setIsBooking] = useState(false)

  const [guestName, setGuestName] = useState("")
  const [guestEmail, setGuestEmail] = useState("")

  const [bookedSlots, setBookedSlots] = useState<string[]>([])
  const [blockedPeriods, setBlockedPeriods] = useState<any[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)

  const [voucherCode, setVoucherCode] = useState("")
  const [discount, setDiscount] = useState(0)
  const [voucherError, setVoucherError] = useState<string | null>(null)
  const [voucherSuccess, setVoucherSuccess] = useState(false)
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const { t } = useI18n()
  const params = useParams()
  const lang = (params?.lang as string) || "de"
  const calendarLocale = lang === "it" ? it : lang === "en" ? enUS : de
  const dateLocale = lang === "it" ? it : lang === "en" ? enUS : de

  const resetModal = () => {
    setStep(1)
    setDate(new Date())
    setSelectedTime(null)
    setVoucherCode("")
    setDiscount(0)
    setVoucherSuccess(false)
    setVoucherError(null)
    setGuestName("")
    setGuestEmail("")
    setMessage(null)
    setIsBooking(false)
  }

  useEffect(() => {
    if (!isOpen) resetModal()
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      getBlockedDates(clubSlug, courtId).then((data) => setBlockedPeriods(data))
    }
  }, [isOpen, clubSlug, courtId])

  useEffect(() => {
    if (!isOpen || !date) return
    const blocked = isDateBlocked(date, blockedPeriods)
    if (blocked) return
    setIsLoadingSlots(true)
    getBookedSlots(courtId, date)
      .then((slots) => setBookedSlots(slots || []))
      .catch(() => setBookedSlots([]))
      .finally(() => setIsLoadingSlots(false))
  }, [date, courtId, isOpen, blockedPeriods])

  async function checkVoucher() {
    if (!voucherCode) return
    setIsValidatingVoucher(true)
    setVoucherError(null)
    const res = await validateCreditCode(clubSlug, voucherCode)
    setIsValidatingVoucher(false)
    if (res.success) {
      setDiscount(res.amount || 0)
      setVoucherSuccess(true)
    } else {
      setVoucherError(res.error || t("booking.message.invalid_code"))
      setDiscount(0)
      setVoucherSuccess(false)
    }
  }

  const applyMemberPricing = () => {
    if (!isMember) return price
    if (memberPricingMode === "discount_percent") {
      const pct = Math.min(Math.max(memberPricingValue, 0), 100)
      return Math.max(0, price * (1 - pct / 100))
    }
    if (memberPricingMode === "member_price") return Math.max(0, memberPricingValue)
    return price
  }

  const memberBasePrice = applyMemberPricing()
  const finalPrice = Math.max(0, memberBasePrice - discount)
  const isFullyCovered = discount >= memberBasePrice || finalPrice === 0
  const timeSlots = generateTimeSlots(startHour || 8, endHour || 22, durationMinutes)
  const activeBlock = date ? isDateBlocked(date, blockedPeriods) : null

  const handleBook = async (paymentStatus: "paid_stripe" | "paid_cash") => {
    if (!date || !selectedTime) return
    if (!isMember && (!guestName.trim() || !guestEmail.trim())) {
      setMessage(t("booking.message.name_email_required"))
      return
    }
    setIsBooking(true)
    const result = await createBooking(
      courtId, clubSlug, date, selectedTime, price, durationMinutes,
      isFullyCovered ? "paid_stripe" : paymentStatus,
      isFullyCovered ? voucherCode : undefined,
      isMember ? undefined : guestName,
      isMember ? undefined : guestEmail
    )
    setIsBooking(false)
    if (result.success) {
      setMessage(t("booking.message.saved"))
      setTimeout(() => setIsOpen(false), 1200)
    } else {
      setMessage(String(result.error || t("booking.message.error")))
    }
  }

  const handlePayOnline = async () => {
    if (!date || !selectedTime) return
    if (!isMember && (!guestName.trim() || !guestEmail.trim())) {
      setMessage(t("booking.message.name_email_required"))
      return
    }
    setIsBooking(true)
    const result = await createCheckoutSession(
      courtId, clubSlug, date!, selectedTime, price, courtName, durationMinutes,
      voucherCode || undefined,
      isMember ? undefined : guestName,
      isMember ? undefined : guestEmail
    )
    if (result?.url) {
      window.location.href = result.url
    } else if (result?.success) {
      setMessage(t("booking.message.saved"))
      setTimeout(() => setIsOpen(false), 1200)
    } else {
      setMessage(String(result?.error || t("booking.message.checkout_error")))
      setIsBooking(false)
    }
  }

  const formattedDate = date ? format(date, "EEEE, d. MMMM", { locale: dateLocale }) : ""
  const inputClasses = "w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-white/20 outline-none focus:border-[#CBBF9A]/40 focus:ring-4 focus:ring-[#CBBF9A]/5 transition-all text-sm"
  const labelClasses = "text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2 block px-1"

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full h-14 rounded-2xl bg-white text-[#030504] font-black text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-2 mt-4"
      >
        <CalendarDays className="w-4 h-4" />
        {t("booking.cta")}
      </button>

      <DialogContent showCloseButton={false} className="p-0 gap-0 w-full max-w-lg bg-[#0A0D0C] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <DialogTitle className="sr-only">{courtName} buchen</DialogTitle>

        {/* Header */}
        <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between shrink-0">
           <div className="flex items-center gap-4">
              {step > 1 && (
                <button onClick={() => setStep((s) => (s - 1) as any)} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors">
                   <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <div>
                 <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#CBBF9A]">{courtName}</p>
                 <h2 className="text-xl font-black text-white">{step === 1 ? 'Datum wählen' : step === 2 ? 'Zeit wählen' : 'Abschließen'}</h2>
              </div>
           </div>
           <button onClick={() => setIsOpen(false)} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/20 hover:text-white transition-colors">
              <X className="w-5 h-5" />
           </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
           <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                   <div className="rounded-3xl bg-white/5 border border-white/10 p-2">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(d) => { setDate(d); setStep(2) }}
                        locale={calendarLocale}
                        modifiers={{ blocked: (d) => !!isDateBlocked(d, blockedPeriods) }}
                        modifiersStyles={{ blocked: { color: "#ef4444", textDecoration: "line-through", opacity: 0.5 } }}
                        disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                        className="w-full text-white"
                      />
                   </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                   <div className="p-4 rounded-2xl bg-[#CBBF9A]/10 border border-[#CBBF9A]/20 flex items-center gap-3">
                      <CalendarDays className="w-5 h-5 text-[#CBBF9A]" />
                      <p className="text-sm font-bold text-white capitalize">{formattedDate}</p>
                   </div>

                   {activeBlock ? (
                     <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-4">
                        <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-1" />
                        <div>
                           <p className="text-sm font-bold text-white">Keine Buchung möglich</p>
                           <p className="text-xs text-red-400/60 mt-1">{String(activeBlock.reason)}</p>
                        </div>
                     </div>
                   ) : (
                     <div className="grid grid-cols-3 gap-3">
                        {timeSlots.map((time) => {
                           const isBooked = bookedSlots.includes(time)
                           const isSelected = selectedTime === time
                           return (
                             <button
                               key={time}
                               disabled={isBooked}
                               onClick={() => { setSelectedTime(time); setStep(3) }}
                               className={`h-14 rounded-2xl text-sm font-bold transition-all active:scale-95 ${
                                 isBooked ? 'bg-white/5 text-white/10 cursor-not-allowed line-through' :
                                 isSelected ? 'bg-[#CBBF9A] text-[#030504] shadow-xl shadow-[#CBBF9A]/20' :
                                 'bg-white/5 text-white/60 border border-white/5 hover:bg-white/10 hover:border-white/10'
                               }`}
                             >
                                {time}
                             </button>
                           )
                        })}
                     </div>
                   )}
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-8">
                   <SpotlightCard className="p-6 space-y-4">
                      <div className="flex justify-between items-end border-b border-white/5 pb-4">
                         <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">Termin</p>
                            <p className="text-sm font-bold text-white capitalize">{formattedDate}</p>
                            <p className="text-xs text-white/40">{selectedTime} Uhr · {durationMinutes} Min</p>
                         </div>
                         <div className="text-right">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">Preis</p>
                            <div className="flex items-center gap-2 justify-end">
                               {memberBasePrice !== price && <span className="text-xs text-white/20 line-through">{price}€</span>}
                               <p className="text-2xl font-black text-white">{finalPrice}€</p>
                            </div>
                         </div>
                      </div>
                      {isMember && memberBasePrice !== price && (
                        <div className="flex items-center gap-2 text-[#34D399]">
                           <Zap className="w-3 h-3" fill="currentColor" />
                           <span className="text-[10px] font-bold uppercase tracking-widest">Mitglieder-Vorteil aktiv</span>
                        </div>
                      )}
                   </SpotlightCard>

                   {!isMember && (
                     <div className="space-y-4">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/30 px-1">Deine Daten</h4>
                        <div className="grid gap-4">
                           <input type="text" placeholder="Dein Name" className={inputClasses} value={guestName} onChange={(e) => setGuestName(e.target.value)} />
                           <input type="email" placeholder="E-Mail für Bestätigung" className={inputClasses} value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} />
                        </div>
                     </div>
                   )}

                   {message && (
                     <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-3 ${message.includes('erfolgreich') ? 'bg-[#10B981]/10 text-[#34D399] border border-[#10B981]/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                        {message.includes('erfolgreich') ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                        {message}
                     </div>
                   )}

                   <div className="space-y-3">
                      {finalPrice === 0 ? (
                        <button onClick={() => handleBook("paid_stripe")} disabled={isBooking} className="w-full h-16 rounded-2xl bg-[#CBBF9A] text-[#030504] font-black text-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                           {isBooking ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Jetzt kostenlos buchen <ArrowRight className="w-5 h-5" /></>}
                        </button>
                      ) : (
                        <>
                          <button onClick={handlePayOnline} disabled={isBooking} className="w-full h-16 rounded-2xl bg-[#CBBF9A] text-[#030504] font-black text-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                             {isBooking ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Online zahlen ({finalPrice}€) <ArrowRight className="w-5 h-5" /></>}
                          </button>
                          <button onClick={() => handleBook("paid_cash")} disabled={isBooking} className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-all">
                             Vor Ort bezahlen
                          </button>
                        </>
                      )}
                      <p className="text-[10px] font-bold text-center text-white/20 uppercase tracking-[0.2em] pt-2 flex items-center justify-center gap-2">
                         <ShieldCheck className="w-3 h-3" /> Gesicherte Buchung
                      </p>
                   </div>
                </motion.div>
              )}
           </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}
