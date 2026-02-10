import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin, pathname } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? ""
  const segments = pathname.split("/").filter(Boolean)
  const lang = segments[0] || "de"
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
