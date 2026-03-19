"use client"

import Link from "next/link"
import { useParams, usePathname } from "next/navigation"
import { useI18n } from "@/components/i18n/locale-provider"
import { 
  LayoutDashboard, 
  CalendarPlus, 
  Globe, 
  Dumbbell, 
  User, 
  Trophy, 
  FileText,
  ChevronRight,
  LogOut,
  Zap
} from "lucide-react"
import { useRef, useState } from "react"
import { motion } from "motion/react"

export function MemberSidebar({ slug }: { slug: string }) {
  const params = useParams()
  const pathname = usePathname()
  const lang = typeof params?.lang === "string" ? params.lang : "de"
  const { t } = useI18n()

  const items = [
    { id: "dashboard", label: "Dashboard", href: `/${lang}/club/${slug}/dashboard`, icon: LayoutDashboard },
    { id: "book", label: "Platz buchen", href: `/${lang}/club/${slug}/dashboard/book`, icon: CalendarPlus },
    { id: "training", label: "Training", href: `/${lang}/club/${slug}/dashboard/training`, icon: Dumbbell },
    { id: "leaderboard", label: "Leaderboard", href: `/${lang}/club/${slug}/dashboard/leaderboard`, icon: Trophy },
    { id: "documents", label: "Dokumente", href: `/${lang}/club/${slug}/dashboard/documents`, icon: FileText },
    { id: "settings", label: "Einstellungen", href: `/${lang}/club/${slug}/dashboard/settings`, icon: User },
  ] as const

  return (
    <aside className="hidden md:flex flex-col w-72 h-screen sticky top-0 border-r border-white/5 bg-[#030504] p-6 z-50">
      {/* Brand / Logo */}
      <div className="mb-12 px-2">
        <Link href={`/${lang}/club/${slug}`} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
             <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#CBBF9A] to-[#8A7B4D]" />
          </div>
          <span className="text-xl font-black tracking-tighter text-white">AVAÍMO</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-4 px-2">Kommandozentrale</p>
        {items.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all group ${
                isActive 
                  ? 'bg-[#CBBF9A] text-[#030504]' 
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#030504]' : 'text-white/20 group-hover:text-[#CBBF9A] transition-colors'}`} />
                <span className="text-sm font-bold">{item.label}</span>
              </div>
              {isActive && (
                <motion.div layoutId="active-pill" className="w-1.5 h-1.5 rounded-full bg-[#030504]" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="pt-6 border-t border-white/5 space-y-4">
         <div className="px-4 py-4 rounded-2xl bg-white/5 border border-white/5 group hover:bg-white/[0.08] transition-all">
            <div className="flex items-center gap-3 mb-1">
               <Zap className="w-4 h-4 text-[#CBBF9A]" />
               <span className="text-xs font-bold text-white">Premium Account</span>
            </div>
            <p className="text-[10px] text-white/30 font-medium">Alle Vorteile aktiv</p>
         </div>
         
         <Link href="/" className="flex items-center gap-3 px-4 py-2 text-white/20 hover:text-red-400 transition-colors group">
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-bold">Abmelden</span>
         </Link>
      </div>
    </aside>
  )
}
