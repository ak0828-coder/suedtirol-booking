"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Loader2 } from "lucide-react"
import { createMembershipCheckout } from "@/app/actions"
import { useEffect, useState } from "react"
import { useI18n } from "@/components/i18n/locale-provider"
import { createClient } from "@/lib/supabase/client"

export function MembershipPlans({
  plans,
  clubSlug,
  title,
  subtitle,
  ctaLabel,
}: {
  plans: any[]
  clubSlug: string
  title?: string
  subtitle?: string
  ctaLabel?: string
}) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [guestEmail, setGuestEmail] = useState("")
  const [hasSession, setHasSession] = useState<boolean | null>(null)
  const { t } = useI18n()
  const defaultTitle = t("membership.title", "Werde Mitglied")
  const defaultCta = t("membership.cta", "Jetzt wählen")
  const defaultFeatures = [
    t("membership.feature.free_play", "Kostenlos spielen"),
    t("membership.feature.priority", "Bevorzugte Buchung"),
  ]

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setHasSession(!!data?.user)
    })
  }, [])

  const handleSubscribe = async (planId: string, priceId: string) => {
    setLoadingId(planId)
    const res = await createMembershipCheckout(
      clubSlug,
      planId,
      priceId,
      hasSession ? undefined : guestEmail.trim()
    )

    if (res?.url) {
      window.location.href = res.url
    } else {
      setLoadingId(null)
      alert(res?.error || t("membership.error", "Fehler beim Checkout"))
    }
  }

  if (plans.length === 0) return null

  return (
    <div className="mt-12 max-w-4xl mx-auto px-4">
      <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white">
        {title || defaultTitle}
      </h2>
      {subtitle && (
        <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
      )}
      {hasSession === false && (
        <div className="mt-4 max-w-md mx-auto">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("membership.email_label", "E-Mail für die Mitgliedschaft")}
          </label>
          <input
            type="email"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            placeholder={t("membership.email_placeholder", "deine@email.com")}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"
            required
          />
        </div>
      )}

      <div className="mt-8 grid md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const featuresRaw =
            typeof plan.features === "string"
              ? plan.features.split(/\r?\n/).map((f: string) => f.trim()).filter(Boolean)
              : []
          const features = featuresRaw.length > 0 ? featuresRaw : defaultFeatures
          const ctaText = plan.cta_label || ctaLabel || defaultCta
          return (
            <Card
              key={plan.id}
              className="border-2 transition-colors relative flex flex-col hover:shadow-md"
              style={{ borderColor: "color-mix(in srgb, var(--club-primary, #0f172a) 20%, transparent)" }}
            >
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description || t("membership.plan_fallback", "Jahresbeitrag")}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="text-3xl font-bold mb-4">
                  {plan.price}€ <span className="text-sm font-normal text-slate-500">/ {t("membership.year", "Jahr")}</span>
                </div>

                {features.length > 0 && (
                  <ul className="space-y-2 mb-6 flex-1 text-sm text-slate-600 dark:text-slate-400">
                    {features.map((item: string, idx: number) => (
                      <li key={`${plan.id}-feature-${idx}`} className="flex items-center gap-2">
                        <Check className="w-4 h-4 club-primary-text" /> {item}
                      </li>
                    ))}
                  </ul>
                )}

                <Button
                  className="w-full club-primary-bg btn-press touch-44"
                  onClick={() => handleSubscribe(plan.id, plan.stripe_price_id)}
                  disabled={!!loadingId || (hasSession === false && !guestEmail.trim())}
                >
                  {loadingId === plan.id ? <Loader2 className="animate-spin" /> : ctaText}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
