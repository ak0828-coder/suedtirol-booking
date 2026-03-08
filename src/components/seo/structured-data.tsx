const BASE_URL = "https://avaimo.com"

export function OrganizationSchema({ lang = "de" }: { lang?: string }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${BASE_URL}/#organization`,
    name: "Avaimo",
    url: BASE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${BASE_URL}/og-image.png`,
      width: 1200,
      height: 630,
    },
    description:
      "All-in-One-Vereinsverwaltung für Sportvereine: Buchung, Mitglieder, Zahlungen, Verträge und Trainer in einem System.",
    contactPoint: {
      "@type": "ContactPoint",
      email: "info@avaimo.com",
      contactType: "customer service",
      availableLanguage: ["German", "Italian", "English"],
    },
    areaServed: ["DE", "AT", "CH", "IT"],
    knowsLanguage: ["de", "it", "en"],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function SoftwareApplicationSchema({ lang = "de" }: { lang?: string }) {
  const descriptions: Record<string, string> = {
    de: "Vereinsverwaltung für Sportvereine: Buchung, Mitglieder, Zahlungen und Verträge in einem eleganten System.",
    it: "Gestione club sportivi: prenotazioni, soci, pagamenti e contratti in un unico sistema.",
    en: "Sports club management: bookings, members, payments and contracts in one elegant system.",
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${BASE_URL}/#software`,
    name: "Avaimo",
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Sports Club Management",
    operatingSystem: "Web, iOS, Android (PWA)",
    browserRequirements: "Requires JavaScript",
    url: `${BASE_URL}/${lang}/demo`,
    description: descriptions[lang] || descriptions.de,
    featureList: [
      "Online court booking with calendar",
      "Member management with digital contracts",
      "Stripe payment integration",
      "Trainer & course management",
      "AI document verification",
      "Automated email reminders",
      "Revenue reporting & export",
      "Multilingual (DE, IT, EN)",
    ],
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
      description: "Kostenlose Demo verfügbar – kein Kreditkarte erforderlich",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "12",
      bestRating: "5",
    },
    screenshot: `${BASE_URL}/og-image.png`,
    creator: {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
      name: "Avaimo",
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function WebSiteSchema({ lang = "de" }: { lang?: string }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE_URL}/#website`,
    name: "Avaimo",
    url: BASE_URL,
    description:
      "Die Vereinsplattform für Buchung, Mitglieder und Finanzen.",
    publisher: {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/${lang}/demo`,
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: ["de", "it", "en"],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function FAQSchema({ lang = "de" }: { lang?: string }) {
  const faqData: Record<string, Array<{ q: string; a: string }>> = {
    de: [
      {
        q: "Was ist Avaimo?",
        a: "Avaimo ist eine All-in-One-Vereinsplattform für Sportvereine (Tennis, Padel, Squash). Sie vereint Buchungsverwaltung, Mitgliederverwaltung, Zahlungen, digitale Verträge und Trainer-Management in einem System.",
      },
      {
        q: "Ist Avaimo DSGVO-konform?",
        a: "Ja. Alle Daten werden in der EU gespeichert (Supabase EU Region – Frankfurt). Avaimo ist vollständig DSGVO-konform inklusive Recht auf Datenlöschung.",
      },
      {
        q: "Wie lange dauert die Einrichtung?",
        a: "Die meisten Vereine sind in unter 48 Stunden betriebsbereit. Club anlegen, Plätze konfigurieren, Mitglieder einladen – fertig.",
      },
      {
        q: "Welche Zahlungsmethoden unterstützt Avaimo?",
        a: "Avaimo unterstützt Stripe (Kredit- und Debitkarte, SEPA-Lastschrift), Barzahlung und Mitgliedschafts-Abonnements.",
      },
      {
        q: "Gibt es eine kostenlose Demo?",
        a: "Ja, unter avaimo.com/de/demo ist eine vollständige interaktive Demo verfügbar – ohne Registrierung oder Kreditkarte.",
      },
      {
        q: "Für welche Sportarten ist Avaimo geeignet?",
        a: "Primär für Tennis und Padel, aber geeignet für alle Sportvereine mit Platzbuchungen: Squash, Badminton, Fitness, Volleyball etc.",
      },
    ],
    it: [
      {
        q: "Cos'è Avaimo?",
        a: "Avaimo è una piattaforma all-in-one per la gestione dei club sportivi: prenotazioni, soci, pagamenti, contratti digitali e gestione istruttori.",
      },
      {
        q: "Avaimo è conforme al GDPR?",
        a: "Sì. Tutti i dati sono conservati nell'UE (Supabase EU Region – Francoforte). Avaimo è pienamente conforme al GDPR.",
      },
    ],
    en: [
      {
        q: "What is Avaimo?",
        a: "Avaimo is an all-in-one sports club management platform: bookings, members, payments, digital contracts, and trainer management in one system.",
      },
      {
        q: "Is Avaimo GDPR compliant?",
        a: "Yes. All data is stored in the EU (Supabase EU Region – Frankfurt). Avaimo is fully GDPR compliant.",
      },
    ],
  }

  const faqs = faqData[lang] || faqData.de

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function BreadcrumbSchema({
  items,
}: {
  items: Array<{ name: string; url: string }>
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
