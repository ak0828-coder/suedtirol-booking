import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// --- ZEIT SLOTS GENERATOR ---
// Berechnet Startzeiten basierend auf der Dauer (z.B. 08:00, 09:30, 11:00...)
export function generateTimeSlots(startHour: number, endHour: number, durationMinutes: number) {
  const slots = []
  let currentTime = startHour * 60 // Startzeit in Minuten ab Mitternacht (z.B. 8:00 = 480)
  const endTime = endHour * 60

  while (currentTime + durationMinutes <= endTime) {
    const hours = Math.floor(currentTime / 60)
    const minutes = currentTime % 60
    
    // Formatierung: "8:0" -> "08:00"
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    slots.push(timeString)
    
    currentTime += durationMinutes
  }
  
  return slots
}

// --- BLOCKIERUNGS CHECKER ---
// Prüft, ob 'checkDate' innerhalb von start und end liegt (inklusive)
export function isDateBlocked(checkDate: Date, blockedPeriods: any[]) {
  const checkTime = checkDate.getTime()
  
  // Wir normalisieren auf Mitternacht, um Zeitprobleme zu vermeiden
  const d = new Date(checkDate)
  d.setHours(0,0,0,0)

  const block = blockedPeriods.find(p => {
    const start = new Date(p.start_date)
    start.setHours(0,0,0,0)
    
    const end = new Date(p.end_date)
    end.setHours(23,59,59,999) // Ende des Tages

    return d >= start && d <= end
  })

  return block // Gibt den Block-Grund zurück oder undefined
}