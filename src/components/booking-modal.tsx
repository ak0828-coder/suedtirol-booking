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
import { format } from "date-fns"
import { de } from "date-fns/locale"
// NEU: createCheckoutSession importiert
import { createBooking, getBookedSlots, createCheckoutSession } from "@/app/actions" 
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
  
  const [bookedSlots, setBookedSlots] = useState<string[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)

  const timeSlots = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"]

  useEffect(() => {
    async function fetchSlots() {
      if (!date) return
      setIsLoadingSlots(true)
      const slots = await getBookedSlots(courtId, date)
      setBookedSlots(slots)
      setIsLoadingSlots(false)
    }

    if (isOpen) {
      fetchSlots()
    }
  }, [date, courtId, isOpen])


  const handleBook = async () => {
    if (!date || !selectedTime) return
    setIsBooking(true)
    const result = await createBooking(courtId, clubSlug, date, selectedTime, price)
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
        <Button className="bg-primary hover:bg-primary/90 text-white">
          Buchen
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white text-black">
        <DialogHeader>
          <DialogTitle>Buchung: {courtName}</DialogTitle>
          <DialogDescription>
            Wähle deine bevorzugte Zahlungsart.
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
                  const isBooked = bookedSlots.includes(time)

                  return (
                    <Button
                      key={time}
                      variant={isBooked ? "ghost" : (selectedTime === time ? "default" : "outline")}
                      className={`text-xs ${isBooked ? 'text-red-300 decoration-slate-400 line-through cursor-not-allowed bg-slate-50' : ''}`}
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

          {/* DIESER TEIL IST NEU: DIE BEIDEN BUTTONS */}
          <div className="flex flex-col gap-2 w-full mt-4">
            {/* OPTION 1: ONLINE ZAHLEN */}
            <Button 
              className="w-full bg-slate-900 hover:bg-slate-800" 
              disabled={!date || !selectedTime || isBooking}
              onClick={async () => {
                if (!date || !selectedTime) return
                setIsBooking(true)
                
                // 1. Stripe Session holen
                const result = await createCheckoutSession(
                  courtId, 
                  clubSlug, 
                  date, 
                  selectedTime, 
                  price, 
                  courtName
                )

                // 2. Weiterleiten zu Stripe
                if (result && result.url) {
                  window.location.href = result.url
                } else {
                  alert("Fehler bei der Zahlung")
                  setIsBooking(false)
                }
              }}
            >
              {isBooking ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Leite weiter...</>
              ) : (
                `💳 Online zahlen (${price}€)`
              )}
            </Button>

            {/* OPTION 2: VOR ORT (WIE VORHER) */}
            <Button 
              variant="outline"
              className="w-full"
              disabled={!date || !selectedTime || isBooking}
              onClick={handleBook}
            >
               Vor Ort bezahlen
            </Button>
          </div>
          
        </div>
      </DialogContent>
    </Dialog>
  )
}