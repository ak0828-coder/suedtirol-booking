"use client"

import { useParams } from "next/navigation"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Euro,
  CalendarCheck,
  Users,
  AlertTriangle,
  CheckCircle,
  FileText,
  Trophy,
  Calendar,
  Clock,
  User,
  Sparkles,
  ArrowRight,
  Plus,
  Edit,
  Trash2,
  Download,
  CreditCard,
  Dumbbell,
} from "lucide-react"
import Link from "next/link"

// ── Demo Data ─────────────────────────────────────────────────────────────────

const demoClub = { name: "TC Bergblick", primary_color: "#1F3D2B" }

const demoCourts = [
  { id: "c1", name: "Platz 1", price_per_hour: 28, surface: "Sand", indoor: false, active: true },
  { id: "c2", name: "Platz 2", price_per_hour: 28, surface: "Sand", indoor: false, active: true },
  { id: "c3", name: "Platz 3", price_per_hour: 32, surface: "Hartplatz", indoor: true, active: true },
]

const demoBookingsAll = [
  { id: "b1", court_id: "c3", start_time: new Date(Date.now() - 3600000 * 2).toISOString(), guest_name: "Erna M.", status: "confirmed", payment_status: "paid_stripe", courts: { name: "Platz 3" } },
  { id: "b2", court_id: "c1", start_time: new Date(Date.now() + 3600000 * 4).toISOString(), guest_name: "Alex K.", status: "awaiting_payment", payment_status: "unpaid", courts: { name: "Platz 1" } },
  { id: "b3", court_id: "c2", start_time: new Date(Date.now() + 3600000 * 7).toISOString(), guest_name: "Maria S.", status: "confirmed", payment_status: "paid_cash", courts: { name: "Platz 2" } },
  { id: "b4", court_id: "c1", start_time: new Date(Date.now() - 3600000 * 26).toISOString(), guest_name: "Hans B.", status: "confirmed", payment_status: "paid_member", courts: { name: "Platz 1" } },
  { id: "b5", court_id: "c3", start_time: new Date(Date.now() - 3600000 * 50).toISOString(), guest_name: "Claudia M.", status: "confirmed", payment_status: "paid_stripe", courts: { name: "Platz 3" } },
  { id: "b6", court_id: "c2", start_time: new Date(Date.now() - 3600000 * 72).toISOString(), guest_name: "Peter G.", status: "confirmed", payment_status: "paid_cash", courts: { name: "Platz 2" } },
  { id: "b7", court_id: "c1", start_time: new Date(Date.now() + 3600000 * 24).toISOString(), guest_name: "Laura W.", status: "confirmed", payment_status: "paid_member", courts: { name: "Platz 1" } },
  { id: "b8", court_id: "c3", start_time: new Date(Date.now() + 3600000 * 48).toISOString(), guest_name: "Thomas R.", status: "awaiting_payment", payment_status: "unpaid", courts: { name: "Platz 3" } },
]

const demoMembers = [
  { id: "m1", first_name: "Erna", last_name: "Müller", email: "erna@example.com", status: "active", plan: "Premium", phone: "+39 340 123 456", doc_ok: true },
  { id: "m2", first_name: "Alex", last_name: "Koller", email: "alex@example.com", status: "active", plan: "Standard", phone: "+39 347 234 567", doc_ok: true },
  { id: "m3", first_name: "Maria", last_name: "Schuster", email: "maria@example.com", status: "pending", plan: "Basic", phone: "+39 342 345 678", doc_ok: false },
  { id: "m4", first_name: "Hans", last_name: "Bauer", email: "hans@example.com", status: "active", plan: "Premium", phone: "+39 348 456 789", doc_ok: true },
  { id: "m5", first_name: "Claudia", last_name: "Mair", email: "claudia@example.com", status: "active", plan: "Standard", phone: "+39 349 567 890", doc_ok: true },
  { id: "m6", first_name: "Peter", last_name: "Gruber", email: "peter@example.com", status: "inactive", plan: "Basic", phone: "+39 340 678 901", doc_ok: false },
  { id: "m7", first_name: "Laura", last_name: "Wieser", email: "laura@example.com", status: "active", plan: "Premium", phone: "+39 346 789 012", doc_ok: true },
  { id: "m8", first_name: "Thomas", last_name: "Rauch", email: "thomas@example.com", status: "active", plan: "Standard", phone: "+39 345 890 123", doc_ok: true },
]

