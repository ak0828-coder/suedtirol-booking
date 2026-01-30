'use server'

import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"
import { Resend } from 'resend'
import { BookingEmailTemplate } from '@/components/emails/booking-template'
import { format } from "date-fns"
import { stripe } from "@/lib/stripe"

const resend = new Resend(process.env.RESEND_API_KEY)
const SUPER_ADMIN_EMAIL = "alexander.kofler06@gmail.com"

// --- HELPER: FINDE DEN SLUG FÜR DEN EINGELOGGTEN USER ---
export async function getMyClubSlug() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // 1. Check: Ist es der Super Admin?
  if (user.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
      return "SUPER_ADMIN_MODE"
  }

  // 2. Check: Welcher Club gehört dieser User-ID?
  const { data: club } = await supabase
    .from('clubs')
    .select('slug')
    .eq('owner_id', user.id)
    .single()

  return club?.slug || null
}

// --- SUPER ADMIN ACTIONS ---

export async function createClub(formData: FormData) {
  const supabase = await createClient()
  
  // 1. Sicherheit: Prüfen, wer eingeloggt ist
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email?.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
     return { success: false, error: "Nicht autorisiert!" }
  }

  // 2. Daten aus Formular
  const name = formData.get("name") as string
  const slug = formData.get("slug") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  // 3. Admin-Client für User-Erstellung
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // 4. User erstellen
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true
  })

  if (authError || !authData.user) {
    return { success: false, error: "Fehler beim User-Erstellen: " + authError?.message }
  }

  // 5. Verein erstellen
  const { error: dbError } = await supabaseAdmin
    .from('clubs')
    .insert([
      { 
        name: name,
        slug: slug,
        primary_color: '#0f172a',
        admin_email: email,      
        owner_id: authData.user.id // WICHTIG: Verknüpfung für den Login
      }
    ])

  if (dbError) {
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
    return { success: false, error: "Datenbankfehler (Slug schon vergeben?): " + dbError.message }
  }

  revalidatePath('/super-admin')
  return { success: true, message: `Verein '${name}' erstellt!` }
}

export async function updateClub(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user || user.email?.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
     return { success: false, error: "Nicht autorisiert!" }
  }

  const clubId = formData.get("clubId") as string
  const name = formData.get("name") as string
  const primaryColor = formData.get("primary_color") as string
  const logoFile = formData.get("logo") as File 

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  let logoUrl = null

  if (logoFile && logoFile.size > 0) {
    const fileExt = logoFile.name.split('.').pop()
    const fileName = `${clubId}-${Date.now()}.${fileExt}`

    const arrayBuffer = await logoFile.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    const { error: uploadError } = await supabaseAdmin
      .storage
      .from('club-logos')
      .upload(fileName, buffer, {
        contentType: logoFile.type,
        upsert: true
      })

    if (uploadError) {
      console.error("Upload Fehler:", uploadError)
      return { success: false, error: "Bild-Upload fehlgeschlagen" }
    }

    const { data: { publicUrl } } = supabaseAdmin
      .storage
      .from('club-logos')
      .getPublicUrl(fileName)
    
    logoUrl = publicUrl
  }

  const updateData: any = {
    name: name,
    primary_color: primaryColor,
  }

  if (logoUrl) {
    updateData.logo_url = logoUrl
  }

  const { error } = await supabaseAdmin
    .from('clubs')
    .update(updateData)
    .eq('id', clubId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/super-admin')
  revalidatePath(`/club/${formData.get("slug")}`)
  
  return { success: true, message: "Verein aktualisiert!" }
}

export async function deleteClub(clubId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email?.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
     return { success: false, error: "Nicht autorisiert!" }
  }
  
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: club } = await supabaseAdmin.from('clubs').select('owner_id').eq('id', clubId).single()
  
  const { error } = await supabaseAdmin.from('clubs').delete().eq('id', clubId)

  if (error) return { success: false, error: error.message }

  if (club?.owner_id) {
      await supabaseAdmin.auth.admin.deleteUser(club.owner_id)
  }

  revalidatePath('/super-admin')
  return { success: true, message: "Verein gelöscht." }
}

// --- BOOKING ACTIONS ---

