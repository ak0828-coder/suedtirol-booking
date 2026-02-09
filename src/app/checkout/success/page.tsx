import { stripe } from "@/lib/stripe"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id: string }>
}) {
  const { session_id } = await searchParams

  if (!session_id) {
    return <div>Fehler: Keine Session ID</div>
  }

  const session = await stripe.checkout.sessions.retrieve(session_id)

  if (session.payment_status !== 'paid') {
    return <div>Zahlung noch nicht bestätigt.</div>
  }

  const meta = session.metadata as any

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center rounded-3xl border border-slate-200/60 bg-white shadow-lg">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Zahlung erfolgreich!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-600">
            Danke! Deine Zahlung ist eingegangen.
            Deine Buchung wird gerade finalisiert und ist gleich im System sichtbar.
          </p>
          
          <div className="bg-slate-100 p-4 rounded-lg text-sm text-left">
             <p><strong>Summe:</strong> {(session.amount_total || 0) / 100}€</p>
             <p><strong>Status:</strong> Bezahlt via Stripe</p>
          </div>

          <Link href={`/club/${meta.clubSlug}`}>
            <Button className="w-full">Zurück zum Club</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

