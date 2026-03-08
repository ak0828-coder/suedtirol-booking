import { MetadataRoute } from "next"

const BASE_URL = "https://avaimo.com"
const locales = ["de", "it", "en"] as const

const pages = [
  { path: "",            priority: 1.0,  changeFreq: "weekly"  as const },
  { path: "/features",  priority: 0.9,  changeFreq: "monthly" as const },
  { path: "/pricing",   priority: 0.9,  changeFreq: "monthly" as const },
  { path: "/demo",      priority: 0.85, changeFreq: "monthly" as const },
  { path: "/contact",   priority: 0.8,  changeFreq: "monthly" as const },
  { path: "/security",  priority: 0.7,  changeFreq: "monthly" as const },
  { path: "/impressum", priority: 0.2,  changeFreq: "yearly"  as const },
  { path: "/datenschutz", priority: 0.2, changeFreq: "yearly" as const },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = []

  for (const page of pages) {
    // Canonical: default locale first
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}${page.path}`,
        lastModified: new Date(),
        changeFrequency: page.changeFreq,
        priority: page.priority,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [
              l === "de" ? "de-DE" : l === "it" ? "it-IT" : "en-US",
              `${BASE_URL}/${l}${page.path}`,
            ])
          ),
        },
      })
    }
  }

  return entries
}
