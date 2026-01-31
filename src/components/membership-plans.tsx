"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Loader2 } from "lucide-react"
import { createMembershipCheckout } from "@/app/actions"
import { useState } from "react"

export function MembershipPlans({ plans, clubSlug }: { plans: any[], clubSlug: string }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleSubscribe = async (planId: string, priceId: string) => {
    setLoadingId(planId)
    const res = await createMembershipCheckout(clubSlug, planId, priceId)
    
    if (res?.url) {
        // Wenn Login nötig ist, leitet die Action zur Login-Page. 
        // Stripe Checkout URL kommt zurück.
        window.location.href = res.url
    } else {
        setLoadingId(null)
        alert("Fehler beim Checkout")
    }
  }

  if (plans.length === 0) return null

  return (
    <div className="mt-12 max-w-4xl mx-auto px-4">
      <h2 className="text-2xl font-bold text-center mb-8 text-slate-900 dark:text-white">Werde Mitglied</h2>
      
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className="border-2 hover:border-slate-900 transition-colors relative flex flex-col">
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>Jahresbeitrag</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="text-3xl font-bold mb-4">{plan.price}€ <span className="text-sm font-normal text-slate-500">/ Jahr</span></div>
              
              <ul className="space-y-2 mb-6 flex-1 text-sm text-slate-600 dark:text-slate-400">
                 <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500"/> Kostenlos spielen</li>
                 <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500"/> Bevorzugte Buchung</li>
              </ul>

              <Button 
                className="w-full" 
                onClick={() => handleSubscribe(plan.id, plan.stripe_price_id)}
                disabled={!!loadingId}
              >
                {loadingId === plan.id ? <Loader2 className="animate-spin" /> : "Jetzt wählen"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}