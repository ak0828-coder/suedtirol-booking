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
    <header className="sticky top-0 z-30 border-b border-white/60 bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight text-slate-900">
          Avaimo
        </Link>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-slate-600 hover:text-slate-900">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/demo"
            className="rounded-full border border-slate-300/80 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Demo ansehen
          </Link>
          <Link href="/contact" className="rounded-full bg-slate-900 px-4 py-2 text-sm text-white">
            Beratung
          </Link>
        </div>
      </div>
    </header>
  )
}
