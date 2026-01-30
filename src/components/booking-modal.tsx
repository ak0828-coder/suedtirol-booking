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
import { createBooking, getBookedSlots, createCheckoutSession } from "@/app/actions" 
import { generateTimeSlots } from "@/lib/utils"
import { Loader2, Calendar as CalendarIcon, Clock } from "lucide-react"

interface BookingModalProps {
  courtId: string
  courtName: string
  price: number
  clubSlug: string
  durationMinutes: number
}

export function BookingModal({ courtId, courtName, price, clubSlug, durationMinutes }: BookingModalProps) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isBooking, setIsBooking] = useState(false)
   
  const [bookedSlots, setBookedSlots] = useState<string[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)

  // Slots berechnen
  const timeSlots = generateTimeSlots(8, 22, durationMinutes)

  useEffect(() => {
    async function fetchSlots() {
      if (!date) return
      setIsLoadingSlots(true)
      try {
        const slots = await getBookedSlots(courtId, date)
        setBookedSlots(slots || []) 
      } catch (error) {
        console.error("Fehler beim Laden der Slots:", error)
        setBookedSlots([])
      } finally {
        setIsLoadingSlots(false)
      }
    }

    if (isOpen) {
      fetchSlots()
    }
  }, [date, courtId, isOpen])


  const handleBook = async () => {
    if (!date || !selectedTime) return
    setIsBooking(true)
    
    // WICHTIG: durationMinutes wird jetzt übergeben!
    const result = await createBooking(courtId, clubSlug, date, selectedTime, price, durationMinutes)
    
    setIsBooking(false)

    if (result.success) {
      alert("✅ Buchung erfolgreich gespeichert!")
      setIsOpen(false)
      setSelectedTime(null)
      window.location.reload() 
    } else {
      alert("❌ Fehler: " + result.error)
    }
  }

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
             Wähle Datum und Uhrzeit für dein Spiel.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          
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
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                initialFocus
                className="bg-white rounded-md shadow-sm"
              />
            </div>
          </div>

          {date && (
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
            </div>
          )}

          {selectedTime && (
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
                   const result = await createCheckoutSession(courtId, clubSlug, date!, selectedTime, price, courtName)
                   if (result?.url) window.location.href = result.url
                   else { alert("Fehler"); setIsBooking(false); }
                }}
              >
                {isBooking ? <Loader2 className="animate-spin" /> : `💳 Online zahlen (${price}€)`}
              </Button>

              <Button 
                variant="outline"
                className="w-full"
                disabled={isBooking}
                onClick={handleBook}
              >
                 Vor Ort bezahlen
              </Button>
            </div>
          )}
           
        </div>
      </DialogContent>
    </Dialog>
  )
}