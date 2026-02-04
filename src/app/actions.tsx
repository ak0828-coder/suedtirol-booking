'use server'

import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"
import { Resend } from 'resend'
import { BookingEmailTemplate } from '@/components/emails/booking-template'
import { WelcomeMemberEmailTemplate } from '@/components/emails/welcome-member-template'
import { format } from "date-fns"
import { stripe } from "@/lib/stripe"

const resend = new Resend(process.env.RESEND_API_KEY)

const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL?.toLowerCase() || ""

if (!SUPER_ADMIN_EMAIL) console.warn("⚠️ ACHTUNG: SUPER_ADMIN_EMAIL ist nicht in .env gesetzt!")

type PaymentStatus = 'paid_cash' | 'paid_stripe' | 'paid_member'

// --- HELPER: ADMIN CLIENT ---
// Wird benötigt, um Gutscheine zu validieren (für Gäste ohne Account) 
// oder Updates zu machen, die RLS verbietet.
function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// ==========================================
// --- GUTSCHEIN / VOUCHER SYSTEM ---
// ==========================================

// 1. UPDATE: Validierung mit Admin Client (damit auch Gäste checken können)
export async function validateCreditCode(clubSlug: string, code: string) {
  // Wir nutzen hier den Admin Client, damit auch normale Mitglieder/Gäste
  // prüfen können, ob ein Code existiert (bypassed RLS).
  const supabaseAdmin = getAdminClient()

  // Club ID holen
  const { data: club } = await supabaseAdmin.from('clubs').select('id').eq('slug', clubSlug).single()
  if (!club) return { success: false, error: "Club nicht gefunden" }

  // Code suchen
  const { data: credit } = await supabaseAdmin
    .from('credit_codes')
    .select('*')
    .eq('club_id', club.id)
    .eq('code', code.toUpperCase()) // Case insensitive search
    .single()

  if (!credit) {
    return { success: false, error: "Code existiert nicht." }
  }

  // Check 1: Wurde er bereits final als "vollständig eingelöst" markiert?
  if (credit.is_redeemed) {
    return { success: false, error: "Code wurde bereits vollständig eingelöst." }
  }

  // Check 2: Ist das Ablaufdatum überschritten?
  if (credit.expires_at && new Date(credit.expires_at) < new Date()) {
    return { success: false, error: "Code ist abgelaufen." }
  }

  // Check 3: Ist das Nutzungslimit erreicht?
  const limit = credit.usage_limit ?? 1
  const count = credit.usage_count ?? 0

  if (count >= limit) {
    return { success: false, error: "Code-Limit erreicht." }
  }

  return { success: true, amount: credit.amount, codeId: credit.id }
}

// 2. UPDATE: Gutschein erstellen (Admin Logic)
export async function createVoucher(formData: FormData) {
    const supabase = await createClient() // Normaler Client für Auth Check
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return { success: false, error: "Nicht eingeloggt" }

    const clubSlug = formData.get("clubSlug") as string
    const code = formData.get("code") as string
    const amount = parseFloat(formData.get("amount") as string)
    const usageLimit = parseInt(formData.get("usageLimit") as string) || 1
    const expiresAt = formData.get("expiresAt") as string 

    if(!code || !amount) return { success: false, error: "Code und Betrag fehlen." }

    const supabaseAdmin = getAdminClient()

    // 1. Club laden & Berechtigung prüfen (Ist der User der Owner?)
    const { data: club } = await supabaseAdmin
        .from('clubs')
        .select('id, owner_id')
        .eq('slug', clubSlug)
        .single()
    
    if(!club) return { success: false, error: "Club Fehler" }

    const SUPER_ADMIN = process.env.SUPER_ADMIN_EMAIL?.toLowerCase()
    const isSuperAdmin = user.email?.toLowerCase() === SUPER_ADMIN

    if (club.owner_id !== user.id && !isSuperAdmin) {
        return { success: false, error: "Keine Berechtigung" }
    }

    // 2. Code erstellen (Mit Admin Rechten)
    const { error } = await supabaseAdmin.from('credit_codes').insert({
        club_id: club.id,
        code: code.toUpperCase().trim(), // Immer Uppercase speichern
        amount: amount,
        usage_limit: usageLimit,
        usage_count: 0,
        is_redeemed: false,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
        created_for_email: 'Admin Generated'
    })

    if(error) {
        // Unique Constraint Fehler abfangen
        if (error.code === '23505') return { success: false, error: "Code existiert bereits!" }
        return { success: false, error: error.message }
    }

    revalidatePath(`/club/${clubSlug}/admin`)
    return { success: true }
}

