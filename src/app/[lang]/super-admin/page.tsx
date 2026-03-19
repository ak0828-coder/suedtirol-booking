"use client"

import { createClient } from "@/lib/supabase/client"
import { notFound, redirect, useParams } from "next/navigation"
import { NewClubForm } from "@/components/admin/new-club-form"
import { EditClubDialog } from "@/components/admin/edit-club-dialog"
import { Building2, TrendingUp, Users, ExternalLink, ShieldCheck, Zap, Plus, Globe, Settings, LogOut, Loader2, Trash2, Search } from "lucide-react" 
import { DeleteClubButton } from "@/components/admin/delete-club-button" 
import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"
import Link from "next/link"

// --- Reusable Premium Components ---

function SpotlightCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const divRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return
    const div = divRef.current
    const rect = div.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    div.style.setProperty("--mouse-x", `${x}px`)
    div.style.setProperty("--mouse-y", `${y}px`)
  }

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      className={`relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.02] group/spotlight ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover/spotlight:opacity-100"
        style={{
          background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(203,191,154,0.1), transparent 40%)`,
        }}
      />
      {children}
    </div>
  )
}

export default function SuperAdminPage() {
  const params = useParams()
  const lang = (params?.lang as string) || "de"
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [clubs, setClubs] = useState<any[]>([])
  const [bookingsCount, setBookingsCount] = useState(0)
  const [search, setSearch] = useState("")

  useEffect(() => {
    async function load() {
      const { data: { user: u } } = await supabase.auth.getUser()
      if (!u) {
        window.location.href = `/${lang}/login`
        return
      }
      
      // In a real scenario, the email check happens server-side. 
      // Here we assume client-side check for UI visibility after initial guard.
      setUser(u)

      const [{ data: clubsData }, { count: bCount }] = await Promise.all([
        supabase.from('clubs').select('*').order('created_at', { ascending: false }),
        supabase.from('bookings').select('*', { count: 'exact', head: true })
      ])

      setClubs(clubsData || [])
      setBookingsCount(bCount || 0)
      setLoading(false)
    }
    load()
  }, [lang])

  if (loading) return (
    <div className="min-h-screen bg-[#030504] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
    </div>
  )

  const filteredClubs = clubs.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="min-h-screen bg-[#030504] text-[#F9F8F4] selection:bg-[#CBBF9A] selection:text-[#030504] flex">
      
      {/* SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-72 h-screen sticky top-0 border-r border-white/5 bg-[#030504] p-6 z-50">
        <div className="mb-12 px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
               <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#CBBF9A] to-[#8A7B4D]" />
            </div>
            <span className="text-xl font-black tracking-tighter text-white">SYSTEM</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-4 px-2">Global Admin</p>
          <Link href={`/${lang}/super-admin`} className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#CBBF9A] text-[#030504] font-bold shadow-xl shadow-[#CBBF9A]/10">
             <Building2 className="w-5 h-5" /> <span>Clubs</span>
          </Link>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-white/40 hover:text-white hover:bg-white/5 transition-all font-bold">
             <Settings className="w-5 h-5 text-white/20" /> <span>System-Log</span>
          </button>
        </nav>

        <div className="pt-6 border-t border-white/5 space-y-4">
           <div className="px-4 py-4 rounded-2xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-3 mb-1">
                 <ShieldCheck className="w-4 h-4 text-[#CBBF9A]" />
                 <span className="text-xs font-bold text-white">Super Admin</span>
              </div>
              <p className="text-[10px] text-white/30 font-medium truncate">{user?.email}</p>
           </div>
           <button onClick={() => supabase.auth.signOut().then(() => window.location.href='/')} className="w-full flex items-center gap-3 px-4 py-2 text-white/20 hover:text-red-400 transition-colors font-bold group">
              <LogOut className="w-4 h-4" /> <span>Abmelden</span>
           </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 min-w-0 pb-32 relative">
        {/* Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[400px] bg-[#CBBF9A]/5 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-6xl mx-auto px-6 lg:px-12 pt-12 space-y-12 relative z-10">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
             <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 text-[10px] font-bold uppercase tracking-widest text-[#34D399] mb-4">
                   <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" /> System Online
                </div>
                <h1 className="text-4xl lg:text-6xl font-black tracking-tighter leading-none">Club Management</h1>
             </div>
             <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#CBBF9A] transition-colors" />
                <input 
                  type="text" 
                  placeholder="Verein suchen..." 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="h-14 w-full md:w-80 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-white placeholder:text-white/20 outline-none focus:border-[#CBBF9A]/40 focus:ring-4 focus:ring-[#CBBF9A]/5 transition-all"
                />
             </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <SpotlightCard className="p-8">
                <div className="flex justify-between items-start mb-4">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Vereine Total</p>
                   <Building2 className="w-5 h-5 text-[#CBBF9A]" />
                </div>
                <p className="text-5xl font-black text-white">{clubs.length}</p>
                <div className="mt-4 h-1 w-12 bg-[#CBBF9A] rounded-full" />
             </SpotlightCard>
             <SpotlightCard className="p-8">
                <div className="flex justify-between items-start mb-4">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Buchungen Gesamt</p>
                   <TrendingUp className="w-5 h-5 text-blue-400" />
                </div>
                <p className="text-5xl font-black text-white">{bookingsCount}</p>
                <div className="mt-4 h-1 w-12 bg-blue-400 rounded-full" />
             </SpotlightCard>
             <SpotlightCard className="p-8 bg-[#10B981]/5 border-[#10B981]/20">
                <div className="flex justify-between items-start mb-4">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#34D399]">Server Status</p>
                   <Zap className="w-5 h-5 text-[#34D399]" fill="currentColor" />
                </div>
                <p className="text-4xl font-black text-white">Störungsfrei</p>
                <p className="mt-4 text-[10px] font-bold text-[#34D399] uppercase tracking-widest">Alle Systeme nominal</p>
             </SpotlightCard>
          </div>

          <div className="grid lg:grid-cols-3 gap-12 items-start">
             {/* CLUB LIST */}
             <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center gap-3 px-2">
                   <Users className="w-5 h-5 text-white/20" />
                   <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/20">Aktive Instanzen</h3>
                </div>
                <div className="space-y-4">
                   {filteredClubs.map(club => (
                     <SpotlightCard key={club.id} className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                           <div className="flex items-center gap-5">
                              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-2xl ring-1 ring-white/10 overflow-hidden" style={{ backgroundColor: club.primary_color || '#1F3D2B' }}>
                                 {club.logo_url ? <img src={club.logo_url} alt="Logo" className="w-full h-full object-cover" /> : club.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                 <h4 className="text-xl font-bold text-white group-hover/spotlight:text-[#CBBF9A] transition-colors">{club.name}</h4>
                                 <p className="text-xs font-mono text-white/20">/club/{club.slug}</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-2">
                              <a href={`/club/${club.slug}`} target="_blank" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all text-white/40 hover:text-white" title="Öffentliche Seite">
                                 <ExternalLink className="w-4 h-4" />
                              </a>
                              <a href={`/club/${club.slug}/admin`} target="_blank" className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/60 hover:bg-white/10 transition-all">Admin</a>
                              <Link href={`/super-admin/club/${club.slug}`} className="px-4 py-2 rounded-xl bg-[#CBBF9A]/10 border border-[#CBBF9A]/20 text-[10px] font-black uppercase tracking-widest text-[#CBBF9A] hover:bg-[#CBBF9A]/20 transition-all">Features</Link>
                              <div className="flex items-center gap-2 ml-4">
                                 <EditClubDialog club={club} />
                                 <DeleteClubButton clubId={club.id} />
                              </div>
                           </div>
                        </div>
                     </SpotlightCard>
                   ))}
                   {filteredClubs.length === 0 && (
                     <div className="py-20 text-center rounded-[2rem] border-2 border-dashed border-white/5">
                        <Building2 className="w-12 h-12 text-white/10 mx-auto mb-4" />
                        <p className="text-white/20 font-medium">Keine Vereine gefunden.</p>
                     </div>
                   )}
                </div>
             </div>

             {/* SIDEBAR: ACTIONS */}
             <div className="space-y-8">
                <div className="flex items-center gap-3 px-2">
                   <Plus className="w-5 h-5 text-white/20" />
                   <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/20">Provisioning</h3>
                </div>
                <SpotlightCard className="p-8 bg-[#CBBF9A] border-none text-[#030504]">
                   <h4 className="text-2xl font-black tracking-tight mb-2">Neuer Verein</h4>
                   <p className="text-sm font-bold text-[#030504]/60 mb-8 leading-relaxed">Erstelle eine neue Club-Instanz und konfiguriere die Basis-Einstellungen.</p>
                   <div className="bg-[#030504] p-6 rounded-[1.5rem] shadow-2xl border border-black/10">
                      <NewClubForm />
                   </div>
                </SpotlightCard>

                <SpotlightCard className="p-8">
                   <Globe className="w-10 h-10 text-white/10 mb-6" />
                   <h4 className="text-lg font-bold text-white mb-2">Globale Reichweite</h4>
                   <p className="text-xs text-white/40 leading-relaxed">Das System unterstützt aktuell 3 Sprachen und automatische Zeitzonen-Erkennung für alle Buchungen.</p>
                </SpotlightCard>
             </div>
          </div>
        </div>
      </main>
    </div>
  )
}
