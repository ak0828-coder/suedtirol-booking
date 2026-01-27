'use server'

import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { Resend } from 'resend';
import { BookingEmailTemplate } from '@/components/emails/booking-template';
import { format } from "date-fns"
import { stripe } from "@/lib/stripe"
import { redirect } from "next/navigation"

// ZURÜCK AUF PROFI: Wir laden den Key wieder sicher aus der .env Datei
const resend = new Resend(process.env.RESEND_API_KEY);

// UPDATE: Neuer Parameter am Ende hinzugefügt
export async function createBooking(
  courtId: string, 
  clubSlug: string,
  date: Date, 
  time: string,
  price: number,
  paymentMethod: 'paid_cash' | 'paid_stripe' = 'paid_cash' // Standard ist Cash
) {
  // 1. Datum und Zeit kombinieren für den Start
  const [hours, minutes] = time.split(':').map(Number)
  
  const startTime = new Date(date)
  startTime.setHours(hours, minutes, 0, 0)
  
  const endTime = new Date(startTime)
  endTime.setHours(hours + 1, minutes, 0, 0)

  // 2. Prüfen, ob schon belegt ist
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
  const { error } = await supabase
    .from('bookings')
    .insert({
      court_id: courtId,
      club_id: (await supabase.from('clubs').select('id').eq('slug', clubSlug).single()).data?.id,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      status: 'confirmed',
      payment_status: paymentMethod, // Hier wird der korrekte Status gesetzt
      guest_name: 'Gast Buchung (Demo)' 
    })

  if (error) {
    console.error(error)
    return { success: false, error: "Datenbankfehler beim Speichern." }
  }

  // 5. E-Mail senden
  try {
    const { data, error: resendError } = await resend.emails.send({
      from: 'Suedtirol Booking <onboarding@resend.dev>', 
      to: ['alexander.kofler06@gmail.com'], 
      subject: `Buchungsbestätigung: ${format(date, 'dd.MM.yyyy')} um ${time} Uhr`,
      react: <BookingEmailTemplate 
        guestName="Gast Buchung"
        courtName="Tennisplatz"
        date={format(date, 'dd.MM.yyyy')}
        time={time}
        price={price}
      />,
    });

    if (resendError) {
      console.error("Resend hat die Mail abgelehnt:", resendError);
    } else {
      console.log("Resend hat die Mail akzeptiert! ID:", data?.id);
    }

  } catch (err) {
    console.error("Kritischer Fehler beim Senden:", err);
  }

  // 4. Die Seite aktualisieren
  revalidatePath(`/club/${clubSlug}`)
  
  return { success: true }
}

// --- STRIPE CHECKOUT SESSION ---
export async function createCheckoutSession(
  courtId: string,
  clubSlug: string,
  date: Date,
  time: string,
  price: number,
  courtName: string
) {
  const bookingData = {
    courtId,
    clubSlug,
    date: date.toISOString(),
    time,
    price: price.toString(),
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'], 
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Buchung: ${courtName}`,
            description: `${format(date, 'dd.MM.yyyy')} um ${time} Uhr`,
          },
          unit_amount: price * 100, 
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    metadata: bookingData,
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/club/${clubSlug}?canceled=true`,
  })

  if (session.url) {
    return { url: session.url }
  } else {
    return { error: "Fehler beim Erstellen der Zahlung." }
  }
}

// --- HELPER FUNCTIONS ---
export async function getBookedSlots(courtId: string, date: Date) {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

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

  const bookedHours = bookings.map((b) => {
    const date = new Date(b.start_time)
    return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
  })

  return bookedHours
}

export async function deleteBooking(bookingId: string) {
  const { data: booking } = await supabase
    .from('bookings')
    .select('*, clubs(slug)') 
    .eq('id', bookingId)
    .single()

  if (!booking) return { success: false, error: "Buchung nicht gefunden" }

  // @ts-ignore
  const clubSlug = booking.clubs?.slug

  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', bookingId)

  if (error) {
    return { success: false, error: error.message }
  }

  if (clubSlug) {
    revalidatePath(`/club/${clubSlug}/admin`) 
    revalidatePath(`/club/${clubSlug}`)
  }
  
  return { success: true }
}