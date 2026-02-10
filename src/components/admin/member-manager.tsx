"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"
import { useI18n } from "@/components/i18n/locale-provider"
import { useParams } from "next/navigation"

export function MemberManager({ members }: { members: any[] }) {
  const { t } = useI18n()
  const params = useParams()
  const langRaw = params?.lang
  const lang = typeof langRaw === "string" ? langRaw : Array.isArray(langRaw) ? langRaw[0] : "de"
  const locale = lang === "it" ? "it-IT" : lang === "en" ? "en-US" : "de-DE"

  return (
    <Card className="rounded-2xl border border-slate-200/60 bg-white/80 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" /> {t("admin_members.title", "Mitgliederliste")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {members.map(m => (
            <div key={m.id} className="flex justify-between items-center p-3 border border-slate-200/60 rounded-xl bg-white hover:shadow-sm transition-shadow">
              <div>
                <div className="font-semibold">{m.user?.email || t("admin_members.unknown", "Unbekannt")}</div>
                <div className="text-xs text-slate-500">
                  {t("admin_members.valid_until", "Gültig bis")}: {m.valid_until ? new Date(m.valid_until).toLocaleDateString(locale) : "-"}
                </div>
              </div>
              <div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                  m.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                }`}>
                  {m.status === 'active' ? t("admin_members.active", "AKTIV") : t("admin_members.inactive", "INAKTIV")}
                </span>
              </div>
            </div>
          ))}
          {members.length === 0 && <p className="text-slate-500 text-sm">{t("admin_members.empty", "Noch keine Mitglieder.")}</p>}
        </div>
      </CardContent>
    </Card>
  )
}