const demoPlans = [
  { id: "p1", name: "Basic", price: 180, description: "Mitgliedschaft ohne Buchungsvorteil", count: 3, features: ["Zugang zum Club", "5% Buchungsrabatt", "Digitaler Mitgliedsausweis"] },
  { id: "p2", name: "Standard", price: 280, description: "Ideal für aktive Spieler", count: 3, features: ["Alle Basic Features", "15% Buchungsrabatt", "Prioritätsbuchung", "Kostenlose Stornierung 24h"] },
  { id: "p3", name: "Premium", price: 420, description: "Maximale Flexibilität", count: 4, features: ["Alle Standard Features", "25% Buchungsrabatt", "Gastbuchungen inklusive", "Zugang zu allen Turnieren"] },
]

const demoBlocks = [
  { id: "bl1", courts: "Platz 1 & 2", start: "12.03.2026", end: "15.03.2026", reason: "Vereinsturnier", all_day: true },
  { id: "bl2", courts: "Platz 3", start: "20.03.2026", end: "20.03.2026", reason: "Wartung Beleuchtung", all_day: false, time: "08:00–12:00" },
  { id: "bl3", courts: "Alle Plätze", start: "01.05.2026", end: "01.05.2026", reason: "Nationalfeiertag", all_day: true },
]

const demoTrainers = [
  { id: "t1", name: "Marco Rossi", email: "marco@example.com", specialization: "Einzel & Doppel", rate: 60, courses: 2, status: "active" },
  { id: "t2", name: "Anna Fischer", email: "anna@example.com", specialization: "Jugendtraining", rate: 50, courses: 1, status: "active" },
]

const demoCourses = [
  { id: "cr1", name: "Anfänger Grundkurs", trainer: "Marco Rossi", schedule: "Di 18:00–19:30", enrolled: 8, max: 10, price: 120, start: "10.03.2026" },
  { id: "cr2", name: "Intensivwoche Jugend", trainer: "Anna Fischer", schedule: "Mo–Fr 14:00–16:00", enrolled: 6, max: 8, price: 200, start: "17.03.2026" },
  { id: "cr3", name: "Fortgeschrittene Taktik", trainer: "Marco Rossi", schedule: "Do 19:30–21:00", enrolled: 5, max: 6, price: 150, start: "12.03.2026" },
]

const demoVouchers = [
  { id: "v1", code: "SOMMER25", type: "percent", discount: 25, used: 12, limit: 50, valid_until: "31.08.2026", active: true },
  { id: "v2", code: "FREUNDE10", type: "percent", discount: 10, used: 34, limit: 100, valid_until: "31.12.2026", active: true },
  { id: "v3", code: "WINTER2026", type: "percent", discount: 20, used: 5, limit: 30, valid_until: "31.03.2026", active: false },
  { id: "v4", code: "GRATIS1H", type: "fixed", discount: 28, used: 8, limit: 20, valid_until: "30.06.2026", active: true },
]