// 3. UPDATE: Gutschein löschen (Admin Logic)
export async function deleteVoucher(id: string, clubSlug: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Auth required" }

    const supabaseAdmin = getAdminClient()

    // Berechtigungs-Check
    const { data: club } = await supabaseAdmin.from('clubs').select('id, owner_id').eq('slug', clubSlug).single()
    const SUPER_ADMIN = process.env.SUPER_ADMIN_EMAIL?.toLowerCase()
    
    if (!club || (club.owner_id !== user.id && user.email?.toLowerCase() !== SUPER_ADMIN)) {
        return { success: false, error: "Keine Rechte" }
    }

    await supabaseAdmin.from('credit_codes').delete().eq('id', id)
    
    revalidatePath(`/club/${clubSlug}/admin`)
    return { success: true }
}

// 4. NEU: GUTSCHEINE LADEN (Admin Dashboard List)
// Umgeht RLS, damit der Club-Admin seine Codes sehen kann
export async function getClubVouchers(clubSlug: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const supabaseAdmin = getAdminClient()
    
    // 1. Club ID holen
    const { data: club } = await supabaseAdmin.from('clubs').select('id, owner_id').eq('slug', clubSlug).single()
    
    if(!club) return []
    
    // 2. Security Check: Nur Owner oder Super Admin darf sehen
    const SUPER_ADMIN = process.env.SUPER_ADMIN_EMAIL?.toLowerCase()
    if (club.owner_id !== user.id && user.email?.toLowerCase() !== SUPER_ADMIN) {
        return []
    }

    // 3. Fetch mit Admin Rechten
    const { data } = await supabaseAdmin
        .from('credit_codes')
        .select('*')
        .eq('club_id', club.id)
        .order('created_at', { ascending: false })
    
    return data || []
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

  const supabaseAdmin = getAdminClient()

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

  const supabaseAdmin = getAdminClient()

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

  const supabaseAdmin = getAdminClient()

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

  const supabaseAdmin = getAdminClient()

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

// ==========================================
// --- BOOKING ACTIONS (UPDATE: MULTI-USE VOUCHER) ---
// ==========================================

export async function createBooking(
  courtId: string,
  clubSlug: string,
  date: Date,
  time: string,
  price: number,
  durationMinutes: number,
  paymentMethod: 'paid_cash' | 'paid_stripe' = 'paid_cash',
  creditCode?: string,
  guestName?: string,
  guestEmail?: string
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

  // 3. UPDATE: Gutschein einlösen (Mit Zähler Logik & Admin Client für RLS Bypass)
  if (finalPrice > 0 && creditCode) {
    const check = await validateCreditCode(clubSlug, creditCode)
    if (!check.success) return { success: false, error: check.error }

    const supabaseAdmin = getAdminClient()

    // Aktuellen Stand holen (Via Admin Client)
    const { data: current } = await supabaseAdmin
        .from('credit_codes')
        .select('usage_count, usage_limit')
        .eq('code', creditCode.toUpperCase()) // Uppercase
        .single()
    
    if(current) {
        const newCount = (current.usage_count || 0) + 1
        const limit = current.usage_limit || 1
        // Wenn das Limit erreicht ist, wird der Code "vollständig eingelöst"
        const isFullyRedeemed = newCount >= limit

        await supabaseAdmin.from('credit_codes')
          .update({ 
              usage_count: newCount,
              is_redeemed: isFullyRedeemed
          })
          .eq('code', creditCode.toUpperCase())
    }

    usedCreditAmount = check.amount || 0
    finalPrice = usedCreditAmount 
    finalPaymentStatus = 'paid_stripe'
  }

  // 4. Buchung speichern (Via normalem Client, da wir die User-ID brauchen, falls vorhanden)
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
      guest_name: user ? 'Mitglied' : (guestName || 'Gast'),
      guest_email: user?.email || guestEmail || null,
      user_id: user?.id || null
    })

  if (error) {
    console.error(error)
    return { success: false, error: "Datenbankfehler." }
  }

  // Mail versenden
  try {
    const orderId = "ORD-" + Math.floor(Math.random() * 100000)
    const customerEmail = user?.email || guestEmail || null
    const adminEmail = club.admin_email || SUPER_ADMIN_EMAIL || null
    const guestLabel = user ? "Mitglied" : (guestName || "Gast")

    if (customerEmail) {
      await resend.emails.send({
        from: 'Suedtirol Booking <onboarding@resend.dev>',
        to: [customerEmail],
        subject: `Deine Buchung am ${format(date, 'dd.MM.yyyy')} um ${time}`,
        react: <BookingEmailTemplate
          guestName={guestLabel}
          courtName="Tennisplatz"
          date={format(date, 'dd.MM.yyyy')}
          time={time}
          price={finalPrice}
          orderId={orderId}
        />,
      })
    }

    if (adminEmail && adminEmail !== customerEmail) {
      await resend.emails.send({
        from: 'Suedtirol Booking <onboarding@resend.dev>',
        to: [adminEmail],
        subject: `Neue Buchung: ${format(date, 'dd.MM.yyyy')} um ${time}`,
        react: <BookingEmailTemplate
          guestName={guestLabel}
          courtName="Tennisplatz"
          date={format(date, 'dd.MM.yyyy')}
          time={time}
          price={finalPrice}
          orderId={orderId}
        />,
      })
    }
  } catch (err) {
    console.error("Mail Fehler:", err)
  }

  revalidatePath(`/club/${clubSlug}`)
  return { success: true }
}

