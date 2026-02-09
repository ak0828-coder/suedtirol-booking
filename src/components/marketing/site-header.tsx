import Link from "next/link"

const navItems = [
  { href: "/features", label: "Funktionen" },
  { href: "/pricing", label: "Preise" },
  { href: "/demo", label: "Demo" },
  { href: "/security", label: "Sicherheit" },
  { href: "/contact", label: "Kontakt" },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-[#0E1A14]/10 bg-[#1F3D2B]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight text-[#F9F8F4]">
          Avaimo
        </Link>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-[#F9F8F4]/80 hover:text-[#F9F8F4]">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/demo"
            className="rounded-full border border-[#F9F8F4]/30 bg-transparent px-4 py-2 text-sm text-[#F9F8F4] hover:bg-[#F9F8F4]/10"
          >
            Demo ansehen
          </Link>
          <Link
            href="/contact"
            className="rounded-full bg-[#CBBF9A] px-4 py-2 text-sm text-[#0E1A14] hover:opacity-90"
          >
            Beratung
          </Link>
        </div>
      </div>
    </header>
  )
}
