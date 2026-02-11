"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { useEffect, useState } from "react"
import { useI18n } from "@/components/i18n/locale-provider"
import { createClient } from "@/lib/supabase/client"
import { useParams, useRouter } from "next/navigation"

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
  const [hasSession, setHasSession] = useState<boolean | null>(null)
  const { t } = useI18n()
  const params = useParams()
  const router = useRouter()
  const lang = typeof params?.lang === "string" ? params.lang : "de"
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

  const handleSubscribe = (planId: string) => {
    const next = `/${lang}/club/${clubSlug}/onboarding?plan=${encodeURIComponent(planId)}`
    router.push(next)
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
                  onClick={() => handleSubscribe(plan.id)}
                >
                  {ctaText}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
