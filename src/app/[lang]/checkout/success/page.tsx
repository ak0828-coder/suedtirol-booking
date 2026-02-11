import { stripe } from "@/lib/stripe"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getDictionary } from "@/lib/dictionaries"
import { createTranslator } from "@/lib/translator"
import type { Locale } from "@/lib/i18n"
import { ensureMembershipFromCheckoutSession } from "@/app/actions"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function SuccessPage({
  searchParams,
  params,
}: {
  searchParams: Promise<{ session_id: string }>
  params: Promise<{ lang: Locale }>
}) {
  const { session_id } = await searchParams
  const { lang } = await params
  const dict = await getDictionary(lang)
  const t = createTranslator(dict)

  if (!session_id) {
    return <div>{t("checkout.success.missing", "Fehler: Keine Session ID")}</div>
  }

  const session = await stripe.checkout.sessions.retrieve(session_id)

  if (session.payment_status !== "paid") {
    return <div>{t("checkout.success.pending", "Zahlung noch nicht bestÃ¤tigt.")}</div>
  }

  const meta = session.metadata as any
  let showLogin = false
  if (meta?.type === "membership_subscription") {
    const ensured = await ensureMembershipFromCheckoutSession(session_id)
    if (!ensured?.success) {
      return (
        <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center rounded-3xl border border-slate-200/60 bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">{t("checkout.success.title", "Zahlung erfolgreich!")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600">
                {t("checkout.success.body", "Danke! Deine Zahlung ist eingegangen.")}
              </p>
              <p className="text-sm text-red-600">
                {t("checkout.success.member_error", "Die Mitgliedschaft wird gerade finalisiert. Bitte kurz warten oder erneut laden.")}
              </p>
              <Button className="w-full" onClick={() => location.reload()}>
                {t("checkout.success.retry", "Erneut versuchen")}
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      showLogin = true
    }

    if (user && meta?.clubId && meta?.clubSlug) {
      const { data: member } = await supabase
        .from("club_members")
        .select("contract_signed_at")
        .eq("club_id", meta.clubId)
        .eq("user_id", user.id)
        .single()

      const { data: docs } = await supabase
        .from("member_documents")
        .select("id")
        .eq("club_id", meta.clubId)
        .eq("user_id", user.id)
        .eq("doc_type", "medical_certificate")
        .limit(1)

      const hasContract = !!member?.contract_signed_at
      const hasMedical = (docs?.length || 0) > 0

      if (!hasContract || !hasMedical) {
        redirect(`/${lang}/club/${meta.clubSlug}/onboarding?post_payment=1`)
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center rounded-3xl border border-slate-200/60 bg-white shadow-lg">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">{t("checkout.success.title", "Zahlung erfolgreich!")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-600">
            {t(
              "checkout.success.body",
              "Danke! Deine Zahlung ist eingegangen. Deine Buchung wird gerade finalisiert und ist gleich im System sichtbar."
            )}
          </p>

          <div className="bg-slate-100 p-4 rounded-lg text-sm text-left">
            <p><strong>{t("checkout.success.amount", "Summe")}:</strong> {(session.amount_total || 0) / 100}€</p>
            <p><strong>{t("checkout.success.status_label", "Status")}:</strong> {t("checkout.success.status", "Bezahlt via Stripe")}</p>
          </div>

          {showLogin && meta?.clubSlug && (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                {t("checkout.success.login_needed", "Bitte einloggen, um den Mitgliedsvertrag zu unterschreiben und Dokumente hochzuladen.")}
              </p>
              <Link href={`/${lang}/login`}>
                <Button className="w-full">{t("checkout.success.login", "Jetzt einloggen")}</Button>
              </Link>
            </div>
          )}

          <Link href={`/${lang}/club/${meta.clubSlug}`}>
            <Button className="w-full">{t("checkout.success.back", "ZurÃ¼ck zum Club")}</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

