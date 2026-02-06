"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { de } from "date-fns/locale"
// NEU: validateCreditCode importieren
import { createBooking, getBookedSlots, createCheckoutSession, getBlockedDates, validateCreditCode } from "@/app/actions" 
import { generateTimeSlots, isDateBlocked } from "@/lib/utils"
import { Loader2, Calendar as CalendarIcon, Clock, AlertTriangle, CheckCircle2, Ticket } from "lucide-react"

interface BookingModalProps {
  courtId: string
  courtName: string
  price: number
  clubSlug: string
  durationMinutes: number
  startHour?: number 
  endHour?: number   
  isMember?: boolean
}

export function BookingModal({ courtId, courtName, price, clubSlug, durationMinutes, startHour, endHour, isMember }: BookingModalProps) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isBooking, setIsBooking] = useState(false)

  const [guestName, setGuestName] = useState("")
  const [guestEmail, setGuestEmail] = useState("")
   
  const [bookedSlots, setBookedSlots] = useState<string[]>([])
  const [blockedPeriods, setBlockedPeriods] = useState<any[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)

  // --- NEU: VOUCHER STATES ---
  const [voucherCode, setVoucherCode] = useState("")
  const [discount, setDiscount] = useState(0)
  const [voucherError, setVoucherError] = useState<string | null>(null)
  const [voucherSuccess, setVoucherSuccess] = useState(false)
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false)

  // Reset beim Schließen
  useEffect(() => {
      if(!isOpen) {
          setVoucherCode("")
          setDiscount(0)
          setVoucherSuccess(false)
          setVoucherError(null)
          setGuestName("")
          setGuestEmail("")
      }
  }, [isOpen])

  // --- NEU: VOUCHER CHECK ---
  async function checkVoucher() {
      if(!voucherCode) return
      setIsValidatingVoucher(true)
      setVoucherError(null)
      
      const res = await validateCreditCode(clubSlug, voucherCode)
      setIsValidatingVoucher(false)

      if (res.success) {
          setDiscount(res.amount || 0)
          setVoucherSuccess(true)
      } else {
          setVoucherError(res.error || "Ungültiger Code")
          setDiscount(0)
          setVoucherSuccess(false)
      }
  }

  // --- NEU: PREIS BERECHNUNG ---
  const finalPrice = Math.max(0, price - discount)
  const isFullyCovered = discount >= price

  const timeSlots = generateTimeSlots(startHour || 8, endHour || 22, durationMinutes)

  // 1. Sperrzeiten laden
  useEffect(() => {
    if(isOpen) {
        getBlockedDates(clubSlug, courtId).then(data => setBlockedPeriods(data))
    }
  }, [isOpen, clubSlug, courtId])

  // 2. Slots laden
  useEffect(() => {
    async function fetchSlots() {
      if (!date) return
      setIsLoadingSlots(true)
      try {
        const slots = await getBookedSlots(courtId, date)
        setBookedSlots(slots || []) 
      } catch (error) {
        setBookedSlots([])
      } finally {
        setIsLoadingSlots(false)
      }
    }

    if (isOpen && date) {
      const blocked = isDateBlocked(date, blockedPeriods)
      if(!blocked) {
          fetchSlots()
      }
    }
  }, [date, courtId, isOpen, blockedPeriods])


  const handleBook = async () => {
    if (!date || !selectedTime) return
    if (!isMember) {
      if (!guestName.trim() || !guestEmail.trim()) {
        alert("Bitte Name und E-Mail eingeben.")
        return
      }
    }
    setIsBooking(true)
    
    // Wenn alles durch Gutschein gedeckt ist, rufen wir direkt createBooking auf
    // Wir übergeben 'paid_stripe' als status, da es technisch bezahlt ist (via Guthaben)
    // Und wir übergeben den voucherCode, damit das Backend ihn entwerten kann
    const result = await createBooking(
        courtId, 
        clubSlug, 
        date, 
        selectedTime, 
        price, 
        durationMinutes, 
        isFullyCovered ? 'paid_stripe' : 'paid_cash', // Wenn fully covered -> stripe logic
        isFullyCovered ? voucherCode : undefined,
        isMember ? undefined : guestName,
        isMember ? undefined : guestEmail
    )
    
    setIsBooking(false)

    if (result.success) {
      alert("✅ Buchung erfolgreich gespeichert!")
      setIsOpen(false)
      window.location.reload() 
    } else {
      alert("❌ Fehler: " + result.error)
    }
  }

  const activeBlock = date ? isDateBlocked(date, blockedPeriods) : null

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full club-primary-bg hover:opacity-90 btn-press h-11 touch-44">
           Platz buchen
        </Button>
      </DialogTrigger>
      
      <DialogContent className="w-[calc(100%-1rem)] max-w-[calc(100%-1rem)] sm:max-w-[520px] bg-white text-slate-900 max-h-[92vh] overflow-y-auto overflow-x-hidden rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{courtName} buchen</span>
            <span className="text-sm font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
              {durationMinutes} Min
            </span>
          </DialogTitle>
          <DialogDescription>
             {courtName} ist geöffnet von {startHour || 8}:00 bis {endHour || 22}:00 Uhr.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          
          {/* 1. DATUM WÄHLEN */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" /> Datum wählen
            </span>
            <div className="border rounded-md p-2 flex justify-center bg-slate-50" style={{ ["--rdp-accent-color" as any]: "var(--club-primary)" }}>
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => { setDate(d); setSelectedTime(null); }}
                locale={de}
                modifiers={{ blocked: (d) => !!isDateBlocked(d, blockedPeriods) }}
                modifiersStyles={{ blocked: { color: 'red', textDecoration: 'line-through', opacity: 0.5 } }}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                initialFocus
                className="bg-white rounded-md shadow-sm"
              />
            </div>
          </div>

          {activeBlock && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5" />
                  <div>
                      <div className="font-bold">Keine Buchung möglich</div>
                      <div className="text-sm">Grund: {activeBlock.reason}</div>
                  </div>
              </div>
          )}

          {/* 2. UHRZEIT WÄHLEN */}
          {date && !activeBlock && (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Uhrzeit wählen
                </span>
                {isLoadingSlots && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
              </div>
                
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {timeSlots.map((time) => {
                  const isBooked = bookedSlots.includes(time)
                  return (
                    <Button
                      key={time}
                      variant={isBooked ? "ghost" : (selectedTime === time ? "default" : "outline")}
                      className={`text-sm h-11 btn-press ${selectedTime === time ? "club-primary-bg" : ""} ${isBooked ? 'text-red-300 line-through bg-slate-50 opacity-60 cursor-not-allowed' : ''}`}
                      disabled={isBooked}
                      onClick={() => setSelectedTime(time)}
                    >
                      {time}
                    </Button>
                  )
                })}
              </div>
              {timeSlots.length === 0 && <div className="text-sm text-slate-500">Keine Spielzeiten verfügbar.</div>}
            </div>
          )}

          {/* 3. ABSCHLUSS & GUTSCHEIN */}
          {selectedTime && !activeBlock && (
            <div className="flex flex-col gap-4 pt-4 border-t mt-2">

               {!isMember && (
                  <div className="grid gap-3">
                    <div className="text-xs font-semibold text-slate-500 uppercase">Deine Angaben</div>
                    <input
                      type="text"
                      placeholder="Dein Name"
                      className="border rounded px-3 py-2 text-sm input-glow"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                    />
                    <input
                      type="email"
                      placeholder="E-Mail für Bestätigung"
                      className="border rounded px-3 py-2 text-sm input-glow"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                    />
                  </div>
               )}
               
               {/* --- NEU: GUTSCHEIN EINGABE (Nur für Gäste) --- */}
               {!isMember && (
                  <div className="flex flex-col gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
                          <Ticket className="w-3 h-3" /> Gutschein / Guthaben
                      </label>
                      <div className="flex gap-2">
                          <input 
                              type="text" 
                              placeholder="Code eingeben..." 
                              className="flex-1 border rounded px-3 py-1 text-sm uppercase"
                              value={voucherCode}
                              onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                              disabled={voucherSuccess} 
                          />
                          {!voucherSuccess ? (
                              <Button size="sm" variant="outline" onClick={checkVoucher} disabled={isValidatingVoucher || !voucherCode}>
                                  {isValidatingVoucher ? <Loader2 className="w-3 h-3 animate-spin"/> : "Einlösen"}
                              </Button>
                          ) : (
                              <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => {
                                  setVoucherSuccess(false); setDiscount(0); setVoucherCode("");
                              }}>
                                  Entfernen
                              </Button>
                          )}
                      </div>
                      {voucherError && <p className="text-xs text-red-500">{voucherError}</p>}
                      {voucherSuccess && <p className="text-xs text-green-600 font-medium">✅ Gutschein über {discount}€ angewendet!</p>}
                  </div>
               )}

               <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600">
                  <div className="mb-2">
                    Zusammenfassung: <br/>
                    <strong>{date?.toLocaleDateString('de-DE')}</strong> um <strong>{selectedTime} Uhr</strong>
                  </div>
                  
                  {/* --- NEU: PREIS ANZEIGE --- */}
                  <div className="flex justify-between items-center border-t pt-2 mt-2">
                      <span>Zu zahlen:</span>
                      <div className="text-right">
                          {isMember ? (
                              <span className="text-green-600 font-bold">0€ (Mitglied)</span>
                          ) : (
                              <>
                                {discount > 0 && <span className="text-slate-400 line-through mr-2">{price}€</span>}
                                <span className="font-bold text-lg">{finalPrice}€</span>
                              </>
                          )}
                      </div>
                  </div>
               </div>

              {/* --- BUTTONS --- */}
              {isMember ? (
                  // MITGLIEDER BUTTON
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white gap-2" disabled={isBooking} onClick={handleBook}>
                      {isBooking ? <Loader2 className="animate-spin" /> : <><CheckCircle2 className="w-4 h-4"/> Jetzt kostenlos buchen</>}
                  </Button>
              ) : (
                  // GAST BUTTONS
                  <>
                    {/* ENTWEDER: Komplett gedeckt -> Kostenlos buchen */}
                    {isFullyCovered ? (
                        <Button 
                            className="w-full club-primary-bg hover:opacity-90 btn-press"
                            disabled={isBooking}
                            onClick={handleBook} // Ruft createBooking direkt auf
                        >
                             {isBooking ? <Loader2 className="animate-spin" /> : "Jetzt kostenlos buchen"}
                        </Button>
                    ) : (
                        // ODER: Restbetrag via Stripe
                        <Button 
                            className="w-full club-primary-bg hover:opacity-90 btn-press" 
                            disabled={isBooking}
                            onClick={async () => {
                                if (!guestName.trim() || !guestEmail.trim()) {
                                  alert("Bitte Name und E-Mail eingeben.")
                                  return
                                }
                                setIsBooking(true)
                                // WICHTIG: voucherCode übergeben!
                                const result = await createCheckoutSession(
                                    courtId, 
                                    clubSlug, 
                                    date!, 
                                    selectedTime, 
                                    price, 
                                    courtName, 
                                    durationMinutes,
                                    voucherCode, // <---
                                    guestName,
                                    guestEmail
                                )
                                if (result?.url) window.location.href = result.url
                                else { alert("Fehler"); setIsBooking(false); }
                            }}
                        >
                            {isBooking ? <Loader2 className="animate-spin" /> : `💳 Restbetrag zahlen (${finalPrice}€)`}
                        </Button>
                    )}

                    {/* Vor Ort zahlen nur anzeigen, wenn kein Gutschein aktiv ist (oder man könnte es verbieten) */}
                    {!voucherSuccess && (
                        <Button variant="outline" className="w-full" disabled={isBooking} onClick={handleBook}>
                            Vor Ort bezahlen
                        </Button>
                    )}
                  </>
              )}
            </div>
          )}
           
        </div>
      </DialogContent>
    </Dialog>
  )
}
