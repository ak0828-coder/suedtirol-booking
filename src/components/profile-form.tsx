"use client"

import { useState } from "react"
import { updateProfile } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { toast } from "sonner" // Falls du sonner hast, sonst alert() oder einfachen Text

export function ProfileForm({ initialData }: { initialData: any }) {
    const [loading, setLoading] = useState(false)

    async function onSubmit(formData: FormData) {
        setLoading(true)
        const res = await updateProfile(formData)
        setLoading(false)

        if(res.success) {
            alert("Profil aktualisiert!") // Oder schöner Toast
        } else {
            alert("Fehler: " + res.error)
        }
    }

    return (
        <form action={onSubmit} className="space-y-4 max-w-lg">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="firstName">Vorname</Label>
                    <Input name="firstName" defaultValue={initialData?.first_name || ""} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="lastName">Nachname</Label>
                    <Input name="lastName" defaultValue={initialData?.last_name || ""} required />
                </div>
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="phone">Telefonnummer (für Rückfragen)</Label>
                <Input name="phone" type="tel" defaultValue={initialData?.phone || ""} />
            </div>

            <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Speichern
            </Button>
        </form>
    )
}