const demoFinanceMonthly = [
  { month: "Sep '25", total: 1800, bookings: 38 },
  { month: "Okt '25", total: 2100, bookings: 45 },
  { month: "Nov '25", total: 1950, bookings: 41 },
  { month: "Dez '25", total: 2300, bookings: 49 },
  { month: "Jan '26", total: 2380, bookings: 52 },
  { month: "Feb '26", total: 2840, bookings: 61 },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function PaymentBadge({ status }: { status: string }) {
  if (status === "unpaid" || status === "awaiting_payment") {
    return <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 border border-amber-200">Ausstehend</span>
  }
  if (status === "paid_cash") {
    return <span className="inline-flex rounded-full bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-600 border border-slate-200">Vor Ort</span>
  }
  if (status === "paid_member") {
    return <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 border border-blue-200">Abo</span>
  }
  return <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">Online</span>
}

function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-sm">
      <div>
        <h2 className="text-2xl md:text-3xl font-semibold text-slate-900">{title}</h2>
        {subtitle && <p className="text-slate-500 text-sm mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

// ── Section: Bookings ─────────────────────────────────────────────────────────

function BookingsSection() {
  return (
    <>
      <SectionHeader title="Buchungen" subtitle="Alle Buchungen an einem Ort." />
      <Card className="rounded-3xl border border-slate-200/60 bg-white/80 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Aktivität</CardTitle>
          <span className="text-xs text-slate-500">{demoBookingsAll.length} Einträge</span>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {demoBookingsAll.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-4 border border-slate-200/60 rounded-xl bg-white hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs">
                    {format(new Date(booking.start_time), "dd.MM")}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{booking.courts?.name}</div>
                    <div className="text-sm text-slate-500">
                      {format(new Date(booking.start_time), "HH:mm")} Uhr · {booking.guest_name}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <PaymentBadge status={booking.payment_status} />
                  <button className="rounded-full border border-slate-200/60 bg-white p-1.5 text-slate-400 hover:text-red-500 hover:border-red-200 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  )
}

// ── Section: Courts ───────────────────────────────────────────────────────────

function CourtsSection() {
  return (
    <>
      <SectionHeader
        title="Plätze"
        subtitle="Plätze verwalten und Preise festlegen."
        action={
          <Button className="rounded-full gap-2" style={{ backgroundColor: demoClub.primary_color }}>
            <Plus className="w-4 h-4" /> Platz hinzufügen
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-3">
        {demoCourts.map((court) => (
          <Card key={court.id} className="rounded-3xl border border-slate-200/60 bg-white/80 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="font-semibold text-slate-900 text-lg">{court.name}</div>
                  <div className="text-sm text-slate-500">{court.surface} · {court.indoor ? "Halle" : "Außen"}</div>
                </div>
                <Badge variant={court.active ? "default" : "secondary"}>
                  {court.active ? "Aktiv" : "Inaktiv"}
                </Badge>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 mb-4">
                <div className="text-xs text-slate-400 mb-0.5">Preis pro Stunde</div>
                <div className="text-2xl font-semibold text-slate-900">€ {court.price_per_hour}</div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="rounded-full flex-1 gap-1.5">
                  <Edit className="w-3.5 h-3.5" /> Bearbeiten
                </Button>
                <Button variant="ghost" size="sm" className="rounded-full text-red-500 hover:text-red-600 hover:bg-red-50">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}

// ── Section: Blocks ───────────────────────────────────────────────────────────

function BlocksSection() {
  return (
    <>
      <SectionHeader
        title="Sperrzeiten"
        subtitle="Plätze für bestimmte Zeiträume sperren."
        action={
          <Button className="rounded-full gap-2" style={{ backgroundColor: demoClub.primary_color }}>
            <Plus className="w-4 h-4" /> Sperrzeit anlegen
          </Button>
        }
      />
      <Card className="rounded-3xl border border-slate-200/60 bg-white/80 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80">
                <TableHead>Plätze</TableHead>
                <TableHead>Von</TableHead>
                <TableHead>Bis</TableHead>
                <TableHead>Grund</TableHead>
                <TableHead>Zeit</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {demoBlocks.map((block) => (
                <TableRow key={block.id} className="hover:bg-slate-50/80">
                  <TableCell className="font-medium">{block.courts}</TableCell>
                  <TableCell>{block.start}</TableCell>
                  <TableCell>{block.end}</TableCell>
                  <TableCell>{block.reason}</TableCell>
                  <TableCell>{block.all_day ? "Ganztägig" : block.time}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="rounded-full text-red-500 hover:bg-red-50">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}

// ── Section: Plans ────────────────────────────────────────────────────────────

function PlansSection() {
  return (
    <>
      <SectionHeader
        title="Abos & Mitgliedschaftspläne"
        subtitle="Mitgliedschaftsmodelle verwalten."
        action={
          <Button className="rounded-full gap-2" style={{ backgroundColor: demoClub.primary_color }}>
            <Plus className="w-4 h-4" /> Plan erstellen
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-3">
        {demoPlans.map((plan, i) => (
          <Card
            key={plan.id}
            className={`rounded-3xl shadow-sm ${
              i === 2
                ? "border-2 border-[#1F3D2B] bg-[#1F3D2B] text-white"
                : "border border-slate-200/60 bg-white/80"
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-1">
                <div className={`font-semibold text-lg ${i === 2 ? "text-white" : "text-slate-900"}`}>
                  {plan.name}
                </div>
                {i === 2 && (
                  <span className="rounded-full bg-[#CBBF9A] px-2 py-0.5 text-[10px] font-bold text-[#0E1A14]">
                    BELIEBT
                  </span>
                )}
              </div>
              <div className={`text-sm mb-4 ${i === 2 ? "text-white/70" : "text-slate-500"}`}>
                {plan.description}
              </div>
              <div className="mb-4">
                <span className={`text-3xl font-semibold ${i === 2 ? "text-white" : "text-slate-900"}`}>
                  € {plan.price}
                </span>
                <span className={`text-sm ${i === 2 ? "text-white/60" : "text-slate-400"}`}>/Jahr</span>
              </div>
              <div className="space-y-2 mb-5">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <div className={`h-4 w-4 rounded-full flex items-center justify-center flex-shrink-0 ${i === 2 ? "bg-[#CBBF9A]/20" : "bg-slate-100"}`}>
                      <CheckCircle className={`w-2.5 h-2.5 ${i === 2 ? "text-[#CBBF9A]" : "text-slate-500"}`} />
                    </div>
                    <span className={`text-xs ${i === 2 ? "text-white/80" : "text-slate-600"}`}>{f}</span>
                  </div>
                ))}
              </div>
              <div className={`flex items-center justify-between text-xs mb-4 rounded-xl p-2.5 ${i === 2 ? "bg-white/10" : "bg-slate-50"}`}>
                <span className={i === 2 ? "text-white/70" : "text-slate-400"}>Aktive Mitglieder</span>
                <span className={`font-semibold ${i === 2 ? "text-white" : "text-slate-700"}`}>{plan.count}</span>
              </div>
              <Button
                variant={i === 2 ? "secondary" : "outline"}
                size="sm"
                className="rounded-full w-full gap-1.5"
              >
                <Edit className="w-3.5 h-3.5" /> Bearbeiten
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}

// ── Section: Members ──────────────────────────────────────────────────────────

function MembersSection() {
  const active = demoMembers.filter((m) => m.status === "active").length
  const pending = demoMembers.filter((m) => m.status === "pending").length
  const noDoc = demoMembers.filter((m) => !m.doc_ok).length

  return (
    <>
      <SectionHeader
        title="Mitglieder-Kartei"
        subtitle="Verwaltung und Einladungen an einem Ort."
        action={
          <Button className="rounded-full gap-2" style={{ backgroundColor: demoClub.primary_color }}>
            <Plus className="w-4 h-4" /> Mitglied einladen
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm text-amber-700">Dokumente prüfen</div>
              <div className="text-2xl font-semibold text-amber-900">{noDoc}</div>
              <div className="text-xs text-amber-700">KI benötigt Bestätigung</div>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-red-200 bg-red-50 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm text-red-700">Beiträge offen</div>
              <div className="text-2xl font-semibold text-red-900">{pending}</div>
              <div className="text-xs text-red-700">Zahlung ausstehend</div>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm text-emerald-700">Aktive Mitglieder</div>
              <div className="text-2xl font-semibold text-emerald-900">{active}</div>
              <div className="text-xs text-emerald-700">Alles im grünen Bereich</div>
            </div>
          </div>
        </div>
      </div>

      <div className="border border-slate-200/60 rounded-3xl bg-white/80 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80">
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Abo</TableHead>
              <TableHead>Attest</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {demoMembers.map((m) => (
              <TableRow key={m.id} className="hover:bg-slate-50/80">
                <TableCell className="font-medium">
                  {m.first_name} {m.last_name}
                  <div className="text-xs text-slate-400">{m.email}</div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      m.status === "active" ? "default" : m.status === "inactive" ? "secondary" : "outline"
                    }
                  >
                    {m.status === "active" ? "Aktiv" : m.status === "inactive" ? "Inaktiv" : "Ausstehend"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-slate-600">{m.plan}</span>
                </TableCell>
                <TableCell>
                  {m.doc_ok ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 text-xs">
                      <CheckCircle className="w-3.5 h-3.5" /> OK
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-red-500 text-xs">
                      <AlertTriangle className="w-3.5 h-3.5" /> Fehlt
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-slate-500">{m.phone}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="rounded-full gap-1.5">
                    <Edit className="w-3.5 h-3.5" /> Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}

// ── Section: Trainers ─────────────────────────────────────────────────────────

function TrainersSection() {
  return (
    <>
      <SectionHeader
        title="Trainer"
        subtitle="Trainer verwalten und Abrechnungen einsehen."
        action={
          <Button className="rounded-full gap-2" style={{ backgroundColor: demoClub.primary_color }}>
            <Plus className="w-4 h-4" /> Trainer hinzufügen
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-2">
        {demoTrainers.map((trainer) => (
          <Card key={trainer.id} className="rounded-3xl border border-slate-200/60 bg-white/80 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 font-semibold text-lg flex-shrink-0">
                  {trainer.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-900">{trainer.name}</div>
                  <div className="text-sm text-slate-500">{trainer.email}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{trainer.specialization}</div>
                </div>
                <Badge variant="default">Aktiv</Badge>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="text-xs text-slate-400">Stundensatz</div>
                  <div className="font-semibold text-slate-900">€ {trainer.rate}</div>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="text-xs text-slate-400">Aktive Kurse</div>
                  <div className="font-semibold text-slate-900">{trainer.courses}</div>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button variant="outline" size="sm" className="rounded-full flex-1 gap-1.5">
                  <Edit className="w-3.5 h-3.5" /> Bearbeiten
                </Button>
                <Button variant="outline" size="sm" className="rounded-full gap-1.5">
                  Abrechnung
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}

// ── Section: Courses ──────────────────────────────────────────────────────────

function CoursesSection() {
  return (
    <>
      <SectionHeader
        title="Kurse"
        subtitle="Trainingsangebote verwalten und Anmeldungen einsehen."
        action={
          <Button className="rounded-full gap-2" style={{ backgroundColor: demoClub.primary_color }}>
            <Plus className="w-4 h-4" /> Kurs erstellen
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-3">
        {demoCourses.map((course) => (
          <Card key={course.id} className="rounded-3xl border border-slate-200/60 bg-white/80 shadow-sm">
            <CardContent className="p-6">
              <div className="font-semibold text-slate-900 mb-1">{course.name}</div>
              <div className="text-sm text-slate-500 mb-4">{course.trainer}</div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> {course.schedule}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CalendarCheck className="w-3.5 h-3.5 text-slate-400" /> Start: {course.start}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Euro className="w-3.5 h-3.5 text-slate-400" /> € {course.price}
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 mb-4">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400">Anmeldungen</span>
                  <span className="font-semibold text-slate-700">
                    {course.enrolled}/{course.max}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#1F3D2B]"
                    style={{ width: `${(course.enrolled / course.max) * 100}%` }}
                  />
                </div>
              </div>
              <Button variant="outline" size="sm" className="rounded-full w-full gap-1.5">
                <Edit className="w-3.5 h-3.5" /> Bearbeiten
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}

// ── Section: Finance ──────────────────────────────────────────────────────────

function FinanceSection() {
  const maxTotal = Math.max(...demoFinanceMonthly.map((m) => m.total))

  return (
    <>
      <SectionHeader title="Finanzen" subtitle="Umsatz, Zahlungen und Auszahlungen." />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-3xl border border-slate-200/60 bg-white/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Umsatz aktuell</CardTitle>
            <Euro className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">€ 2.840</div>
            <p className="text-xs text-slate-400 mt-1">+19,3% zum Vormonat</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border border-slate-200/60 bg-white/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ausstehend</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">€ 340</div>
            <p className="text-xs text-slate-400 mt-1">3 offene Zahlungen</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border border-slate-200/60 bg-white/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trainer Auszahlung</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">€ 890</div>
            <p className="text-xs text-slate-400 mt-1">Diesen Monat ausstehend</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-3xl border border-slate-200/60 bg-white/80 shadow-sm">
        <CardHeader>
          <CardTitle>Monatlicher Umsatz</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {demoFinanceMonthly.map((m) => (
              <div key={m.month} className="flex items-center gap-4">
                <div className="w-16 text-xs text-slate-500 text-right flex-shrink-0">{m.month}</div>
                <div className="flex-1 h-8 rounded-xl bg-slate-50 overflow-hidden">
                  <div
                    className="h-full rounded-xl bg-[#1F3D2B]/80 flex items-center pl-3 transition-all"
                    style={{ width: `${(m.total / maxTotal) * 100}%` }}
                  >
                    <span className="text-xs text-white font-medium whitespace-nowrap">€ {m.total.toLocaleString("de-DE")}</span>
                  </div>
                </div>
                <div className="w-12 text-xs text-slate-400 text-right flex-shrink-0">
                  {m.bookings} Buch.
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  )
}

// ── Section: Vouchers ─────────────────────────────────────────────────────────

function VouchersSection() {
  return (
    <>
      <SectionHeader
        title="Gutscheine"
        subtitle="Rabattcodes erstellen und verwalten."
        action={
          <Button className="rounded-full gap-2" style={{ backgroundColor: demoClub.primary_color }}>
            <Plus className="w-4 h-4" /> Gutschein erstellen
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-2">
        {demoVouchers.map((v) => (
          <Card key={v.id} className="rounded-3xl border border-slate-200/60 bg-white/80 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="font-mono font-bold text-lg text-slate-900 tracking-wider">{v.code}</div>
                  <div className="text-sm text-slate-500 mt-0.5">Gültig bis {v.valid_until}</div>
                </div>
                <Badge variant={v.active ? "default" : "secondary"}>
                  {v.active ? "Aktiv" : "Abgelaufen"}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="rounded-xl bg-slate-50 p-3 text-center">
                  <div className="text-xs text-slate-400 mb-0.5">Rabatt</div>
                  <div className="font-semibold text-slate-800">
                    {v.type === "percent" ? `${v.discount}%` : `€ ${v.discount}`}
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 text-center">
                  <div className="text-xs text-slate-400 mb-0.5">Verwendet</div>
                  <div className="font-semibold text-slate-800">{v.used}</div>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 text-center">
                  <div className="text-xs text-slate-400 mb-0.5">Limit</div>
                  <div className="font-semibold text-slate-800">{v.limit}</div>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden mb-4">
                <div
                  className="h-full rounded-full bg-[#1F3D2B]"
                  style={{ width: `${(v.used / v.limit) * 100}%` }}
                />
              </div>
              <Button variant="outline" size="sm" className="rounded-full w-full gap-1.5">
                <Edit className="w-3.5 h-3.5" /> Bearbeiten
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}

// ── Section: Settings ─────────────────────────────────────────────────────────

function SettingsSection() {
  return (
    <>
      <SectionHeader title="Einstellungen" subtitle="Club-Konfiguration und Darstellung." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-3xl border border-slate-200/60 bg-white/80 shadow-sm">
          <CardHeader><CardTitle>Allgemein</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Vereinsname", value: "TC Bergblick" },
              { label: "URL-Slug", value: "tc-bergblick" },
              { label: "Standardsprache", value: "Deutsch" },
              { label: "Zeitzone", value: "Europe/Rome" },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <span className="text-sm text-slate-500">{row.label}</span>
                <span className="text-sm font-medium text-slate-900">{row.value}</span>
              </div>
            ))}
            <Button className="rounded-full w-full mt-2" style={{ backgroundColor: demoClub.primary_color }}>
              Speichern
            </Button>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border border-slate-200/60 bg-white/80 shadow-sm">
          <CardHeader><CardTitle>Design & Marke</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-slate-500 mb-2">Vereinsfarbe</div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl border border-slate-200" style={{ backgroundColor: demoClub.primary_color }} />
                <span className="font-mono text-sm text-slate-700">{demoClub.primary_color}</span>
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-500 mb-2">Logo</div>
              <div className="h-16 w-16 rounded-2xl bg-[#1F3D2B] flex items-center justify-center text-white font-bold text-xl border border-slate-200">
                TC
              </div>
            </div>
            <Button variant="outline" className="rounded-full w-full gap-1.5">
              <Edit className="w-3.5 h-3.5" /> Bearbeiten
            </Button>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border border-slate-200/60 bg-white/80 shadow-sm lg:col-span-2">
          <CardHeader><CardTitle>Buchungsregeln</CardTitle></CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { label: "Buchungen im Voraus", value: "14 Tage" },
                { label: "Mindestbuchungszeit", value: "30 Minuten" },
                { label: "Stornierungsfrist", value: "24 Stunden" },
                { label: "Gastbuchungen", value: "Erlaubt" },
                { label: "Zahlung", value: "Online + Bar" },
                { label: "Buchungsbestätigung", value: "Per E-Mail" },
              ].map((row) => (
                <div key={row.label} className="rounded-xl bg-slate-50 p-3">
                  <div className="text-xs text-slate-400 mb-0.5">{row.label}</div>
                  <div className="font-semibold text-slate-800">{row.value}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

// ── Section: Export ───────────────────────────────────────────────────────────

function ExportSection() {
  return (
    <>
      <SectionHeader title="CSV Export" subtitle="Daten als CSV exportieren." />
      <div className="grid gap-4 md:grid-cols-2">
        {[
          { title: "Buchungen", desc: "Alle Buchungen mit Datum, Platz, Gast und Zahlungsstatus.", icon: CalendarCheck, count: "47 Einträge" },
          { title: "Mitglieder", desc: "Mitgliederliste mit Kontaktdaten, Status und Abo.", icon: Users, count: "8 Einträge" },
          { title: "Finanzen", desc: "Alle Zahlungen und Transaktionen im Überblick.", icon: Euro, count: "52 Einträge" },
          { title: "Trainer-Abrechnungen", desc: "Trainer-Stunden und Auszahlungen.", icon: Trophy, count: "12 Einträge" },
        ].map((item) => (
          <Card key={item.title} className="rounded-3xl border border-slate-200/60 bg-white/80 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-2xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <item.icon className="h-5 w-5 text-slate-600" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-900">{item.title}</div>
                  <div className="text-sm text-slate-500 mt-0.5">{item.desc}</div>
                  <div className="text-xs text-slate-400 mt-2">{item.count}</div>
                </div>
              </div>
              <Button
                className="mt-4 rounded-full w-full gap-2"
                style={{ backgroundColor: demoClub.primary_color }}
              >
                <Download className="w-4 h-4" /> Als CSV herunterladen
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}

// ── Section: Member (Member Dashboard) ─────────────────────────────────────────

function MemberDashboardSection({ lang }: { lang: string }) {
  const primary = demoClub.primary_color
  const nextDate = new Date(Date.now() + 3600000 * 28)
  const nextDate2 = new Date(Date.now() + 3600000 * 52)
  const pastDate1 = new Date(Date.now() - 3600000 * 25)
  const pastDate2 = new Date(Date.now() - 3600000 * 49)

  const upcomingBookings = [
    { id: 'u1', start_time: nextDate.toISOString(), courts: { name: 'Platz 2' } },
    { id: 'u2', start_time: nextDate2.toISOString(), courts: { name: 'Platz 1' } },
  ]
  const pastBookings = [
    { id: 'p1', start_time: pastDate1.toISOString(), courts: { name: 'Platz 1' } },
    { id: 'p2', start_time: pastDate2.toISOString(), courts: { name: 'Platz 3' } },
  ]
  const ranking = [
    { userId: '1', rank: 1, name: 'Erna M.', points: 240 },
    { userId: '2', rank: 2, name: 'Hans B.', points: 185 },
    { userId: '3', rank: 3, name: 'Claudia M.', points: 160 },
    { userId: '4', rank: 4, name: 'Peter G.', points: 142 },
  ]

  const grain = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`

  return (
    <div
      className="min-h-screen pb-36"
      style={{
        background: '#09090b',
        ['--club-primary' as any]: primary,
        ['--club-primary-foreground' as any]: '#ffffff',
      }}
    >
      {/* Grain */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ opacity: 0.025, backgroundImage: grain, backgroundSize: '160px', zIndex: 9998 }}
      />

      {/* Hero */}
      <div
        className="relative overflow-hidden px-5 pt-14 pb-14"
        style={{
          background: `linear-gradient(160deg, color-mix(in srgb, ${primary} 85%, #000) 0%, color-mix(in srgb, ${primary} 45%, #000) 100%)`,
        }}
      >
        <div className="absolute -top-20 -right-16 w-72 h-72 rounded-full opacity-15" style={{ background: 'white' }} />
        <div className="absolute -bottom-24 -left-12 w-56 h-56 rounded-full opacity-10" style={{ background: 'white' }} />
        <div className="relative max-w-xl mx-auto">
          <div
            className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium text-white/90 mb-5"
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.20)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Mitglied aktiv
            <span className="text-white/40">·</span>
            Premium
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-[-0.03em] leading-none">
            Hallo,<br />Erna
          </h1>
          <p className="label-caps text-white/50 mt-3">{demoClub.name}</p>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-xl mx-auto px-4 -mt-5 space-y-4">

        {/* Book CTA */}
        <div
          className="flex items-center justify-between w-full rounded-3xl p-6 cursor-pointer"
          style={{
            background: `linear-gradient(135deg, ${primary}, color-mix(in srgb, ${primary} 65%, #000))`,
            boxShadow: `0 8px 32px color-mix(in srgb, ${primary} 35%, transparent)`,
          }}
        >
          <div>
            <p className="label-caps text-white/60">Bereit zu spielen?</p>
            <p className="text-2xl font-extrabold text-white tracking-tight mt-1">Platz buchen</p>
          </div>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <ArrowRight className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Next booking */}
        <div
          className="rounded-3xl p-5"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <p className="label-caps text-white/30 mb-3">Nächste Buchung</p>
          <div className="flex items-end justify-between">
            <div>
              <p className="font-mono text-3xl font-bold text-white leading-none">
                {format(nextDate, 'dd. MMM')}
              </p>
              <div className="flex items-center gap-2 mt-2 text-sm text-white/50">
                <Clock className="w-3.5 h-3.5" />
                <span className="font-mono">{format(nextDate, 'HH:mm')}</span>
                <span className="text-white/25">·</span>
                <span>{upcomingBookings[0].courts.name}</span>
              </div>
            </div>
            <button
              className="rounded-2xl px-4 py-2 text-xs font-semibold text-white/60"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}
            >
              Stornieren
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Siege', value: 12 },
            { label: 'Niederlagen', value: 4 },
            { label: 'Streak', value: 3 },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl p-4 text-center"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <p className="font-mono text-3xl font-bold text-white">{s.value}</p>
              <p className="label-caps-sm text-white/35 mt-1.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-3">
          <div
            className="rounded-2xl p-4 flex items-center gap-3 cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `color-mix(in srgb, ${primary} 18%, transparent)` }}
            >
              <Dumbbell className="w-4 h-4" style={{ color: primary }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Training</p>
              <p className="text-xs text-white/35">&amp; Kurse</p>
            </div>
          </div>
          <div
            className="rounded-2xl p-4 flex items-center gap-3 cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `color-mix(in srgb, ${primary} 18%, transparent)` }}
            >
              <Trophy className="w-4 h-4" style={{ color: primary }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Rangliste</p>
              <p className="text-xs text-white/35">Top 50</p>
            </div>
          </div>
        </div>

        {/* Membership card */}
        <div
          className="rounded-3xl p-5"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <p className="label-caps text-white/30">Meine Mitgliedschaft</p>
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide"
              style={{ background: 'rgba(52,211,153,0.12)', color: 'rgb(52,211,153)', border: '1px solid rgba(52,211,153,0.20)' }}
            >
              Bezahlt
            </span>
          </div>
          <p className="text-lg font-bold text-white">Premium</p>
          <p className="label-caps text-white/30 mt-2">
            Gültig bis{' '}
            <span className="font-mono text-white/60 font-medium normal-case tracking-normal text-[11px]">31.12.2026</span>
          </p>
          <div className="flex gap-2 mt-4">
            <button
              className="rounded-2xl px-4 py-2 text-xs font-semibold text-white/60"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}
            >
              Zahlungen verwalten
            </button>
          </div>
        </div>

        {/* Upcoming bookings */}
        <div
          className="rounded-3xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div
            className="px-5 py-4 flex items-center justify-between"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p className="text-sm font-semibold text-white">Anstehende Buchungen</p>
            <span
              className="font-mono text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
              style={{ background: `color-mix(in srgb, ${primary} 20%, transparent)`, color: primary }}
            >
              {upcomingBookings.length}
            </span>
          </div>
          {upcomingBookings.map((b, idx) => (
            <div
              key={b.id}
              className="flex items-center justify-between px-5 py-4"
              style={idx > 0 ? { borderTop: '1px solid rgba(255,255,255,0.05)' } : {}}
            >
              <div>
                <p className="text-sm font-medium text-white font-mono">
                  {format(new Date(b.start_time), 'dd. MMM · HH:mm')}
                </p>
                <p className="text-xs text-white/35 mt-0.5">{b.courts.name}</p>
              </div>
              <button
                className="rounded-2xl px-3 py-1.5 text-xs font-semibold text-white/50"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                Stornieren
              </button>
            </div>
          ))}
        </div>

        {/* Past games */}
        <div
          className="rounded-3xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-sm font-semibold text-white">Letzte Spiele</p>
          </div>
          {pastBookings.map((b, idx) => (
            <div
              key={b.id}
              className="flex items-center justify-between px-5 py-4"
              style={idx > 0 ? { borderTop: '1px solid rgba(255,255,255,0.05)' } : {}}
            >
              <div>
                <p className="text-sm font-medium text-white font-mono">
                  {format(new Date(b.start_time), 'dd. MMM · HH:mm')}
                </p>
                <p className="text-xs text-white/35 mt-0.5">{b.courts.name}</p>
              </div>
              <span className="text-xs text-white/20">—</span>
            </div>
          ))}
        </div>

        {/* Leaderboard preview */}
        <div
          className="rounded-3xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div
            className="h-[2px]"
            style={{ background: `linear-gradient(90deg, ${primary}, transparent)` }}
          />
          <div
            className="px-5 py-4 flex items-center justify-between"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p className="text-sm font-semibold text-white">Rangliste</p>
            <Trophy className="w-4 h-4" style={{ color: primary }} />
          </div>
          {ranking.map((row, idx) => (
            <div
              key={row.userId}
              className="flex items-center gap-3 px-5 py-3.5"
              style={idx > 0 ? { borderTop: '1px solid rgba(255,255,255,0.05)' } : {}}
            >
              <span className="font-mono text-sm font-medium w-5 text-white/25">{row.rank}</span>
              <span className="flex-1 text-sm font-medium text-white/75">{row.name}</span>
              <span
                className="font-mono text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{
                  background: `color-mix(in srgb, ${primary} 15%, transparent)`,
                  color: primary,
                  border: `1px solid color-mix(in srgb, ${primary} 28%, transparent)`,
                }}
              >
                {row.points} Pkt
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
// ── Main page component ───────────────────────────────────────────────────────

export default function DemoSectionPage() {
  const params = useParams()
  const section = typeof params?.section === "string" ? params.section : ""
  const lang = typeof params?.lang === "string" ? params.lang : "de"

  if (section === "member") return <MemberDashboardSection lang={lang} />
  if (section === "bookings") return <BookingsSection />
  if (section === "courts") return <CourtsSection />
  if (section === "blocks") return <BlocksSection />
  if (section === "plans") return <PlansSection />
  if (section === "members") return <MembersSection />
  if (section === "trainers") return <TrainersSection />
  if (section === "courses") return <CoursesSection />
  if (section === "finance") return <FinanceSection />
  if (section === "vouchers") return <VouchersSection />
  if (section === "settings") return <SettingsSection />
  if (section === "export") return <ExportSection />

  // Fallback
  return (
    <div className="rounded-3xl border border-slate-200/60 bg-white/80 p-10 text-center shadow-sm">
      <div className="text-slate-400 text-sm">Sektion nicht gefunden</div>
    </div>
  )
}
