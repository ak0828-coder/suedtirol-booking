"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, CreditCard, FileSignature, Users, BarChart3, Sparkles, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

const adminWidgets = [
  { title: "Letzte Buchungen", value: "18 heute", icon: Calendar },
  { title: "Offene Beitraege", value: "7", icon: CreditCard },
  { title: "Trainerstunden", value: "12 diese Woche", icon: Sparkles },
  { title: "Vertraege offen", value: "5", icon: FileSignature },
];

const memberWidgets = [
  { title: "Naechste Buchung", value: "Platz 2 - 18:30", icon: Calendar },
  { title: "Mitgliedschaft", value: "Premium aktiv", icon: Users },
  { title: "Offene Zahlungen", value: "0 EUR", icon: CreditCard },
  { title: "Auslastung", value: "72% diese Woche", icon: BarChart3 },
];

export default function DemoPage() {
  const [mode, setMode] = useState<"admin" | "member">("admin");

  return (
    <div className="min-h-screen bg-[#f7f4ef] text-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-12 space-y-10">
        <div className="space-y-3">
          <div className="text-sm uppercase tracking-wide text-slate-500">Demo</div>
          <h1 className="text-4xl font-semibold">So sieht Avaimo in der Praxis aus</h1>
          <p className="text-slate-600 max-w-2xl">
            Kein Login, kein Setup. Wechsel zwischen Admin-Ansicht und Mitglieder-Ansicht und
            sieh dir das reale Nutzererlebnis an.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setMode("admin")}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              mode === "admin"
                ? "bg-slate-900 text-white"
                : "border border-slate-300 text-slate-700"
            }`}
          >
            Admin Ansicht
          </button>
          <button
            type="button"
            onClick={() => setMode("member")}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              mode === "member"
                ? "bg-slate-900 text-white"
                : "border border-slate-300 text-slate-700"
            }`}
          >
            Mitglieder Ansicht
          </button>
          <Link href="/" className="rounded-full border border-slate-300 px-4 py-2 text-sm">
            Zurueck zur Website
          </Link>
        </div>

        {mode === "admin" ? (
          <div className="rounded-3xl border border-slate-200/60 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-400">Admin Dashboard</div>
                <h2 className="text-2xl font-semibold">TC Bergblick - Overview</h2>
              </div>
              <div className="rounded-full bg-slate-100 px-4 py-2 text-xs text-slate-500">
                Heute · 12.30 Uhr
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {adminWidgets.map((item) => (
                <div key={item.title} className="rounded-2xl border border-slate-200/60 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <item.icon className="h-4 w-4" /> {item.title}
                  </div>
                  <div className="mt-2 text-lg font-semibold">{item.value}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-2xl border border-slate-200/60 bg-white p-5">
                <div className="text-sm font-semibold">Letzte Aktivitaeten</div>
                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  {[
                    "Platz 3 - 19:00 - Mitglied bezahlt",
                    "Sommercamp U12 - 2 Plaetze frei",
                    "Vertrag wartet auf Unterschrift",
                    "Trainer Max - 3 Sessions offen",
                  ].map((row) => (
                    <div key={row} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                      <span>{row}</span>
                      <ArrowRight className="h-4 w-4 text-slate-400" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200/60 bg-white p-5">
                <div className="text-sm font-semibold">Schnellzugriff</div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  {[
                    "Mitglieder",
                    "Plaetze",
                    "Trainer",
                    "Kurse",
                    "Abrechnung",
                    "Vertraege",
                  ].map((item) => (
                    <div key={item} className="rounded-xl border border-slate-200/60 bg-slate-50 px-3 py-2">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200/60 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-400">Mitglieder Bereich</div>
                <h2 className="text-2xl font-semibold">Hallo Erna - Willkommen zur Buchung</h2>
              </div>
              <div className="rounded-full bg-emerald-100 px-4 py-2 text-xs text-emerald-700">
                Mitglied aktiv
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {memberWidgets.map((item) => (
                <div key={item.title} className="rounded-2xl border border-slate-200/60 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <item.icon className="h-4 w-4" /> {item.title}
                  </div>
                  <div className="mt-2 text-lg font-semibold">{item.value}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-2xl border border-slate-200/60 bg-white p-5">
                <div className="text-sm font-semibold">Plaetze heute</div>
                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  {[
                    "Platz 1 - 17:00 - frei",
                    "Platz 2 - 18:30 - frei",
                    "Platz 3 - 19:00 - belegt",
                    "Platz 4 - 20:00 - frei",
                  ].map((row) => (
                    <div key={row} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                      <span>{row}</span>
                      <button type="button" className="text-xs font-semibold text-slate-900">
                        Buchen
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200/60 bg-white p-5">
                <div className="text-sm font-semibold">Kurse & Trainer</div>
                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  {[
                    "Sommercamp U12 - 2 Plaetze frei",
                    "Trainer Max - Einzelstunde 45 EUR",
                    "Damenrunde - 6/12 Teilnehmer",
                  ].map((row) => (
                    <div key={row} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                      <span>{row}</span>
                      <ArrowRight className="h-4 w-4 text-slate-400" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-3xl border border-slate-200/60 bg-white p-6 space-y-3">
          <div className="text-lg font-semibold">Gefuehrte Demo</div>
          <p className="text-sm text-slate-600">
            Wir zeigen dir alle Module inkl. Onboarding, Zahlungsfluss und Reporting.
          </p>
          <div className="flex flex-wrap gap-3">
            <a className="rounded-full bg-slate-900 px-5 py-2 text-white" href="mailto:hello@avaimo.com">
              Demo anfragen
            </a>
            <Link href="/" className="rounded-full border border-slate-300 px-5 py-2">
              Zurueck zur Website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
