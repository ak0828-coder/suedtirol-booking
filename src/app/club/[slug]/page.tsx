import { supabase } from "@/lib/supabase"
import { notFound } from "next/navigation"
import { CalendarDays, MapPin } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { BookingModal } from "@/components/booking-modal"

async function getClubData(slug: string) {
  const { data: club } = await supabase
    .from('clubs')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!club) return null

  const { data: courts } = await supabase
    .from('courts')
    .select('*')
    .eq('club_id', club.id)

  return { club, courts }
}

export default async function ClubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await getClubData(slug)

  if (!data) return notFound()

  const { club, courts } = data

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* HEADER */}
      <div className="bg-white border-b pb-6 pt-10 px-4 shadow-sm">
        <div className="max-w-md mx-auto text-center">
          <div 
            className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg"
            style={{ backgroundColor: club.primary_color || '#e11d48' }}
          >
            {club.name.substring(0, 2).toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{club.name}</h1>
          <div className="flex items-center justify-center text-slate-500 mt-2 text-sm">
            <MapPin className="w-4 h-4 mr-1" />
            <span>Südtirol</span>
          </div>
        </div>
      </div>

      {/* PLÄTZE LISTE */}
      <div className="max-w-md mx-auto px-4 mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Unsere Plätze</h2>
          <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded-full">
            Heute geöffnet
          </span>
        </div>

        <div className="space-y-4">
          {courts?.map((court: any) => (
            <Card key={court.id} className="overflow-hidden border-none shadow-md">
              <CardContent className="p-0">
                <div className="flex">
                  <div className="w-24 bg-slate-200 flex items-center justify-center">
                    <CalendarDays className="w-8 h-8 text-slate-400" />
                  </div>
                  
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900">{court.name}</h3>
                      <p className="text-sm text-slate-500 capitalize">{court.sport_type}</p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-sm font-semibold text-slate-900">
                        {court.price_per_hour}€ <span className="text-slate-400 font-normal">/ Std.</span>
                      </span>
                      
                      {/* HIER IST DAS AKTUALISIERTE MODAL */}
                      <BookingModal 
                        courtId={court.id}
                        courtName={court.name} 
                        price={court.price_per_hour} 
                        clubSlug={club.slug}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}