// UPDATE: Cancel Booking mit usage_limit: 1 für Refunds
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

  // Wenn bezahlt wurde: Refund Code erstellen
  if (booking.payment_status === 'paid_stripe' && booking.price_paid > 0) {
    const code = `REFUND-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
    const supabaseAdmin = getAdminClient() // Falls Credit Codes Tabelle restricted ist

    await supabaseAdmin.from('credit_codes').insert({
      club_id: clubId,
      code: code,
      amount: booking.price_paid,
      created_for_email: user.email,
      // WICHTIG: Refund Codes sind nur 1x gültig
      usage_limit: 1,
      usage_count: 0,
      is_redeemed: false
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
  creditCode?: string,
  guestName?: string,
  guestEmail?: string
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
    metadata: {
      ...metadata,
      guestName,
      userId: user?.id || null
    },
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/club/${clubSlug}?canceled=true`,
    customer_email: user?.email || guestEmail,
  })

  return { url: session.url }
}

// ==========================================
// --- MATCH RECAPS ---
// ==========================================

export async function getMatchRecapByToken(token: string) {
  const supabaseAdmin = getAdminClient()

  const { data: recap } = await supabaseAdmin
    .from('match_recaps')
    .select('*')
    .eq('token', token)
    .single()

  if (!recap) return null

  const { data: booking } = await supabaseAdmin
    .from('bookings')
    .select('id, start_time, end_time, court_id, club_id')
    .eq('id', recap.booking_id)
    .single()

  if (!booking) return null

  const { data: club } = await supabaseAdmin
    .from('clubs')
    .select('id, name, slug, logo_url, primary_color')
    .eq('id', booking.club_id)
    .single()

  let playerProfile = null
  if (recap.player_user_id) {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', recap.player_user_id)
      .single()
    playerProfile = profile || null
  }

  const { data: memberRows } = await supabaseAdmin
    .from('club_members')
    .select('user_id, profiles:user_id(first_name, last_name)')
    .eq('club_id', booking.club_id)

  const members = (memberRows || []).map((row: any) => ({
    id: row.user_id,
    name: `${row.profiles?.first_name || ""} ${row.profiles?.last_name || ""}`.trim(),
  })).filter((m) => m.name.length > 0)

  return { recap, booking, club, playerProfile, members }
}

