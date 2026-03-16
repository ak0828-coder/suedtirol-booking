"use server"

import { getAdminClient } from "@/lib/supabase/admin"

// Base offset for social proof (added to real DB count)
const BASE_OFFSET = 24

export async function submitWaitlistEmail(email: string): Promise<{ ok: boolean; error?: string }> {
  const normalized = email.trim().toLowerCase()
  if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return { ok: false, error: "Ungültige E-Mail-Adresse." }
  }

  const supabase = getAdminClient()
  const { error } = await supabase
    .from("waitlist_entries")
    .insert({ email: normalized, location: "bozen" })

  if (error) {
    if (error.code === "23505") {
      // unique violation — already registered
      return { ok: false, error: "Diese E-Mail ist bereits eingetragen." }
    }
    return { ok: false, error: "Fehler beim Eintragen. Bitte erneut versuchen." }
  }

  return { ok: true }
}

export async function getWaitlistCount(): Promise<number> {
  const supabase = getAdminClient()
  const { count } = await supabase
    .from("waitlist_entries")
    .select("id", { count: "exact", head: true })
    .eq("location", "bozen")

  return BASE_OFFSET + (count ?? 0)
}