export async function createBooking(
  courtId: string, 
  clubSlug: string,
  date: Date, 
  time: string,
  price: number,
  durationMinutes: number, // <--- NEU: Wir brauchen die Dauer für das Ende!
  paymentMethod: 'paid_cash' | 'paid_stripe' = 'paid_cash'
) {
  const supabase = await createClient()
  
  // 1. Datum Logik
  const [hours, minutes] = time.split(':').map(Number)
  
  const startTime = new Date(date)
  startTime.setHours(hours, minutes, 0, 0)
  
  // WICHTIG: Endzeit basierend auf der Dauer berechnen (nicht hartcodiert +1h)
  const endTime = new Date(startTime.getTime() + durationMinutes * 60000)

  // 2. Prüfen, ob schon belegt
  const { data: existing } = await supabase
    .from('bookings')
    .select('id')
    .eq('court_id', courtId)
    .eq('start_time', startTime.toISOString())
    .single()

  if (existing) {
    return { success: false, error: "Dieser Termin ist leider schon vergeben!" }
  }

  // 3. Club ID holen
  const { data: club } = await supabase.from('clubs').select('id, admin_email').eq('slug', clubSlug).single()
  if(!club) return { success: false, error: "Club nicht gefunden" }

  // 4. Speichern
  const { error } = await supabase
    .from('bookings')
    .insert({
      court_id: courtId,
      club_id: club.id,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      status: 'confirmed',
      payment_status: paymentMethod,
      guest_name: 'Gast Buchung' 
    })

  if (error) {
    console.error(error)
    return { success: false, error: "Datenbankfehler." }
  }

  // 5. E-Mail
  try {
    const orderId = "ORD-" + Math.floor(Math.random() * 100000);
    
    // Versucht an die Club-Admin Email zu senden, sonst an dich
    const recipient = club.admin_email || SUPER_ADMIN_EMAIL;

    await resend.emails.send({
      from: 'Suedtirol Booking <onboarding@resend.dev>', 
      to: [recipient], 
      subject: `Buchung: ${format(date, 'dd.MM.yyyy')} um ${time}`,
      react: <BookingEmailTemplate 
        guestName="Gast"
        courtName="Tennisplatz"
        date={format(date, 'dd.MM.yyyy')}
        time={time}
        price={price}
        orderId={orderId}
      />,
    });
  } catch (err) {
    console.error("Mail Fehler:", err);
  }

  revalidatePath(`/club/${clubSlug}`)
  return { success: true }
}

export async function deleteBooking(bookingId: string) {
  const supabase = await createClient()

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

// --- CLUB MANAGEMENT (Admin) ---

export async function createCourt(
  clubSlug: string, 
  name: string, 
  price: number,
  duration: number
) {
  const supabase = await createClient()
  
  const { data: clubData, error: clubError } = await supabase
    .from('clubs')
    .select('id')
    .eq('slug', clubSlug)
    .single()

  if (clubError || !clubData) return { error: "Club nicht gefunden." }

  const { data, error } = await supabase
    .from('courts')
    .insert([{ 
        club_id: clubData.id,
        club_slug: clubSlug,
        name: name,
        description: `Platz (${duration} Min)`,
        price_per_hour: price,
        duration_minutes: duration,
        sport_type: 'tennis'
    }])
    .select()

  if (error) return { error: error.message }
  
  revalidatePath(`/club/${clubSlug}`)
  revalidatePath(`/club/${clubSlug}/admin`)
  return { success: true, court: data[0] }
}

export async function deleteCourt(courtId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('courts').delete().eq('id', courtId)
  if (error) return { error: error.message }
  return { success: true }
}

// --- STRIPE ---

export async function createCheckoutSession(
  courtId: string,
  clubSlug: string,
  date: Date,
  time: string,
  price: number,
  courtName: string
) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'], 
    line_items: [{
        price_data: {
          currency: 'eur',
          product_data: { name: `Buchung: ${courtName}` },
          unit_amount: price * 100, 
        },
        quantity: 1,
    }],
    mode: 'payment',
    metadata: { courtId, clubSlug, date: date.toISOString(), time, price: price.toString() },
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/club/${clubSlug}?canceled=true`,
  })

  return { url: session.url }
}

// --- HELPER FUNCTIONS ---
export async function getBookedSlots(courtId: string, date: Date) {
  const supabase = await createClient()
  
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  const { data: bookings } = await supabase
    .from('bookings')
    .select('start_time')
    .eq('court_id', courtId)
    .gte('start_time', startOfDay.toISOString())
    .lte('start_time', endOfDay.toISOString())

  if (!bookings) return []

  return bookings.map((b) => {
    const d = new Date(b.start_time)
    return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
  })
}