export async function submitMatchRecap(token: string, payload: {
  playerName: string
  opponentName: string
  resultText: string
  opponentUserId?: string | null
}) {
  const supabaseAdmin = getAdminClient()

  const { data: recap } = await supabaseAdmin
    .from('match_recaps')
    .select('*')
    .eq('token', token)
    .single()

  if (!recap) return { success: false, error: "Ungültiger Link." }

  const { error } = await supabaseAdmin
    .from('match_recaps')
    .update({
      guest_name: payload.playerName,
      opponent_name: payload.opponentName,
      opponent_user_id: payload.opponentUserId || null,
      result_text: payload.resultText,
      completed_at: new Date().toISOString()
    })
    .eq('id', recap.id)

  if (error) return { success: false, error: error.message }

  if (recap.player_user_id) {
    await supabaseAdmin
      .from('match_results')
      .insert({
        club_id: recap.club_id,
        booking_id: recap.booking_id,
        player_user_id: recap.player_user_id,
        opponent_user_id: payload.opponentUserId || null,
        player_name: payload.playerName,
        opponent_name: payload.opponentName,
        result_text: payload.resultText
      })
  }

  return { success: true }
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

  const supabaseAdmin = getAdminClient()

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

  const supabaseAdmin = getAdminClient()

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

  const supabaseAdmin = getAdminClient()

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

// ==========================================
// --- CLUB PAGE CMS CONTENT ---
// ==========================================

export async function getClubContent(clubSlug: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const supabaseAdmin = getAdminClient()

    const { data: club } = await supabaseAdmin
        .from('clubs')
        .select('id, owner_id')
        .eq('slug', clubSlug)
        .single()

    if (!club) return null

    const SUPER_ADMIN = process.env.SUPER_ADMIN_EMAIL?.toLowerCase()
    if (club.owner_id !== user.id && user.email?.toLowerCase() !== SUPER_ADMIN) {
        return null
    }

    const { data } = await supabaseAdmin
        .from('club_content')
        .select('content')
        .eq('club_id', club.id)
        .single()

    return data?.content || null
}

export async function updateClubContent(clubSlug: string, content: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Nicht eingeloggt" }

    const supabaseAdmin = getAdminClient()

    const { data: club } = await supabaseAdmin
        .from('clubs')
        .select('id, owner_id')
        .eq('slug', clubSlug)
        .single()

    if (!club) return { success: false, error: "Club Fehler" }

    const SUPER_ADMIN = process.env.SUPER_ADMIN_EMAIL?.toLowerCase()
    if (club.owner_id !== user.id && user.email?.toLowerCase() !== SUPER_ADMIN) {
        return { success: false, error: "Keine Berechtigung" }
    }

    const { error } = await supabaseAdmin
        .from('club_content')
        .upsert({
            club_id: club.id,
            content: content,
            updated_at: new Date().toISOString()
        }, { onConflict: 'club_id' })

    if (error) return { success: false, error: error.message }

    revalidatePath(`/club/${clubSlug}`)
    revalidatePath(`/club/${clubSlug}/impressum`)
    revalidatePath(`/club/${clubSlug}/admin`)
    return { success: true }
}

// --- NEU: MITGLIED EINLADEN (Admin) ---
export async function inviteMember(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: "Nicht eingeloggt" }

  const clubSlug = formData.get("clubSlug") as string
  const email = formData.get("email") as string
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string

  // E-Mail Format Check
  if (!email || !email.includes('@')) return { success: false, error: "Ungültige E-Mail" }

  const supabaseAdmin = getAdminClient()

  // 1. Club & Rechte Check
  const { data: club } = await supabaseAdmin.from('clubs').select('id, owner_id, name').eq('slug', clubSlug).single()
  const SUPER_ADMIN = process.env.SUPER_ADMIN_EMAIL?.toLowerCase()

  if (!club || (club.owner_id !== user.id && user.email?.toLowerCase() !== SUPER_ADMIN)) {
    return { success: false, error: "Keine Berechtigung" }
  }

  // 2. User Check / Create
  let targetUserId = null
  let isNewUser = false
  let tempPassword = ""

  // Wir suchen, ob der User global in Supabase schon existiert
  const { data: listUsers } = await supabaseAdmin.auth.admin.listUsers()
  // Einfacher Check (in Produktion besser: getUserByEmail, aber listUsers ist hier ok für kleine Mengen)
  const existingUser = listUsers.users.find(u => u.email?.toLowerCase() === email.toLowerCase())

  if (existingUser) {
    targetUserId = existingUser.id
  } else {
    // User existiert nicht -> Erstellen
    isNewUser = true
    tempPassword = Math.random().toString(36).slice(-8) + "Aa1!"

    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        name: `${firstName} ${lastName}`,
        full_name: `${firstName} ${lastName}`,
        must_change_password: true
      }
    })

    if (createError) return { success: false, error: "Fehler beim User-Erstellen: " + createError.message }
    if (!newUser.user) return { success: false, error: "User konnte nicht erstellt werden." }

    targetUserId = newUser.user.id

    // Profil anlegen
    await supabaseAdmin.from('profiles').upsert({
      id: targetUserId,
      first_name: firstName,
      last_name: lastName,
      updated_at: new Date().toISOString()
    })
  }

  // 3. Member Status setzen (Active)
  const validUntil = new Date()
  validUntil.setFullYear(validUntil.getFullYear() + 1) // Standard: 1 Jahr gültig

  const { error: memberError } = await supabaseAdmin.from('club_members').upsert({
    club_id: club.id,
    user_id: targetUserId,
    status: 'active',
    valid_until: validUntil.toISOString(),
    internal_notes: 'Vom Admin eingeladen am ' + new Date().toLocaleDateString()
  }, { onConflict: 'club_id, user_id' })

  if (memberError) return { success: false, error: "Datenbank Fehler: " + memberError.message }

  // 4. E-Mail senden
  try {
    if (isNewUser) {
      await resend.emails.send({
        from: 'Suedtirol Booking <onboarding@resend.dev>',
        to: [email],
        subject: `Willkommen im ${club.name}!`,
        react: <WelcomeMemberEmailTemplate
          clubName={club.name}
          email={email}
          password={tempPassword}
          loginUrl={`${process.env.NEXT_PUBLIC_BASE_URL}/login`}
        />
      })
    } else {
      // Existierender User: Info Mail
      await resend.emails.send({
        from: 'Suedtirol Booking <onboarding@resend.dev>',
        to: [email],
        subject: `Du wurdest zu ${club.name} hinzugefügt`,
        html: `
          <div style="font-family: sans-serif; color: #333;">
            <h1>Hallo ${firstName}!</h1>
            <p>Du wurdest vom Administrator zum Verein <strong>${club.name}</strong> hinzugefügt.</p>
            <p>Da du bereits einen Account bei uns hast, kannst du dich einfach einloggen und sofort Plätze buchen.</p>
            <br/>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/club/${clubSlug}" style="background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Zum Verein</a>
          </div>
        `
      })
    }
  } catch (err) {
    console.error("Mail Error", err)
    // Wir returnen trotzdem success, da der DB Eintrag geklappt hat
  }

  revalidatePath(`/club/${clubSlug}/admin/members`)
  return { success: true }
}

