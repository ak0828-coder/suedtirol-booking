'use server'

import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function createBooking(
  courtId: string, 
  clubSlug: string,
  date: Date, 
  time: string,
  price: number
) {
  // 1. Datum und Zeit kombinieren für den Start
  // Wir nehmen an, der Slot ist immer 60 min (fürs MVP)
  const [hours, minutes] = time.split(':').map(Number)
  
  const startTime = new Date(date)
  startTime.setHours(hours, minutes, 0, 0)
  
  const endTime = new Date(startTime)
  endTime.setHours(hours + 1, minutes, 0, 0)

  // 2. Prüfen, ob schon belegt ist (Sicherheit!)
  // Wir fragen die DB: Gibts schon eine Buchung zur gleichen Zeit auf diesem Platz?
  const { data: existing } = await supabase
    .from('bookings')
    .select('id')
    .eq('court_id', courtId)
    .eq('start_time', startTime.toISOString())
    .single()

  if (existing) {
    return { success: false, error: "Dieser Termin ist leider schon vergeben!" }
  }

  // 3. Buchung speichern
  // Da wir noch keinen Login haben, speichern wir es als "Gast"
  const { error } = await supabase
    .from('bookings')
    .insert({
      court_id: courtId,
      // club_id holen wir uns idealerweise sauberer, aber hier quick & dirty:
      // Wir brauchen die club_id eigentlich in der Tabelle. 
      // Für den Test lassen wir das Backend die ID über eine zweite Query holen oder wir übergeben sie.
      // Vereinfachung für jetzt: Wir holen die Club ID schnell
      club_id: (await supabase.from('clubs').select('id').eq('slug', clubSlug).single()).data?.id,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      status: 'confirmed',
      payment_status: 'paid_cash', // Simulieren wir erstmal
      guest_name: 'Gast Buchung (Demo)' 
    })

  if (error) {
    console.error(error)
    return { success: false, error: "Datenbankfehler beim Speichern." }
  }

  // 4. Die Seite aktualisieren, damit der Slot rot wird
  revalidatePath(`/club/${clubSlug}`)
  
  return { success: true }
}

export async function getBookedSlots(courtId: string, date: Date) {
  // 1. Start und Ende des gewählten Tages berechnen
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  // 2. Alle Buchungen für diesen Zeitraum laden
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('start_time')
    .eq('court_id', courtId)
    .gte('start_time', startOfDay.toISOString())
    .lte('start_time', endOfDay.toISOString())

  if (error) {
    console.error("Fehler beim Laden der Slots:", error)
    return []
  }

  // 3. Wir wandeln die kompletten Zeitstempel in einfache Stunden-Strings um ("10:00")
  // Damit das Frontend sie leicht vergleichen kann.
  const bookedHours = bookings.map((b) => {
    const date = new Date(b.start_time)
    // Wir nutzen 'de-DE', damit die Zeit stimmt (Zeitzonen!)
    return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
  })

  return bookedHours
}

export async function deleteBooking(bookingId: string) {
  // 1. Zuerst holen wir uns die Club-Info, damit wir wissen, welche Seite wir aktualisieren müssen
  // Wir brauchen den "slug" (z.B. tc-vinschgau)
  const { data: booking } = await supabase
    .from('bookings')
    .select('*, clubs(slug)') // Wir joinen die clubs Tabelle
    .eq('id', bookingId)
    .single()

  if (!booking) return { success: false, error: "Buchung nicht gefunden" }

  // @ts-ignore - Typescript weiß manchmal nicht, dass wir gejoint haben, das ignorieren wir kurz
  const clubSlug = booking.clubs?.slug

  // 2. Jetzt löschen
  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', bookingId)

  if (error) {
    return { success: false, error: error.message }
  }

  // 3. Jetzt aktualisieren wir die GENAUE Seite (keine Platzhalter mehr)
  if (clubSlug) {
    revalidatePath(`/club/${clubSlug}/admin`) 
    revalidatePath(`/club/${clubSlug}`)
  }
  
  return { success: true }
}