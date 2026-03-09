"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { de, it, enUS } from "date-fns/locale"
import { createBooking, getBookedSlots, createCheckoutSession, getBlockedDates, validateCreditCode } from "@/app/actions"
import { generateTimeSlots, isDateBlocked } from "@/lib/utils"
import { Loader2, ChevronLeft, ChevronRight, Clock, AlertTriangle, CheckCircle2, Ticket, CalendarDays, X } from "lucide-react"
import { useParams } from "next/navigation"
import { useI18n } from "@/components/i18n/locale-provider"
import { format } from "date-fns"

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
  const langRaw = params?.lang
  const lang = typeof langRaw === "string" ? langRaw : Array.isArray(langRaw) ? langRaw[0] : "de"
  const locale = lang === "it" ? "it-IT" : lang === "en" ? "en-US" : "de-DE"
  const calendarLocale = lang === "it" ? it : lang === "en" ? enUS : de

  const toText = (value: any) => {
    if (typeof value === "string") return value
    if (value?.text) return String(value.text)
    try { return JSON.stringify(value) } catch { return String(value) }
  }

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
      setVoucherError(res.error || t("booking.message.invalid_code", "Ungültiger Code"))
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

  const dateLocale = lang === "it" ? it : lang === "en" ? enUS : de

  const handleBook = async (paymentStatus: "paid_stripe" | "paid_cash") => {
    if (!date || !selectedTime) return
    if (!isMember && (!guestName.trim() || !guestEmail.trim())) {
      setMessage(t("booking.message.name_email_required", "Bitte Name und E-Mail eingeben."))
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
      setMessage(t("booking.message.saved", "Buchung erfolgreich gespeichert."))
      setTimeout(() => setIsOpen(false), 1200)
    } else {
      setMessage(toText(result.error || t("booking.message.error", "Fehler bei der Buchung.")))
    }
  }

  const handlePayOnline = async () => {
    if (!date || !selectedTime) return
    if (!isMember && (!guestName.trim() || !guestEmail.trim())) {
      setMessage(t("booking.message.name_email_required", "Bitte Name und E-Mail eingeben."))
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
      setMessage(t("booking.message.saved", "Buchung erfolgreich gespeichert."))
      setTimeout(() => setIsOpen(false), 1200)
    } else {
      setMessage(toText(result?.error || t("booking.message.checkout_error", "Fehler beim Checkout.")))
      setIsBooking(false)
    }
  }

  // Format date nicely
  const formattedDate = date ? format(date, "EEEE, d. MMMM", { locale: dateLocale }) : ""

  const stepTitle = step === 1 ? "Datum wählen" : step === 2 ? "Uhrzeit wählen" : "Bestätigen"

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full h-12 rounded-xl font-medium text-sm transition-all active:scale-[0.97] flex items-center justify-center gap-2 club-primary-bg text-white hover:opacity-90"
      >
        <CalendarDays className="w-4 h-4" />
        {t("booking.cta", "Platz buchen")}
      </button>

      <DialogContent
        showCloseButton={false}
        className="p-0 gap-0 w-full max-w-[min(448px,calc(100vw-1rem))] rounded-2xl sm:rounded-3xl overflow-hidden border-0 shadow-2xl max-h-[88dvh] flex flex-col"
      >
        <DialogTitle className="sr-only">{courtName} buchen</DialogTitle>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep((s) => (s - 1) as any)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
            )}
            <div>
              <p className="text-xs text-slate-400 font-medium">
                {courtName} · {durationMinutes} Min
              </p>
              <h2 className="text-base font-semibold text-slate-900 leading-tight">{stepTitle}</h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Step dots */}
            <div className="flex gap-1">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all ${s === step ? "w-4 club-primary-bg" : s < step ? "w-1.5 bg-slate-300" : "w-1.5 bg-slate-200"}`}
                />
              ))}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className="overflow-y-auto flex-1 overscroll-contain">

          {/* STEP 1: Date */}
          {step === 1 && (
            <div className="px-4 pt-4 pb-6">
              <div
                className="rounded-2xl overflow-hidden"
                style={{ ["--rdp-accent-color" as any]: "var(--club-primary)" }}
              >
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => {
                    setDate(d)
                    setSelectedTime(null)
                  }}
                  locale={calendarLocale}
                  modifiers={{ blocked: (d) => !!isDateBlocked(d, blockedPeriods) }}
                  modifiersStyles={{ blocked: { color: "#ef4444", textDecoration: "line-through", opacity: 0.5 } }}
                  disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Time */}
          {step === 2 && (
            <div className="px-4 pt-4 pb-6">
              {/* Date recap */}
              <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <CalendarDays className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="text-sm font-medium text-slate-700 capitalize">{formattedDate}</span>
              </div>

              {activeBlock ? (
                <div className="rounded-2xl bg-red-50 border border-red-200 p-5 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-800">Keine Buchung möglich</p>
                    <p className="text-xs text-red-600 mt-1">{toText(activeBlock.reason)}</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Verfügbare Zeiten
                    </p>
                    {isLoadingSlots && <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />}
                  </div>

                  {timeSlots.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-8">{t("booking.time_empty", "Keine Spielzeiten verfügbar.")}</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {timeSlots.map((time) => {
                        const isBooked = bookedSlots.includes(time)
                        const isSelected = selectedTime === time
                        return (
                          <button
                            key={time}
                            disabled={isBooked}
                            onClick={() => setSelectedTime(time)}
                            className={`h-12 rounded-xl text-sm font-medium transition-all active:scale-[0.96] ${
                              isBooked
                                ? "bg-slate-50 text-slate-300 line-through cursor-not-allowed"
                                : isSelected
                                  ? "club-primary-bg text-white shadow-sm"
                                  : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                            }`}
                          >
                            {time}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* STEP 3: Confirm */}
          {step === 3 && (
            <div className="px-4 pt-4 pb-6 space-y-4">
              {/* Booking summary card */}
              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 space-y-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Deine Buchung</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Platz</span>
                    <span className="text-sm font-semibold text-slate-900">{courtName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Datum</span>
                    <span className="text-sm font-semibold text-slate-900 capitalize">{formattedDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Uhrzeit</span>
                    <span className="text-sm font-semibold text-slate-900">{selectedTime} Uhr · {durationMinutes} Min</span>
                  </div>
                  <div className="h-px bg-slate-200 my-1" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Preis</span>
                    <div className="flex items-center gap-2">
                      {memberBasePrice !== price && (
                        <span className="text-xs text-slate-400 line-through">{price}€</span>
                      )}
                      {discount > 0 && (
                        <span className="text-xs text-slate-400 line-through">{memberBasePrice}€</span>
                      )}
                      <span className="text-lg font-bold text-slate-900">{finalPrice}€</span>
                    </div>
                  </div>
                  {isMember && memberBasePrice !== price && (
                    <p className="text-xs text-emerald-600 font-medium">
                      Mitgliedervorteil aktiv ·{" "}
                      {memberPricingMode === "discount_percent"
                        ? `${memberPricingValue}% Rabatt`
                        : memberPricingMode === "member_price"
                          ? `Mitgliederpreis ${memberPricingValue}€`
                          : "Mitgliedsstatus"}
                    </p>
                  )}
                </div>
              </div>

              {/* Guest info */}
              {!isMember && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Deine Angaben</p>
                  <input
                    type="text"
                    placeholder="Dein Name"
                    className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                  />
                  <input
                    type="email"
                    placeholder="E-Mail für Bestätigung"
                    className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                  />
                </div>
              )}

              {/* Voucher */}
              {!isMember && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Ticket className="w-3.5 h-3.5" /> Gutschein / Guthaben
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Code eingeben..."
                      className="flex-1 h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-slate-200"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                      disabled={voucherSuccess}
                    />
                    {!voucherSuccess ? (
                      <button
                        onClick={checkVoucher}
                        disabled={isValidatingVoucher || !voucherCode}
                        className="px-4 h-11 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                      >
                        {isValidatingVoucher ? <Loader2 className="w-4 h-4 animate-spin" /> : "Einlösen"}
                      </button>
                    ) : (
                      <button
                        onClick={() => { setVoucherSuccess(false); setDiscount(0); setVoucherCode("") }}
                        className="px-4 h-11 rounded-xl border border-red-200 bg-red-50 text-sm font-medium text-red-600 hover:bg-red-100"
                      >
                        Entfernen
                      </button>
                    )}
                  </div>
                  {voucherError && <p className="text-xs text-red-500">{voucherError}</p>}
                  {voucherSuccess && (
                    <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Gutschein über {discount}€ angewendet
                    </p>
                  )}
                </div>
              )}

              {/* Error / success message */}
              {message && (
                <div className={`rounded-xl p-3 text-sm ${message.includes("erfolgreich") ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-600 border border-red-100"}`}>
                  {message.includes("erfolgreich") && <CheckCircle2 className="inline w-3.5 h-3.5 mr-1" />}
                  {message}
                </div>
              )}

              {/* Payment buttons */}
              <div className="space-y-2 pt-1">
                {isMember ? (
                  <>
                    {finalPrice === 0 ? (
                      <Button
                        className="w-full h-12 rounded-xl club-primary-bg hover:opacity-90 font-medium"
                        disabled={isBooking}
                        onClick={() => handleBook("paid_stripe")}
                      >
                        {isBooking ? <Loader2 className="animate-spin" /> : <><CheckCircle2 className="w-4 h-4 mr-2" /> Jetzt kostenlos buchen</>}
                      </Button>
                    ) : (
                      <>
                        <Button
                          className="w-full h-12 rounded-xl club-primary-bg hover:opacity-90 font-medium"
                          disabled={isBooking}
                          onClick={handlePayOnline}
                        >
                          {isBooking ? <Loader2 className="animate-spin" /> : `Online zahlen (${finalPrice}€)`}
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full h-12 rounded-xl font-medium"
                          disabled={isBooking}
                          onClick={() => handleBook("paid_cash")}
                        >
                          Vor Ort bezahlen
                        </Button>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    {isFullyCovered ? (
                      <Button
                        className="w-full h-12 rounded-xl club-primary-bg hover:opacity-90 font-medium"
                        disabled={isBooking}
                        onClick={() => handleBook("paid_stripe")}
                      >
                        {isBooking ? <Loader2 className="animate-spin" /> : <><CheckCircle2 className="w-4 h-4 mr-2" /> Jetzt kostenlos buchen</>}
                      </Button>
                    ) : (
                      <Button
                        className="w-full h-12 rounded-xl club-primary-bg hover:opacity-90 font-medium"
                        disabled={isBooking}
                        onClick={handlePayOnline}
                      >
                        {isBooking ? <Loader2 className="animate-spin" /> : `Online zahlen (${finalPrice}€)`}
                      </Button>
                    )}
                    {!voucherSuccess && (
                      <Button
                        variant="outline"
                        className="w-full h-12 rounded-xl font-medium"
                        disabled={isBooking}
                        onClick={() => handleBook("paid_cash")}
                      >
                        Vor Ort bezahlen
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer CTA (for steps 1 & 2) */}
        {step < 3 && (
          <div className="px-4 py-4 border-t border-slate-100 flex-shrink-0 bg-white">
            {step === 1 && (
              <Button
                className="w-full h-12 rounded-xl club-primary-bg hover:opacity-90 font-medium gap-2"
                disabled={!date}
                onClick={() => setStep(2)}
              >
                Weiter <ChevronRight className="w-4 h-4" />
              </Button>
            )}
            {step === 2 && (
              <Button
                className="w-full h-12 rounded-xl club-primary-bg hover:opacity-90 font-medium gap-2"
                disabled={!selectedTime || !!activeBlock}
                onClick={() => setStep(3)}
              >
                Weiter zur Bestätigung <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
