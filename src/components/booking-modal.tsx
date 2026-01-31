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
import { createBooking, getBookedSlots, createCheckoutSession, getBlockedDates } from "@/app/actions" 
import { generateTimeSlots, isDateBlocked } from "@/lib/utils"
import { Loader2, Calendar as CalendarIcon, Clock, AlertTriangle } from "lucide-react"

interface BookingModalProps {
  courtId: string
  courtName: string
  price: number
  clubSlug: string
  durationMinutes: number
  startHour?: number // NEU
  endHour?: number   // NEU
}

export function BookingModal({ courtId, courtName, price, clubSlug, durationMinutes, startHour, endHour }: BookingModalProps) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isBooking, setIsBooking] = useState(false)
   
  const [bookedSlots, setBookedSlots] = useState<string[]>([])
  const [blockedPeriods, setBlockedPeriods] = useState<any[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)

  // Dynamische Slots basierend auf Platz-Öffnungszeiten
  // Wenn startHour/endHour nicht da sind, fallback auf 8 und 22
  const timeSlots = generateTimeSlots(startHour || 8, endHour || 22, durationMinutes)

  // 1. Sperrzeiten laden beim Öffnen
  useEffect(() => {
    if(isOpen) {
        getBlockedDates(clubSlug, courtId).then(data => setBlockedPeriods(data))
    }
  }, [isOpen, clubSlug, courtId])

  // 2. Slots laden beim Datumswechsel
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
      // Nur laden, wenn Tag nicht komplett gesperrt ist
      const blocked = isDateBlocked(date, blockedPeriods)
      if(!blocked) {
          fetchSlots()
      }
    }
  }, [date, courtId, isOpen, blockedPeriods])


  const handleBook = async () => {
    if (!date || !selectedTime) return
    setIsBooking(true)
    const result = await createBooking(courtId, clubSlug, date, selectedTime, price, durationMinutes)
    setIsBooking(false)

    if (result.success) {
      alert("✅ Buchung erfolgreich gespeichert!")
      setIsOpen(false)
      window.location.reload() 
    } else {
      alert("❌ Fehler: " + result.error)
    }
  }

  // Prüfen, ob der aktuell gewählte Tag gesperrt ist
  const activeBlock = date ? isDateBlocked(date, blockedPeriods) : null

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-slate-900 text-white hover:bg-slate-800">
           Platz buchen
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[450px] bg-white text-slate-900 max-h-[90vh] overflow-y-auto">
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
            <div className="border rounded-md p-2 flex justify-center bg-slate-50">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => { setDate(d); setSelectedTime(null); }}
                locale={de}
                // Tage deaktivieren, die gesperrt sind (visuell)
                modifiers={{ blocked: (d) => !!isDateBlocked(d, blockedPeriods) }}
                modifiersStyles={{ blocked: { color: 'red', textDecoration: 'line-through', opacity: 0.5 } }}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                initialFocus
                className="bg-white rounded-md shadow-sm"
              />
            </div>
          </div>

          {/* SPERR-MELDUNG */}
          {activeBlock && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5" />
                  <div>
                      <div className="font-bold">Keine Buchung möglich</div>
                      <div className="text-sm">Grund: {activeBlock.reason}</div>
                  </div>
              </div>
          )}

          {/* 2. UHRZEIT WÄHLEN (Nur wenn nicht gesperrt) */}
          {date && !activeBlock && (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Uhrzeit wählen
                </span>
                {isLoadingSlots && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
              </div>
               
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map((time) => {
                  const isBooked = bookedSlots.includes(time)
                  return (
                    <Button
                      key={time}
                      variant={isBooked ? "ghost" : (selectedTime === time ? "default" : "outline")}
                      className={`text-sm h-10 ${isBooked ? 'text-red-300 line-through bg-slate-50 opacity-60 cursor-not-allowed' : ''}`}
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

          {/* 3. ABSCHLUSS */}
          {selectedTime && !activeBlock && (
            <div className="flex flex-col gap-3 pt-4 border-t mt-2">
               <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600 mb-2">
                  Zusammenfassung: <br/>
                  <strong>{date?.toLocaleDateString('de-DE')}</strong> um <strong>{selectedTime} Uhr</strong><br/>
                  Preis: <strong>{price}€</strong>
               </div>

              <Button 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" 
                disabled={isBooking}
                onClick={async () => {
                   setIsBooking(true)
                   const result = await createCheckoutSession(courtId, clubSlug, date!, selectedTime, price, courtName, durationMinutes)
                   if (result?.url) window.location.href = result.url
                   else { alert("Fehler"); setIsBooking(false); }
                }}
              >
                {isBooking ? <Loader2 className="animate-spin" /> : `💳 Online zahlen (${price}€)`}
              </Button>

              <Button variant="outline" className="w-full" disabled={isBooking} onClick={handleBook}>
                 Vor Ort bezahlen
              </Button>
            </div>
          )}
           
        </div>
      </DialogContent>
    </Dialog>
  )
}