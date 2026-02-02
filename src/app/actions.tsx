'use server'

import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"
import { Resend } from 'resend'
import { BookingEmailTemplate } from '@/components/emails/booking-template'
import { format } from "date-fns"
import { stripe } from "@/lib/stripe"

const resend = new Resend(process.env.RESEND_API_KEY)

const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL?.toLowerCase() || ""

if (!SUPER_ADMIN_EMAIL) console.warn("⚠️ ACHTUNG: SUPER_ADMIN_EMAIL ist nicht in .env gesetzt!")

type PaymentStatus = 'paid_cash' | 'paid_stripe' | 'paid_member'

// --- NEU: GUTSCHEIN VALIDIEREN ---
export async function validateCreditCode(clubSlug: string, code: string) {
  const supabase = await createClient()

  // Club ID holen
  const { data: club } = await supabase.from('clubs').select('id').eq('slug', clubSlug).single()
  if (!club) return { success: false, error: "Club nicht gefunden" }

  // Code suchen
  const { data: credit } = await supabase
    .from('credit_codes')
    .select('*')
    .eq('club_id', club.id)
    .eq('code', code)
    .eq('is_redeemed', false)
    .single()

  if (!credit) {
    return { success: false, error: "Code ungültig oder bereits eingelöst." }
  }

  return { success: true, amount: credit.amount, codeId: credit.id }
}

// --- PASSWORT ÄNDERN (Für den 1. Login) ---
export async function updateUserPassword(newPassword: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
    data: { must_change_password: false }
  })

  if (error) return { success: false, error: error.message }

  return { success: true }
}

// --- HELPER: FINDE DEN SLUG FÜR DEN EINGELOGGTEN USER ---
export async function getMyClubSlug() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !user.email) return null

  if (user.email.toLowerCase() === SUPER_ADMIN_EMAIL) {
    return "SUPER_ADMIN_MODE"
  }

  const { data: club } = await supabase
    .from('clubs')
    .select('slug')
    .eq('owner_id', user.id)
    .single()

  return club?.slug || null
}

// --- HELPER FÜR DAS LOGIN SYSTEM (MULTI-ROLE) ---
export async function getUserRole() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !user.email) return null

  if (user.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
    return { type: 'super_admin' }
  }

  const { data: ownedClubs } = await supabase
    .from('clubs')
    .select('slug, name')
    .eq('owner_id', user.id)

  const { data: memberships } = await supabase
    .from('club_members')
    .select('clubs(slug, name)')
    .eq('user_id', user.id)

  const adminRoles = ownedClubs?.map(c => ({ role: 'club_admin', slug: c.slug, name: c.name })) || []

  // @ts-ignore
  const memberRoles = memberships?.map(m => ({ role: 'member', slug: m.clubs?.slug, name: m.clubs?.name })) || []

  const allRoles = [...adminRoles, ...memberRoles]

  return {
    type: 'multi',
    roles: allRoles,
    userEmail: user.email
  }
}

// ==========================================
// --- PROFIL & MEMBER MANAGEMENT ---
// ==========================================

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Nicht eingeloggt" }

  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const phone = formData.get("phone") as string

  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      first_name: firstName,
      last_name: lastName,
      phone: phone,
      updated_at: new Date().toISOString()
    })

  if (error) return { success: false, error: error.message }

  await supabase.auth.updateUser({
    data: { full_name: `${firstName} ${lastName}` }
  })

  revalidatePath('/dashboard')
  return { success: true, message: "Profil gespeichert!" }
}

export async function getProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return data
}

