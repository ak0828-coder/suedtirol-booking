import { createClient } from "@/lib/supabase/server" 
import { notFound } from "next/navigation"
import { CalendarDays, MapPin, Check } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { BookingModal } from "@/components/booking-modal"
import { ModeToggle } from "@/components/mode-toggle"

// Helper, um Daten zu holen
async function getClubData(slug: string) {
  const supabase = await createClient() 
  
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
    .order('name')

  return { club, courts }
}

export default async function ClubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await getClubData(slug)

  if (!data) return notFound()

  const { club, courts } = data

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
      {/* HEADER */}
      <div className="bg-white dark:bg-slate-900 border-b dark:border-slate-800 pb-6 pt-10 px-4 shadow-sm relative transition-colors duration-300">
        
        <div className="absolute top-4 right-4">
           <ModeToggle />
        </div>

        <div className="max-w-md mx-auto text-center flex flex-col items-center">
          
          {/* --- LOGO LOGIK --- */}
          <div 
            className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg overflow-hidden border-4 border-white dark:border-slate-800"
            style={{ backgroundColor: club.primary_color || '#e11d48' }}
          >
            {club.logo_url ? (
                // Wenn Logo da ist -> Bild anzeigen
                <img 
                    src={club.logo_url} 
                    alt={club.name} 
                    className="w-full h-full object-cover"
                />
            ) : (
                // Sonst -> Initialen anzeigen
                <span>{club.name.substring(0, 2).toUpperCase()}</span>
            )}
          </div>
          {/* ------------------ */}

          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{club.name}</h1>
          
          <div className="flex items-center justify-center text-slate-500 dark:text-slate-400 mt-2 text-sm">
            <MapPin className="w-4 h-4 mr-1" />
            <span>Südtirol</span>
          </div>
        </div>
      </div>

      {/* PLÄTZE LISTE */}
      <div className="max-w-md mx-auto px-4 mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Unsere Plätze</h2>
          <span className="text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded-full flex items-center gap-1">
            <Check className="w-3 h-3" /> Heute geöffnet
          </span>
        </div>

        <div className="space-y-6">
          {courts?.map((court: any) => {
            
            const duration = court.duration_minutes || 60 

            return (
              <Card key={court.id} className="overflow-hidden border-none shadow-md dark:bg-slate-900">
                <CardContent className="p-0">
                  <div className="flex flex-col">
                    
                    {/* Header des Platzes */}
                    <div className="flex p-5">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center mr-4 shadow-inner">
                        <CalendarDays className="w-8 h-8 text-slate-500 dark:text-slate-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">{court.name}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">{court.sport_type || 'Tennis'}</p>
                            </div>
                            <div className="text-right">
                                <span className="block font-bold text-slate-900 dark:text-slate-100">{court.price_per_hour}€</span>
                                <span className="text-xs text-slate-400">/ {duration} Min</span>
                            </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Footer mit Button */}
                    <div className="px-5 pb-5">
                        <BookingModal 
                            courtId={court.id}
                            courtName={court.name} 
                            price={court.price_per_hour} 
                            clubSlug={club.slug}
                            durationMinutes={duration}
                            startHour={court.start_hour} // NEU: Aus DB
                            endHour={court.end_hour}     // NEU: Aus DB
                        />
                    </div>

                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}