import { stripe } from "@/lib/stripe"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getDictionary } from "@/lib/dictionaries"
import { createTranslator } from "@/lib/translator"
import type { Locale } from "@/lib/i18n"

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
            <p><strong>{t("checkout.success.amount", "Summe")}:</strong> {(session.amount_total || 0) / 100}â‚¬</p>
            <p><strong>{t("checkout.success.status_label", "Status")}:</strong> {t("checkout.success.status", "Bezahlt via Stripe")}</p>
          </div>

          <Link href={`/${lang}/club/${meta.clubSlug}`}>
            <Button className="w-full">{t("checkout.success.back", "ZurÃ¼ck zum Club")}</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