export async function updateMemberDetails(memberId: string, clubSlug: string, notes: string, validUntil: string | null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Nicht eingeloggt" }

  const { error } = await supabase
    .from('club_members')
    .update({
      internal_notes: notes,
      medical_certificate_valid_until: validUntil ? validUntil : null
    })
    .eq('id', memberId)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/club/${clubSlug}/admin/members`)
  return { success: true }
}

export async function getClubMembers(clubSlug: string) {
  const supabase = await createClient()

  const { data: club } = await supabase.from('clubs').select('id').eq('slug', clubSlug).single()
  if (!club) return []

  const { data: members, error } = await supabase
    .from('club_members')
    .select(`
            *,
            profiles:user_id (first_name, last_name, phone, id)
        `)
    .eq('club_id', club.id)

  if (error) {
    console.error("Member fetch error:", error)
    return []
  }

  return members
}

// --- SUPER ADMIN ACTIONS ---

export async function createClub(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !user.email || user.email.toLowerCase() !== SUPER_ADMIN_EMAIL) {
    return { success: false, error: "Nicht autorisiert!" }
  }

  const name = formData.get("name") as string
  const slug = formData.get("slug") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true,
    user_metadata: {
      must_change_password: true,
      name: name,
      full_name: name
    }
  })

  if (authError || !authData.user) {
    return { success: false, error: "Fehler beim User-Erstellen: " + authError?.message }
  }

  const { error: dbError } = await supabaseAdmin
    .from('clubs')
    .insert([
      {
        name: name,
        slug: slug,
        primary_color: '#0f172a',
        admin_email: email,
        owner_id: authData.user.id
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

  if (!user || !user.email || user.email.toLowerCase() !== SUPER_ADMIN_EMAIL) {
    return { success: false, error: "Nicht autorisiert!" }
  }

  const clubId = formData.get("clubId") as string
  const name = formData.get("name") as string
  const primaryColor = formData.get("primary_color") as string
  const logoFile = formData.get("logo") as File

  const cancellationHours = formData.get("cancellation_buffer_hours")
    ? parseInt(formData.get("cancellation_buffer_hours") as string)
    : 24

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
    cancellation_buffer_hours: cancellationHours
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

  if (!user || !user.email || user.email.toLowerCase() !== SUPER_ADMIN_EMAIL) {
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

// --- MEMBERSHIP PLANS & ABO CHECKOUT ---

export async function createMembershipPlan(clubSlug: string, name: string, price: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Nicht eingeloggt" }

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: club } = await supabaseAdmin.from('clubs').select('id, owner_id, name').eq('slug', clubSlug).single()

  if (!club) return { error: "Club nicht gefunden" }

  const SUPER_ADMIN = process.env.SUPER_ADMIN_EMAIL?.toLowerCase()
  if (club.owner_id !== user.id && user.email?.toLowerCase() !== SUPER_ADMIN) {
    return { error: "Keine Rechte" }
  }

  try {
    const stripeProduct = await stripe.products.create({
      name: `${club.name} - ${name}`,
    })

    const stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: price * 100,
      currency: 'eur',
      recurring: { interval: 'year' },
    })

    const { error } = await supabaseAdmin.from('membership_plans').insert({
      club_id: club.id,
      name: name,
      price: price,
      stripe_price_id: stripePrice.id
    })

    if (error) return { error: "DB Fehler: " + error.message }

    revalidatePath(`/club/${clubSlug}/admin`)
    revalidatePath(`/club/${clubSlug}`)
    return { success: true }

  } catch (err: any) {
    console.error(err)
    return { error: "Stripe Fehler: " + err.message }
  }
}

export async function deleteMembershipPlan(id: string) {
  const supabase = await createClient()
  await supabase.from('membership_plans').delete().eq('id', id)
  return { success: true }
}

export async function createMembershipCheckout(clubSlug: string, planId: string, stripePriceId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: club } = await supabase.from('clubs').select('id').eq('slug', clubSlug).single()
  if (!club) return { url: "" }

  const metadata: any = {
    clubId: club.id,
    planId: planId,
    type: 'membership_subscription'
  }

  if (user) {
    metadata.userId = user.id
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{ price: stripePriceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/club/${clubSlug}?membership_success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/club/${clubSlug}`,
    customer_email: user?.email,
    metadata: metadata
  })

  return { url: session.url }
}

// --- BOOKING ACTIONS (MIT GUTSCHEIN UPDATE) ---

