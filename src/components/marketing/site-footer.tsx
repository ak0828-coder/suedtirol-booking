import Link from "next/link"

const footerLinks = [
  { href: "/features", label: "Funktionen" },
  { href: "/pricing", label: "Preise" },
  { href: "/security", label: "Sicherheit" },
  { href: "/contact", label: "Kontakt" },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200/60 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-10 md:flex-row">
        <div className="space-y-2">
          <div className="text-sm font-semibold">Avaimo</div>
          <div className="text-xs text-slate-500">
            Vereinsplattform für Buchung, Mitglieder und Finanzen.
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
          {footerLinks.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-slate-700">
              {item.label}
            </Link>
          ))}
          <Link href="/impressum" className="hover:text-slate-700">
            Impressum
          </Link>
          <Link href="/datenschutz" className="hover:text-slate-700">
            Datenschutz
          </Link>
        </div>
      </div>
    </footer>
  )
}

