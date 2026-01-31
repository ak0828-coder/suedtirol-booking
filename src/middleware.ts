import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 1. User holen
  const { data: { user } } = await supabase.auth.getUser()

  // 2. Prüfen: Muss Passwort geändert werden?
  // Wir lesen das aus den "user_metadata"
  if (user && user.user_metadata?.must_change_password === true) {
    // Wenn er nicht schon auf der Change-Password Seite ist -> Umleiten
    if (!request.nextUrl.pathname.startsWith('/change-password')) {
      return NextResponse.redirect(new URL('/change-password', request.url))
    }
  }

  // 3. Admin Guard Logik
  // Wenn User auf /club/.../admin will, muss er eingeloggt sein
  // (Ausnahme: Login Seite selbst)
  if (request.nextUrl.pathname.includes('/admin') && !request.nextUrl.pathname.includes('/login') && !user) {
     return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/ (API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
}