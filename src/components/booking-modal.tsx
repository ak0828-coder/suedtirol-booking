"use client"

import { useState, useEffect } from "react" // useEffect ist neu!
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
import { format } from "date-fns"
import { de } from "date-fns/locale"
// Importiere BEIDE Funktionen:
import { createBooking, getBookedSlots } from "@/app/actions" 
import { Loader2 } from "lucide-react"

interface BookingModalProps {
  courtId: string
  courtName: string
  price: number
  clubSlug: string
}

export function BookingModal({ courtId, courtName, price, clubSlug }: BookingModalProps) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isBooking, setIsBooking] = useState(false)
  
  // NEU: Hier speichern wir, welche Zeiten schon weg sind
  const [bookedSlots, setBookedSlots] = useState<string[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)

  const timeSlots = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"]

  // NEU: Jedes Mal, wenn sich das Datum ändert, laden wir die belegten Zeiten
  useEffect(() => {
    async function fetchSlots() {
      if (!date) return
      setIsLoadingSlots(true)
      // Server fragen...
      const slots = await getBookedSlots(courtId, date)
      setBookedSlots(slots)
      setIsLoadingSlots(false)
    }

    if (isOpen) {
      fetchSlots()
    }
  }, [date, courtId, isOpen]) // Läuft, wenn Datum, Platz oder Modal sich ändert


  const handleBook = async () => {
    if (!date || !selectedTime) return
    setIsBooking(true)
    const result = await createBooking(courtId, clubSlug, date, selectedTime, price)
    setIsBooking(false)

    if (result.success) {
      alert("✅ Buchung erfolgreich gespeichert!")
      setIsOpen(false)
      setSelectedTime(null)
      // Optional: Seite neu laden, damit alles frisch ist
      window.location.reload() 
    } else {
      alert("❌ Fehler: " + result.error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-white">
          Buchen
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white text-black">
        <DialogHeader>
          <DialogTitle>Buchung: {courtName}</DialogTitle>
          <DialogDescription>
            {price}€ werden vor Ort bezahlt.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4 items-center">
          <div className="border rounded-md p-2">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              locale={de}
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              initialFocus
            />
          </div>

          {date && (
            <div className="w-full">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium">Zeit wählen:</h4>
                {isLoadingSlots && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map((time) => {
                  // Prüfen, ob die Zeit in der Liste der gebuchten Slots ist
                  const isBooked = bookedSlots.includes(time)

                  return (
                    <Button
                      key={time}
                      // Wenn gebucht -> 'ghost' (grau), sonst Outline oder Solid
                      variant={isBooked ? "ghost" : (selectedTime === time ? "default" : "outline")}
                      className={`text-xs ${isBooked ? 'text-red-300 decoration-slate-400 line-through cursor-not-allowed bg-slate-50' : ''}`}
                      disabled={isBooked} // Button sperren!
                      onClick={() => setSelectedTime(time)}
                    >
                      {time}
                    </Button>
                  )
                })}
              </div>
            </div>
          )}

          <Button 
            className="w-full mt-4" 
            disabled={!date || !selectedTime || isBooking}
            onClick={handleBook}
          >
            {isBooking ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Speichere...</>
            ) : (
              `Jetzt verbindlich buchen`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}