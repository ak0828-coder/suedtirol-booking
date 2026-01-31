import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { NewClubForm } from "@/components/admin/new-club-form"
import { EditClubDialog } from "@/components/admin/edit-club-dialog"
import { Building2, TrendingUp, Users, ExternalLink } from "lucide-react" 
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { DeleteClubButton } from "@/components/admin/delete-club-button" 

export default async function SuperAdminPage() {
  const supabase = await createClient()

  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser()
  
  // Env Variable nutzen (falls gesetzt), sonst Fallback
  const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || "alexander.kofler06@gmail.com" 

  if (!user || user.email?.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
    return redirect("/login")
  }

  // 2. Daten laden
  const { data: clubs } = await supabase.from('clubs').select('*').order('created_at', { ascending: false })
  const { count: bookingsCount } = await supabase.from('bookings').select('*', { count: 'exact', head: true })

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center">
             <h1 className="text-3xl font-bold text-slate-900">👑 Super Admin</h1>
             <span className="text-sm text-slate-500 bg-white px-3 py-1 rounded-full border shadow-sm">
                Eingeloggt als: {user.email}
             </span>
        </div>
      
        {/* STATISTIKEN */}
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Vereine Total</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{clubs?.length || 0}</div>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Buchungen Gesamt</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{bookingsCount || 0}</div>
            </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">System Status</CardTitle>
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">Online</div>
                </CardContent>
            </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
            
            {/* LINKE SPALTE: LISTE DER VEREINE */}
            <div className="lg:col-span-2">
                <Card className="h-full">
                <CardHeader>
                    <CardTitle>Vereine verwalten</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                    {clubs?.map(club => (
                        <div key={club.id} className="flex justify-between items-center p-4 bg-white border border-slate-100 rounded-xl hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                {/* Logo / Farbindikator */}
                                <div 
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm overflow-hidden"
                                    style={{ backgroundColor: club.primary_color || '#0f172a' }}
                                >
                                    {club.logo_url ? (
                                        <img src={club.logo_url} alt="Logo" className="w-full h-full object-cover" />
                                    ) : (
                                        club.name.substring(0, 2).toUpperCase()
                                    )}
                                </div>
                                
                                <div>
                                    <div className="font-bold text-slate-900">{club.name}</div>
                                    <div className="text-xs text-slate-500 font-mono">/club/{club.slug}</div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                {/* Link zur Seite */}
                                <a 
                                    href={`/club/${club.slug}`} 
                                    target="_blank" 
                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                    title="Öffentliche Seite"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </a>

                                {/* Link zum Admin Panel */}
                                <a 
                                    href={`/club/${club.slug}/admin`} 
                                    target="_blank"
                                    className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                                >
                                    Login als Admin
                                </a>

                                {/* BEARBEITEN BUTTON */}
                                <EditClubDialog club={club} />

                                {/* LÖSCHEN BUTTON (NEU) */}
                                <DeleteClubButton clubId={club.id} />
                            </div>
                        </div>
                    ))}
                    {clubs?.length === 0 && (
                        <div className="text-center py-10 text-slate-400 border-2 border-dashed rounded-xl">
                            Noch keine Vereine angelegt.
                        </div>
                    )}
                    </div>
                </CardContent>
                </Card>
            </div>

            {/* RECHTE SPALTE: NEU ERSTELLEN */}
            <div>
                <Card className="sticky top-8 border-slate-200 shadow-sm bg-slate-900 text-white">
                <CardHeader>
                    <CardTitle className="text-white">Neuen Verein onboarden</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="bg-white p-4 rounded-lg text-slate-900">
                        <NewClubForm />
                    </div>
                </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </div>
  )
}