export async function createBooking(
  courtId: string,
  clubSlug: string,
  date: Date,
  time: string,
  price: number,
  durationMinutes: number,
  paymentMethod: 'paid_cash' | 'paid_stripe' = 'paid_cash',
  creditCode?: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: club } = await supabase.from('clubs').select('id, admin_email').eq('slug', clubSlug).single()
  if (!club) return { success: false, error: "Club nicht gefunden" }

  let finalPrice = price
  let finalPaymentStatus: PaymentStatus = paymentMethod
  let usedCreditAmount = 0

  // 1. Check: Ist es ein aktives Mitglied?
  if (user) {
    const { data: member } = await supabase
      .from('club_members')
      .select('*')
      .eq('club_id', club.id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (member) {
      if (member.valid_until && new Date(member.valid_until) > new Date()) {
        finalPrice = 0
        finalPaymentStatus = 'paid_member'
      }
    }
  }

  // 2. Zeitberechnung & Slot Check (BEVOR wir den Code einlösen)
  const [hours, minutes] = time.split(':').map(Number)
  const startTime = new Date(date)
  startTime.setHours(hours, minutes, 0, 0)
  const endTime = new Date(startTime.getTime() + durationMinutes * 60000)

  const { data: existing } = await supabase
    .from('bookings')
    .select('id')
    .eq('court_id', courtId)
    .eq('start_time', startTime.toISOString())
    .single()

  if (existing) {
    return { success: false, error: "Dieser Termin ist leider schon vergeben!" }
  }

  // 3. Gutschein einlösen (Falls kein Mitglied & Code vorhanden)
  if (finalPrice > 0 && creditCode) {
    const check = await validateCreditCode(clubSlug, creditCode)
    if (!check.success) return { success: false, error: check.error }

    await supabase.from('credit_codes')
      .update({ is_redeemed: true })
      .eq('code', creditCode)

    usedCreditAmount = check.amount || 0

    finalPrice = usedCreditAmount
    finalPaymentStatus = 'paid_stripe'
  }

  // 4. Buchung speichern
  const { error } = await supabase
    .from('bookings')
    .insert({
      court_id: courtId,
      club_id: club.id,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      status: 'confirmed',
      payment_status: finalPaymentStatus,
      price_paid: finalPrice,
      guest_name: user ? 'Mitglied' : 'Gast (Gutschein)'
    })

  if (error) {
    console.error(error)
    return { success: false, error: "Datenbankfehler." }
  }

  // Mail versenden
  try {
    const orderId = "ORD-" + Math.floor(Math.random() * 100000)
    const recipient = club.admin_email || SUPER_ADMIN_EMAIL || "fallback@example.com"

    await resend.emails.send({
      from: 'Suedtirol Booking <onboarding@resend.dev>',
      to: [recipient],
      subject: `Buchung: ${format(date, 'dd.MM.yyyy')} um ${time}`,
      react: <BookingEmailTemplate
        guestName={user ? "Mitglied" : "Gast"}
        courtName="Tennisplatz"
        date={format(date, 'dd.MM.yyyy')}
        time={time}
        price={finalPrice}
        orderId={orderId}
      />,
    })
  } catch (err) {
    console.error("Mail Fehler:", err)
  }

  revalidatePath(`/club/${clubSlug}`)
  return { success: true }
}

export async function cancelBooking(bookingId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: "Nicht eingeloggt" }

  const { data: booking } = await supabase
    .from('bookings')
    .select(`
            *,
            clubs (id, slug, cancellation_buffer_hours, name)
        `)
    .eq('id', bookingId)
    .single()

  if (!booking) return { success: false, error: "Buchung nicht gefunden" }

  const bookingStart = new Date(booking.start_time)
  const now = new Date()
  const diffInHours = (bookingStart.getTime() - now.getTime()) / (1000 * 60 * 60)

  // @ts-ignore
  const limitHours = booking.clubs?.cancellation_buffer_hours || 24

  if (diffInHours < limitHours) {
    return { success: false, error: `Stornierung nur bis ${limitHours}h vor Termin möglich.` }
  }

  // @ts-ignore
  const clubId = booking.clubs?.id
  let message = "Erfolgreich storniert."

  if (booking.payment_status === 'paid_stripe' && booking.price_paid > 0) {
    const code = `REFUND-${Math.random().toString(36).substring(2, 9).toUpperCase()}`

    await supabase.from('credit_codes').insert({
      club_id: clubId,
      code: code,
      amount: booking.price_paid,
      created_for_email: user.email
    })

    message = `Storniert. Dein Gutschein-Code über ${booking.price_paid}€ lautet: ${code}`

    await supabase.from('bookings').delete().eq('id', bookingId)
  } else {
    await supabase.from('bookings').delete().eq('id', bookingId)
  }

  // @ts-ignore
  revalidatePath(`/club/${booking.clubs?.slug}/dashboard`)
  return { success: true, message: message }
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

