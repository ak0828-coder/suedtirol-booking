import { ThemeProvider } from "@/components/theme-provider";
import { TourShell } from "@/components/tours/tour-shell";
import { defaultLocale, isLocale, locales } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { LocaleProvider } from "@/components/i18n/locale-provider";
import { Toaster } from "sonner";
import { CookieBanner } from "@/components/cookie-banner";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang: requestedLang } = await params;
  const lang = isLocale(requestedLang) ? requestedLang : defaultLocale;
  const dictionary = await getDictionary(lang);
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <LocaleProvider dictionary={dictionary}>
        <TourShell>{children}</TourShell>
      </LocaleProvider>
      <Toaster richColors position="top-right" />
      <CookieBanner />
    </ThemeProvider>
  );
}
