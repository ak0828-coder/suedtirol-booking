import type { Metadata } from "next"
import { getWaitlistCount } from "./actions"
import BozenerClient from "./bozen-client"

export const metadata: Metadata = {
  title: "AVAÍMO Bozen Süd — Warteliste 2027",
  description: "Der erste vollautomatische 24/7 Premium Sportclub Südtirols. Padel · Pilates · Gym. Trage dich jetzt auf die Warteliste ein und sichere dir deinen Founder-Status.",
  openGraph: {
    title: "AVAÍMO Bozen Süd — Warteliste 2027",
    description: "Padel · Pilates · Gym. 24/7. App-Only. Jetzt Founder-Platz sichern.",
  },
}

export default async function BozePage() {
  const count = await getWaitlistCount()
  return <BozenerClient initialCount={count} />
}
