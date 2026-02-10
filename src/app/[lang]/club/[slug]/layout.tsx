import { createClient } from "@/lib/supabase/server";
import { defaultLocale, isLocale } from "@/lib/i18n";
import { notFound, redirect } from "next/navigation";

export default async function ClubLocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const supabase = await createClient();
  const { data: club } = await supabase
    .from("clubs")
    .select("supported_languages, default_language")
    .eq("slug", slug)
    .single();

  if (!club) {
    notFound();
  }

  const supported = Array.isArray(club.supported_languages) && club.supported_languages.length > 0
    ? club.supported_languages
    : [club.default_language || defaultLocale];

  const requested = isLocale(lang) ? lang : defaultLocale;
  if (!supported.includes(requested)) {
    const fallback = isLocale(club.default_language || "") ? club.default_language : defaultLocale;
    redirect(`/${fallback}/club/${slug}`);
  }

  return <>{children}</>;
}
