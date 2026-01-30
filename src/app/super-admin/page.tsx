import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { NewClubForm } from "@/components/admin/new-club-form" // Die bauen wir gleich
import { Building2, TrendingUp, Users } from "lucide-react"

export default async function SuperAdminPage() {
  const supabase = await createClient()

  // 1. Sicherheit: Nur DU darfst rein
  const { data: { user } } = await supabase.auth.getUser()
  
  // ERSETZE DAS MIT DEINER ECHTEN LOGIN-EMAIL!
  const MY_SUPER_EMAIL = "alexander.kofler06@gmail.com" 

  if (!user || user.email !== MY_SUPER_EMAIL) {
    return redirect("/login") // Wer nicht du ist, fliegt raus
  }

  // 2. Daten laden: Wie viele Vereine & Umsatz haben wir?
  const { data: clubs } = await supabase.from('clubs').select('*')
  const { count: bookingsCount } = await supabase.from('bookings').select('*', { count: 'exact', head: true })

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <h1 className="text-3xl font-bold mb-8">👑 Super Admin Dashboard</h1>
      
      {/* STATISTIKEN */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
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
                <CardTitle className="text-sm font-medium">Aktiver User</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-xs text-muted-foreground">{user.email}</div>
            </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* LISTE DER VEREINE */}
        <Card>
          <CardHeader>
            <CardTitle>Bestehende Vereine</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {clubs?.map(club => (
                <div key={club.id} className="flex justify-between items-center p-3 bg-white border rounded-lg">
                  <div>
                    <div className="font-bold">{club.name}</div>
                    <div className="text-xs text-slate-500">/club/{club.slug}</div>
                  </div>
                  <a href={`/club/${club.slug}`} target="_blank" className="text-blue-600 text-sm hover:underline">
                    Öffnen ↗
                  </a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* NEUEN VEREIN ANLEGEN */}
        <Card>
          <CardHeader>
             <CardTitle>Neuen Verein anlegen</CardTitle>
          </CardHeader>
          <CardContent>
             <NewClubForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}