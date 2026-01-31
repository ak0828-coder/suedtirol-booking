import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Calendar } from "lucide-react"

export default async function MemberDashboard({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect("/login")

  // 2. Member Status Check
  const { data: member } = await supabase
    .from('club_members')
    .select('*, clubs!inner(slug, name), membership_plans(name)')
    .eq('user_id', user.id)
    .eq('clubs.slug', slug)
    .single()

  if (!member) {
      // User ist eingeloggt, aber kein Mitglied -> Zurück zur Public Page
      return redirect(`/club/${slug}`)
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <header className="flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold">Hallo, Mitglied! 👋</h1>
                <p className="text-slate-500">Willkommen im Bereich von {member.clubs.name}</p>
            </div>
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                {member.membership_plans?.name || 'Aktiv'}
            </div>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
            <Card>
                <CardHeader><CardTitle className="flex gap-2"><Trophy className="text-yellow-500"/> Dein Rang</CardTitle></CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">Bronze 🥉</div>
                    <p className="text-sm text-slate-500 mt-2">Spiele 3 weitere Matches für Silber!</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle className="flex gap-2"><Calendar/> Nächste Buchung</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-slate-500 italic">Keine offenen Buchungen.</p>
                    {/* Hier könnte man die bookings queryn und anzeigen */}
                </CardContent>
            </Card>
        </div>

      </div>
    </div>
  )
}