// --- NEU: CSV EXPORT ---
export async function exportBookingsCsv(clubSlug: string, year: number, month: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Admin Check (Owner oder Super Admin)
  const supabaseAdmin = getAdminClient() // Wir nutzen den Admin Client für vollen Zugriff
  const { data: club } = await supabaseAdmin.from('clubs').select('id, owner_id').eq('slug', clubSlug).single()
  const SUPER_ADMIN = process.env.SUPER_ADMIN_EMAIL?.toLowerCase()

  if (!club || (club.owner_id !== user?.id && user?.email?.toLowerCase() !== SUPER_ADMIN)) {
    return { success: false, error: "Keine Berechtigung" }
  }

  // 2. Zeitraum berechnen (Monat)
  const startDate = new Date(year, month - 1, 1) // Monat ist 0-basiert in JS, aber 1-basiert im UI
  const endDate = new Date(year, month, 0, 23, 59, 59) // Letzter Tag des Monats

  // 3. Daten holen
  const { data: bookings } = await supabaseAdmin
    .from('bookings')
    .select(`
            start_time,
            end_time,
            payment_status,
            price_paid,
            guest_name,
            status,
            courts (name)
        `)
    .eq('club_id', club.id)
    .gte('start_time', startDate.toISOString())
    .lte('start_time', endDate.toISOString())
    .order('start_time', { ascending: true })

  if (!bookings || bookings.length === 0) {
    return { success: false, error: "Keine Buchungen in diesem Zeitraum." }
  }

  // 4. CSV generieren
  // Header
  const header = ["Datum", "Uhrzeit", "Platz", "Spieler", "Zahlart", "Betrag", "Status"]
  const rows = bookings.map((b: any) => {
    const date = new Date(b.start_time)
    const dateStr = date.toLocaleDateString('de-DE')
    const timeStr = date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })

    // Payment Status übersetzen
    let payStatus = "Unbekannt"
    if (b.payment_status === 'paid_stripe') payStatus = "Online (Stripe)"
    if (b.payment_status === 'paid_cash') payStatus = "Bar / Vor Ort"
    if (b.payment_status === 'paid_member') payStatus = "Mitglied (Kostenlos)"

    return [
      dateStr,
      timeStr,
      b.courts?.name || "Gelöschter Platz",
      `"${b.guest_name || '-'}"`, // Anführungszeichen für Namen mit Kommas
      payStatus,
      (b.price_paid || 0).toString().replace('.', ','), // Deutsches Format für Excel
      b.status
    ].join(";") // Semikolon ist besser für Excel in DE
  })

  const csvContent = [header.join(";"), ...rows].join("\n")

  return { success: true, csv: csvContent, filename: `buchungen_${year}_${month}.csv` }
}