// --- STRIPE CHECKOUT MIT GUTSCHEIN ---

export async function createCheckoutSession(
  courtId: string,
  clubSlug: string,
  date: Date,
  time: string,
  price: number,
  courtName: string,
  durationMinutes: number,
  creditCode?: string
) {
  let finalPrice = price
  let metadata: any = {
    courtId, clubSlug,
    date: date.toISOString(),
    time,
    price: price.toString(),
    durationMinutes: durationMinutes.toString()
  }

  // Wenn Code dabei ist, validieren und Preis senken
  if (creditCode) {
    const check = await validateCreditCode(clubSlug, creditCode)
    if (check.success && check.amount) {
      finalPrice = price - check.amount
      if (finalPrice < 0) finalPrice = 0

      metadata.creditCode = creditCode
    }
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'eur',
        product_data: { name: `Buchung: ${courtName} (${durationMinutes} Min)` },
        unit_amount: Math.round(finalPrice * 100),
      },
      quantity: 1,
    }],
    mode: 'payment',
    metadata: metadata,
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

export async function updateCourtHours(courtId: string, startHour: number, endHour: number) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Nicht eingeloggt" }

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: court } = await supabaseAdmin.from('courts').select('club_id, clubs(owner_id)').eq('id', courtId).single()

  // @ts-ignore
  const ownerId = court?.clubs?.owner_id
  const SUPER_ADMIN = process.env.SUPER_ADMIN_EMAIL?.toLowerCase()

  if (ownerId !== user.id && user.email?.toLowerCase() !== SUPER_ADMIN) {
    return { success: false, error: "Keine Berechtigung" }
  }

  const { error } = await supabaseAdmin
    .from('courts')
    .update({ start_hour: startHour, end_hour: endHour })
    .eq('id', courtId)

  if (error) return { success: false, error: error.message }

  return { success: true }
}

export async function createBlockedPeriod(
  clubSlug: string,
  courtId: string | null,
  startDate: Date,
  endDate: Date,
  reason: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Auth required" }

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: club } = await supabaseAdmin.from('clubs').select('id, owner_id').eq('slug', clubSlug).single()

  if (!club) {
    return { success: false, error: "Club nicht gefunden" }
  }

  const SUPER_ADMIN = process.env.SUPER_ADMIN_EMAIL?.toLowerCase()
  if (club.owner_id !== user.id && user.email?.toLowerCase() !== SUPER_ADMIN) {
    return { success: false, error: "Keine Rechte" }
  }

  const { error } = await supabaseAdmin.from('blocked_periods').insert({
    club_id: club.id,
    court_id: courtId === "all" ? null : courtId,
    start_date: format(startDate, 'yyyy-MM-dd'),
    end_date: format(endDate, 'yyyy-MM-dd'),
    reason: reason
  })

  if (error) return { success: false, error: error.message }

  revalidatePath(`/club/${clubSlug}`)
  revalidatePath(`/club/${clubSlug}/admin`)
  return { success: true }
}

export async function deleteBlockedPeriod(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Auth required" }

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: block } = await supabaseAdmin.from('blocked_periods').select('club_id, clubs(owner_id)').eq('id', id).single()

  // @ts-ignore
  const ownerId = block?.clubs?.owner_id
  const SUPER_ADMIN = process.env.SUPER_ADMIN_EMAIL?.toLowerCase()

  if (ownerId !== user.id && user.email?.toLowerCase() !== SUPER_ADMIN) {
    return { success: false, error: "Keine Rechte" }
  }

  const { error } = await supabaseAdmin.from('blocked_periods').delete().eq('id', id)

  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function getBlockedDates(clubSlug: string, courtId: string) {
  const supabase = await createClient()

  const { data: club } = await supabase.from('clubs').select('id').eq('slug', clubSlug).single()
  if (!club) return []

  const { data } = await supabase
    .from('blocked_periods')
    .select('*')
    .eq('club_id', club.id)
    .or(`court_id.eq.${courtId},court_id.is.null`)
    .gte('end_date', new Date().toISOString())

  return data || []
}

export async function requestPasswordReset(email: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback?next=/change-password`,
  })

  if (error) return { success: false, error: error.message }
  return { success: true }
}
