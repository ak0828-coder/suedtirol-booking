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
    <header className="relative z-20">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="text-lg font-semibold tracking-wide">
          Avaimo
        </Link>
        <nav className="hidden items-center gap-5 text-sm md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-slate-700 hover:text-slate-900">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/demo"
            className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-white"
          >
            Demo ansehen
          </Link>
          <Link href="/contact" className="rounded-full bg-slate-900 px-4 py-2 text-sm text-white">
            Demo anfragen
          </Link>
        </div>
      </div>
    </header>
  )
}
