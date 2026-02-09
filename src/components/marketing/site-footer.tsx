import Link from "next/link"

const footerLinks = [
  { href: "/features", label: "Funktionen" },
  { href: "/pricing", label: "Preise" },
  { href: "/security", label: "Sicherheit" },
  { href: "/contact", label: "Kontakt" },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-[#0E1A14]/10 bg-[#1F3D2B]">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-10 md:flex-row">
        <div className="space-y-2">
          <div className="text-sm font-semibold text-[#F9F8F4]">Avaimo</div>
          <div className="text-xs text-[#F9F8F4]/70">
            Vereinsplattform für Buchung, Mitglieder und Finanzen.
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs text-[#F9F8F4]/70">
          {footerLinks.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-[#F9F8F4]">
              {item.label}
            </Link>
          ))}
          <Link href="/impressum" className="hover:text-[#F9F8F4]">
            Impressum
          </Link>
          <Link href="/datenschutz" className="hover:text-[#F9F8F4]">
            Datenschutz
          </Link>
        </div>
      </div>
    </footer>
  )
}

