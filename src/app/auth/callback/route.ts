import { createClient } from "@/lib/supabase/server"
import { defaultLocale } from "@/lib/i18n"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? ""
  const lang = defaultLocale
  const fallback = `/${lang}`
  const safeNext = next.startsWith("/") ? next : fallback

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext}`)
    }
  }

  return NextResponse.redirect(`${origin}/${lang}/login?error=auth-code-error`)
}
