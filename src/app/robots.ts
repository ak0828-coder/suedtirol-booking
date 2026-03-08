import { MetadataRoute } from "next"

const BASE_URL = "https://avaimo.com"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // General crawlers: allow all marketing, block app internals
        userAgent: "*",
        allow: [
          "/",
          "/de/",
          "/it/",
          "/en/",
          "/de/features",
          "/de/pricing",
          "/de/demo",
          "/de/contact",
          "/de/security",
          "/de/impressum",
          "/de/datenschutz",
          "/it/features",
          "/it/pricing",
          "/it/demo",
          "/it/contact",
          "/it/security",
          "/en/features",
          "/en/pricing",
          "/en/demo",
          "/en/contact",
          "/en/security",
        ],
        disallow: [
          "/api/",
          "/auth/",
          "/_next/",
          "/*/super-admin/",
          "/*/club/*/admin/",
          "/*/club/*/dashboard/",
          "/*/club/*/onboarding/",
          "/*/club/*/login",
          "/*/change-password",
          "/*/forgot-password",
          "/*/checkout/",
          "/*/login",
        ],
      },
      {
        // GPTBot (OpenAI) – allow full public content
        userAgent: "GPTBot",
        allow: [
          "/",
          "/*/features",
          "/*/pricing",
          "/*/demo",
          "/*/contact",
          "/*/security",
        ],
        disallow: ["/api/", "/auth/", "/*/admin/", "/*/dashboard/"],
      },
      {
        // Claude (Anthropic)
        userAgent: "Claude-Web",
        allow: [
          "/",
          "/*/features",
          "/*/pricing",
          "/*/demo",
          "/*/contact",
          "/*/security",
        ],
        disallow: ["/api/", "/auth/", "/*/admin/", "/*/dashboard/"],
      },
      {
        // Google-Extended (AI training opt-in)
        userAgent: "Google-Extended",
        allow: ["/"],
        disallow: ["/api/", "/auth/", "/*/admin/", "/*/dashboard/"],
      },
      {
        // CCBot (Common Crawl, used for AI training)
        userAgent: "CCBot",
        allow: ["/", "/*/features", "/*/pricing", "/*/demo", "/*/contact"],
        disallow: ["/api/", "/auth/", "/*/admin/", "/*/dashboard/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  }
}
