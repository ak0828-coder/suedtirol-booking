# Checkpoint TODO (2026-02-13)

Stand: Tag `checkpoint-2026-02-13` (Commit `861c884`).

## Produkt / Plattform
- Alles auf `[lang]` stellen und `it`, `de`, `en` sauber unterstützen.
- Backend/Club-Admin: Sprachen pro Verein konfigurierbar.
  - Verein kann z.B. nur `de`, nur `it`, oder alle 3 aktivieren.
  - Superadmin muss das ebenfalls konfigurieren können.
- Feature-Flags pro Verein für alle Funktionen.
  - Beispiel: Trainer buchen nur für Mitglieder oder auch für Nicht-Mitglieder (pro Verein konfigurierbar).

## UX / App-Flow
- PWA Installations-Anleitung ("App-Flow").
- Mobile Optimierung + Download-Flow (ähnlich mywellness Partnerapp).

## Legal / Privacy
- Cookie-Banner & Privacy Policy pro Verein.
  - Texte im Backend editierbar.
  - Default-Text von mywellness übernehmen.
- Vertrag für Vereine (inkl. AVV/DPA).

## Payments / Stripe
- Stripe Checkout finalisieren + gesamtes Onboarding testen/verfeinern.
- Gebühr pro Buchung einstellbar.
- Guthaben-System (Credits): Pakete (z.B. 100 EUR zahlen -> 110 EUR Guthaben).
- Stornierungen: Flow/Regeln definieren.
- Barzahlung vor Ort: Option entfernen (konfigurierbar durch Verein) – entfernen.

## Branding / Marketing / Ops
- Domain Setup.
- Prüfen ob Vercel + Resend wirklich gratis nutzbar sind.
- Branding fertig machen.
- Mails/Templates erstellen inkl. Email-Signatur.
- Social Media Accounts erstellen.
- Website final machen.
- Google Account + Drive Struktur für Firma.
- Pricing-Strategie final.
- Onboarding-Handbuch für Vereine.
- Sales: Einwand-Behandlung (Sales Script).
- Playbook + Timeline (Jahr 1).

## Trainer / Kurse / Auszahlungen
- Provisionen/Trainer-Payouts: automatische Auszahlung, Club kann Provision verlangen.
- Kurse: Zahlungs-/Payout-Flow für Trainer (konfigurierbar: interner Trainer unbezahlt vs. bezahlt).
- Trainer-Onboarding, damit Verein nicht alles manuell machen muss.

## Migration / Import
- Übernahme-Flow verfeinern (Excel/anderer Anbieter Import).
- Folder-Struktur erstellen.

## Membership / Dashboard / Admin
- Mitgliedsvertrag Design erstellen und im Code einbinden.
- Mitglied-Flow (Zielbild):
  - Mitglied werden -> Formular -> Abo zahlen -> Onboarding (Vertrag digital) -> (optional) ärztliches Zeugnis + weitere Dokumente -> Mitgliederbereich (Buchung etc.).
- Issue: Beim Abo-Abschluss lädt der Button, aber es passiert nichts; Console zeigt Server Components Render 500 (Digest).
- Admin -> Mitglieder: neu erstelltes Mitglied erscheint nicht.
- Member-Rabatte: Backend geht, Frontend berücksichtigt es nicht.
- Buchung direkt über `/dashboard` für Member.
