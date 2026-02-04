export type ClubContent = {
  hero: {
    title: string
    subtitle: string
    primaryCtaText: string
    secondaryCtaText: string
    memberBadgeText: string
  }
  badges: {
    locationText: string
    statusText: string
  }
  overview: {
    title: string
    labelCourts: string
    labelFromPrice: string
    labelStatus: string
  }
  sections: {
    courts: {
      title: string
      subtitle: string
    }
    membership: {
      title: string
      subtitle: string
      ctaLabel: string
    }
  }
  footer: {
    impressumLinkText: string
    smallText: string
  }
  impressum: {
    title: string
    body: string
  }
  seo: {
    description: string
  }
}

export const defaultClubContent: ClubContent = {
  hero: {
    title: "",
    subtitle: "Buche deinen Platz in Sekunden. Klar, schnell und ohne Umwege.",
    primaryCtaText: "Jetzt buchen",
    secondaryCtaText: "Mitglied werden",
    memberBadgeText: "Mitglied aktiv",
  },
  badges: {
    locationText: "Südtirol",
    statusText: "Heute geöffnet",
  },
  overview: {
    title: "Club Überblick",
    labelCourts: "Plätze",
    labelFromPrice: "Ab Preis",
    labelStatus: "Status",
  },
  sections: {
    courts: {
      title: "Unsere Plätze",
      subtitle: "Wähle Platz und Uhrzeit – fertig.",
    },
    membership: {
      title: "Werde Mitglied",
      subtitle: "Hol dir Vorteile und spare bei jeder Buchung.",
      ctaLabel: "Jetzt wählen",
    },
  },
  footer: {
    impressumLinkText: "Impressum",
    smallText: "© Südtirol Booking",
  },
  impressum: {
    title: "Impressum",
    body: "",
  },
  seo: {
    description: "",
  },
}

export function mergeClubContent(input: Partial<ClubContent> | null | undefined): ClubContent {
  const safe = input ?? {}
  return {
    hero: { ...defaultClubContent.hero, ...(safe.hero ?? {}) },
    badges: { ...defaultClubContent.badges, ...(safe.badges ?? {}) },
    overview: { ...defaultClubContent.overview, ...(safe.overview ?? {}) },
    sections: {
      courts: { ...defaultClubContent.sections.courts, ...(safe.sections?.courts ?? {}) },
      membership: { ...defaultClubContent.sections.membership, ...(safe.sections?.membership ?? {}) },
    },
    footer: { ...defaultClubContent.footer, ...(safe.footer ?? {}) },
    impressum: { ...defaultClubContent.impressum, ...(safe.impressum ?? {}) },
    seo: { ...defaultClubContent.seo, ...(safe.seo ?? {}) },
  }
}

export function applyClubDefaults(content: ClubContent, clubName: string): ClubContent {
  return {
    ...content,
    hero: {
      ...content.hero,
      title: content.hero.title || clubName,
    },
  }
}
