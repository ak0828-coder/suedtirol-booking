import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale, locales } from "@/lib/i18n";

const PUBLIC_FILE = /\.(.*)$/;

function detectLocale(request: NextRequest) {
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookieLocale && locales.includes(cookieLocale as any)) {
    return cookieLocale;
  }

  const header = request.headers.get("accept-language");
  if (!header) return defaultLocale;

  const languages = header
    .split(",")
    .map((part) => part.split(";")[0]?.trim())
    .filter(Boolean)
    .map((tag) => tag!.toLowerCase().split("-")[0]);

  for (const lang of languages) {
    if (locales.includes(lang as any)) return lang;
  }

  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const canonicalHost = process.env.NEXT_PUBLIC_CANONICAL_HOST || "www.avaimo.com";
  const currentHost = request.nextUrl.host;

  if (
    currentHost &&
    canonicalHost &&
    currentHost !== canonicalHost &&
    !currentHost.includes("localhost")
  ) {
    const url = request.nextUrl.clone();
    url.host = canonicalHost;
    url.protocol = "https:";
    return NextResponse.redirect(url, 308);
  }

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const firstSegment = pathname.split("/")[1];
  if (locales.includes(firstSegment as any)) {
    return NextResponse.next();
  }

  const locale = detectLocale(request) || defaultLocale;
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};
