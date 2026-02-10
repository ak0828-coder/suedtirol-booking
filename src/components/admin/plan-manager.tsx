"use client"

import { useState } from "react"
import { createMembershipPlan, deleteMembershipPlan, updateMembershipPlanText } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Euro, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useI18n } from "@/components/i18n/locale-provider"

export function PlanManager({ clubSlug, plans }: { clubSlug: string, plans: any[] }) {
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  const [ctaLabel, setCtaLabel] = useState("")
  const [features, setFeatures] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState({
    name: "",
    description: "",
    ctaLabel: "",
    features: "",
  })
  const router = useRouter()
  const { t } = useI18n()

  const handleAdd = async () => {
    setIsLoading(true)
    await createMembershipPlan(clubSlug, name, parseFloat(price), description, ctaLabel, features)
    setIsLoading(false)
    setName(""); setPrice(""); setDescription(""); setCtaLabel(""); setFeatures("")
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if(!confirm(t("admin_plans.confirm_delete", "Plan löschen?"))) return
    await deleteMembershipPlan(id)
    router.refresh()
  }

  const startEdit = (plan: any) => {
    setEditingId(plan.id)
    setEditValues({
      name: plan.name || "",
      description: plan.description || "",
      ctaLabel: plan.cta_label || "",
      features: plan.features || "",
    })
  }

  const saveEdit = async (planId: string) => {
    setIsLoading(true)
    await updateMembershipPlanText(planId, {
      name: editValues.name,
      description: editValues.description,
      ctaLabel: editValues.ctaLabel,
      features: editValues.features,
    })
    setIsLoading(false)
    setEditingId(null)
    router.refresh()
  }

  return (
    <Card className="h-full rounded-2xl border border-slate-200/60 bg-white/80 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Euro className="w-5 h-5" /> {t("admin_plans.title", "Abo-Preise")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          {plans.map(p => (
            <div key={p.id} className="p-4 border border-slate-200/60 rounded-xl bg-white hover:shadow-sm transition-shadow space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-sm text-slate-500">{p.price}€ / {t("admin_plans.year", "Jahr")}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="rounded-full" onClick={() => startEdit(p)}>
                    {t("admin_plans.edit", "Bearbeiten")}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)} className="rounded-full">
                    <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500"/>
                  </Button>
                </div>
              </div>
              {editingId === p.id && (
                <div className="grid gap-3">
                  <Input
                    placeholder={t("admin_plans.name", "Name")}
                    value={editValues.name}
                    onChange={(e) => setEditValues((prev) => ({ ...prev, name: e.target.value }))}
                  />
                  <Input
                    placeholder={t("admin_plans.cta", "Button-Text (z.B. Jetzt Mitglied werden)")}
                    value={editValues.ctaLabel}
                    onChange={(e) => setEditValues((prev) => ({ ...prev, ctaLabel: e.target.value }))}
                  />
                  <Textarea
                    placeholder={t("admin_plans.description", "Kurzbeschreibung")}
                    value={editValues.description}
                    onChange={(e) => setEditValues((prev) => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                  <Textarea
                    placeholder={t("admin_plans.features", "Features (eine pro Zeile)")}
                    value={editValues.features}
                    onChange={(e) => setEditValues((prev) => ({ ...prev, features: e.target.value }))}
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button onClick={() => saveEdit(p.id)} disabled={isLoading} className="rounded-full">
                      {t("admin_plans.save", "Speichern")}
                    </Button>
                    <Button variant="outline" onClick={() => setEditingId(null)} className="rounded-full">
                      {t("admin_plans.cancel", "Abbrechen")}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {plans.length === 0 && <p className="text-slate-500 text-sm">{t("admin_plans.empty", "Keine Mitgliedschaften definiert.")}</p>}
        </div>

        <div className="grid gap-3">
          <Input placeholder={t("admin_plans.new_name", "Name (z.B. Erwachsene)")} value={name} onChange={e => setName(e.target.value)} />
          <Input type="number" placeholder={t("admin_plans.new_price", "Preis in €")} value={price} onChange={e => setPrice(e.target.value)} />
          <Textarea placeholder={t("admin_plans.description", "Kurzbeschreibung")} value={description} onChange={e => setDescription(e.target.value)} rows={3} />
          <Input placeholder={t("admin_plans.cta2", "Button-Text (z.B. Jetzt beitreten)")} value={ctaLabel} onChange={e => setCtaLabel(e.target.value)} />
          <Textarea placeholder={t("admin_plans.features", "Features (eine pro Zeile)")} value={features} onChange={e => setFeatures(e.target.value)} rows={3} />
          <Button onClick={handleAdd} disabled={isLoading} className="bg-slate-900 text-white rounded-full">
            {isLoading ? <Loader2 className="animate-spin" /> : t("admin_plans.add", "Plan hinzufügen")}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
