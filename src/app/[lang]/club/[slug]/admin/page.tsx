import Link from "next/link"
import { format } from "date-fns"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardStats } from "@/components/admin/dashboard-stats"
import { DeleteBookingButton } from "@/components/admin/delete-button"
import { getAdminContext } from "./_lib/get-admin-context"
import { notFound } from "next/navigation"
import { FeatureLockWrapper } from "@/components/admin/feature-lock-wrapper"
import { CheckCircle2, Circle } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AdminPage({
  params,
}: {
  params: Promise<{ slug: string; lang: string }>
}) {
  const { slug, lang } = await params
  const { club, features, locks } = await getAdminContext(slug)
  if (!features.admin.overview && !locks.admin.overview) return notFound()
  const locked = !features.admin.overview && locks.admin.overview
  const supabase = await createClient()

  const { data: courts } = await supabase
    .from("courts")
    .select("*")
    .eq("club_id", club.id)
    .order("name")

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, courts (name)")
    .eq("club_id", club.id)
    .order("start_time", { ascending: false })

  const { count: memberCount } = await supabase
    .from("club_members")
    .select("id", { count: "exact", head: true })
    .eq("club_id", club.id)

  const { count: planCount } = await supabase
    .from("membership_plans")
    .select("id", { count: "exact", head: true })
    .eq("club_id", club.id)

  const isNewClub = !bookings?.length && !courts?.length && !memberCount

  const adminPageCopy = {
    de: {
      welcome_title: "Willkommen bei Avaimo!",
      welcome_desc: "Dein Club ist eingerichtet. Folge diesen Schritten, um loszulegen:",
      steps: ["Platz/Court anlegen", "Abo-Modell anlegen", "Mitglieder einladen", "Einstellungen prüfen"],
      activity_title: "Letzte Aktivitäten",
      entries: "Einträge",
      unknown_court: "Unbekannter Platz",
      no_bookings: "Noch keine Buchungen vorhanden.",
      quick_title: "Schnellzugriff",
      pay_pending: "Ausstehend", pay_cash: "Vor Ort", pay_member: "Abo", pay_online: "Online",
      links: ["Einstellungen", "Gutscheine", "Plätze", "Sperrzeiten", "Abos", "Mitglieder", "Trainer", "Kurse", "Finanzen", "CSV Export"],
    },
    en: {
      welcome_title: "Welcome to Avaimo!",
      welcome_desc: "Your club is set up. Follow these steps to get started:",
      steps: ["Create court", "Create membership plan", "Invite members", "Check settings"],
      activity_title: "Recent activity",
      entries: "entries",
      unknown_court: "Unknown court",
      no_bookings: "No bookings yet.",
      quick_title: "Quick access",
      pay_pending: "Pending", pay_cash: "On-site", pay_member: "Membership", pay_online: "Online",
      links: ["Settings", "Vouchers", "Courts", "Blocked times", "Plans", "Members", "Trainers", "Courses", "Finance", "CSV Export"],
    },
    it: {
      welcome_title: "Benvenuto in Avaimo!",
      welcome_desc: "Il tuo club è pronto. Segui questi passaggi per iniziare:",
      steps: ["Crea campo/court", "Crea piano abbonamento", "Invita soci", "Controlla impostazioni"],
      activity_title: "Attività recenti",
      entries: "voci",
      unknown_court: "Campo sconosciuto",
      no_bookings: "Nessuna prenotazione ancora.",
      quick_title: "Accesso rapido",
      pay_pending: "In sospeso", pay_cash: "In sede", pay_member: "Abbonamento", pay_online: "Online",
      links: ["Impostazioni", "Voucher", "Campi", "Blocchi orari", "Piani", "Soci", "Trainer", "Corsi", "Finanze", "CSV Export"],
    },
  }
  const apc = adminPageCopy[lang as keyof typeof adminPageCopy] || adminPageCopy.de

  const onboardingSteps = [
    { label: apc.steps[0], href: `/${lang}/club/${slug}/admin/courts`, done: (courts?.length || 0) > 0 },
    { label: apc.steps[1], href: `/${lang}/club/${slug}/admin/plans`, done: (planCount || 0) > 0 },
    { label: apc.steps[2], href: `/${lang}/club/${slug}/admin/members`, done: (memberCount || 0) > 0 },
    { label: apc.steps[3], href: `/${lang}/club/${slug}/admin/settings`, done: !!club.admin_email },
  ]

  return (
    <FeatureLockWrapper locked={locked}>
      {isNewClub && (
        <Card className="rounded-3xl border border-blue-200/60 bg-blue-50/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-blue-900">{apc.welcome_title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-800 mb-4">{apc.welcome_desc}</p>
            <div className="space-y-2">
              {onboardingSteps.map((step, i) => (
                <Link key={i} href={step.href} className="flex items-center gap-3 rounded-xl border border-blue-200/60 bg-white/80 px-4 py-3 text-sm hover:bg-white transition-colors">
                  {step.done
                    ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    : <Circle className="w-4 h-4 text-blue-300 shrink-0" />}
                  <span className={step.done ? "line-through text-slate-400" : "text-slate-800 font-medium"}>{step.label}</span>
                  {!step.done && <span className="ml-auto text-xs text-blue-500">→</span>}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {bookings && courts && <DashboardStats bookings={bookings} courts={courts} />}

      <div className="grid xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card id="tour-admin-activity" className="rounded-3xl border border-slate-200/60 bg-white/80 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{apc.activity_title}</CardTitle>
              <span className="text-xs text-slate-500">{bookings?.length || 0} {apc.entries}</span>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[620px] overflow-auto pr-2">
                {bookings?.map((booking: any) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 border border-slate-200/60 rounded-xl bg-white hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs">
                        {format(new Date(booking.start_time), "dd.MM")}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">
                          {booking.courts?.name || apc.unknown_court}
                        </div>
                        <div className="text-sm text-slate-500">
                          {format(new Date(booking.start_time), "HH:mm")} – {booking.guest_name}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <div className="font-medium text-slate-900">
                          {booking.status === "awaiting_payment" || booking.payment_status === "unpaid"
                            ? apc.pay_pending
                            : booking.payment_status === "paid_cash"
                              ? apc.pay_cash
                              : booking.payment_status === "paid_member"
                                ? apc.pay_member
                                : apc.pay_online}
                        </div>
                        <div className="text-xs text-slate-500 capitalize">{booking.status}</div>
                      </div>
                      <DeleteBookingButton id={booking.id} />
                    </div>
                  </div>
                ))}

                {bookings?.length === 0 && (
                  <div className="text-center text-slate-500 py-10">
                    {apc.no_bookings}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 xl:sticky xl:top-6 h-fit">
          <Card id="tour-admin-quick" className="rounded-3xl border border-slate-200/60 bg-white/80 shadow-sm">
            <CardHeader>
              <CardTitle>{apc.quick_title}</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const quickLinks = [
                  { label: apc.links[0], href: `/${lang}/club/${slug}/admin/settings` },
                  { label: apc.links[1], href: `/${lang}/club/${slug}/admin/vouchers` },
                  { label: apc.links[2], href: `/${lang}/club/${slug}/admin/courts` },
                  { label: apc.links[3], href: `/${lang}/club/${slug}/admin/blocks` },
                  { label: apc.links[4], href: `/${lang}/club/${slug}/admin/plans` },
                  { label: apc.links[5], href: `/${lang}/club/${slug}/admin/members` },
                  { label: apc.links[6], href: `/${lang}/club/${slug}/admin/trainers` },
                  { label: apc.links[7], href: `/${lang}/club/${slug}/admin/courses` },
                  { label: apc.links[8], href: `/${lang}/club/${slug}/admin/finance` },
                ]
                return (
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {quickLinks.map((l) => (
                      <Link key={l.href} href={l.href} className="rounded-xl border border-slate-200/60 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50">
                        {l.label}
                      </Link>
                    ))}
                    <Link href={`/${lang}/club/${slug}/admin/export`} className="rounded-xl border border-slate-200/60 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50 col-span-2">
                      {apc.links[9]}
                    </Link>
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        </div>
      </div>
    </FeatureLockWrapper>
  )
}
