import type { Tour } from "nextstepjs"
import { AdminGoToCourses } from "@/components/tours/admin-go-to-courses"
import { MemberGoToBooking } from "@/components/tours/member-go-to-booking"

export const adminOverviewTour: Tour[] = [
  {
    tour: "admin-overview",
    steps: [
      {
        title: "Willkommen im Admin-Bereich",
        content: "Hier findest du alle wichtigen Steuerungen für deinen Verein.",
        selector: "#tour-admin-header",
        side: "bottom",
        showControls: true,
        showSkip: true,
      },
      {
        title: "Navigation",
        content: "Wechsle zwischen Buchungen, Plätzen, Kursen, Mitgliedern und Finanzen.",
        selector: "#tour-admin-nav",
        side: "right",
        showControls: true,
        showSkip: true,
      },
      {
        title: "Nächster Schritt",
        content: (
          <>
            <div>Wir springen jetzt gemeinsam zu den Kursen.</div>
            <AdminGoToCourses />
          </>
        ),
        selector: "#tour-admin-quick",
        side: "left",
        showControls: true,
        showSkip: true,
      },
      {
        title: "Aktivitäten",
        content: "Hier siehst du die neuesten Buchungen und den aktuellen Status.",
        selector: "#tour-admin-activity",
        side: "top",
        showControls: true,
        showSkip: true,
      },
    ],
  },
]

export const adminCoursesTour: Tour[] = [
  {
    tour: "admin-courses",
    steps: [
      {
        title: "Kurse verwalten",
        content: "Lege neue Kurse an oder bearbeite bestehende.",
        selector: "#tour-courses-header",
        side: "bottom",
        showControls: true,
        showSkip: true,
      },
      {
        title: "Kurs anlegen",
        content: "Starte hier einen neuen Kurs.",
        selector: "#tour-courses-create",
        side: "bottom",
        showControls: true,
        showSkip: true,
      },
      {
        title: "Serien-Termine",
        content: "Lege wiederkehrende Termine in einem Schritt an.",
        selector: "#tour-courses-series",
        side: "top",
        showControls: true,
        showSkip: true,
      },
      {
        title: "Termine prüfen",
        content: "Hier siehst du alle geplanten Termine und kannst sie anpassen.",
        selector: "#tour-courses-sessions",
        side: "top",
        showControls: true,
        showSkip: true,
      },
    ],
  },
]

export const memberDashboardTour: Tour[] = [
  {
    tour: "member-dashboard",
    steps: [
      {
        title: "Dein Überblick",
        content: "Hier siehst du deinen Status und die wichtigsten Informationen.",
        selector: "#tour-member-header",
        side: "bottom",
        showControls: true,
        showSkip: true,
      },
      {
        title: "Nächster Termin",
        content: "Dein nächstes Spiel oder Training auf einen Blick.",
        selector: "#tour-member-next",
        side: "bottom",
        showControls: true,
        showSkip: true,
      },
      {
        title: "Zur Buchung",
        content: (
          <>
            <div>Wir wechseln jetzt direkt zur Buchungsseite.</div>
            <MemberGoToBooking />
          </>
        ),
        selector: "#tour-member-book",
        side: "bottom",
        showControls: true,
        showSkip: true,
      },
      {
        title: "Profil & Daten",
        content: "Hier kannst du deine Kontaktdaten pflegen.",
        selector: "#tour-member-profile",
        side: "top",
        showControls: true,
        showSkip: true,
      },
      {
        title: "Deine Buchungen",
        content: "Alle anstehenden Spiele und Termine an einem Ort.",
        selector: "#tour-member-upcoming",
        side: "top",
        showControls: true,
        showSkip: true,
      },
    ],
  },
]

export const memberBookingTour: Tour[] = [
  {
    tour: "member-booking",
    steps: [
      {
        title: "Buchungsseite",
        content: "Hier buchst du Plätze und siehst die wichtigsten Infos.",
        selector: "#tour-booking-header",
        side: "bottom",
        showControls: true,
        showSkip: true,
      },
      {
        title: "Plätze",
        content: "Wähle einen Platz und prüfe Preis, Dauer und Verfügbarkeit.",
        selector: "#tour-booking-courts",
        side: "top",
        showControls: true,
        showSkip: true,
      },
      {
        title: "Buchung starten",
        content: "Mit einem Klick öffnest du die Buchung und wählst Datum & Zeit.",
        selector: "#tour-booking-first",
        side: "top",
        showControls: true,
        showSkip: true,
      },
    ],
  },
]
