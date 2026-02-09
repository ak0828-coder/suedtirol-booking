"use client"

import { StripeConnectButton } from "@/components/admin/stripe-connect-button"

export function StripeConnectSection({
  clubSlug,
  initialConnected,
}: {
  clubSlug: string
  initialConnected: boolean
}) {
  return (
    <section className="space-y-4">
      <h3 className="text-xl font-semibold text-slate-900">Stripe Connect</h3>
      <StripeConnectButton clubSlug={clubSlug} initialConnected={initialConnected} />
    </section>
  )
}
