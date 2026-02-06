"use client"

import { useTransition } from "react"
import { AlertTriangle, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { activateImportedMembers } from "@/app/actions"

export function ActivationBanner({
  importedCount,
  clubSlug,
}: {
  importedCount: number
  clubSlug: string
}) {
  const [isPending, startTransition] = useTransition()
  if (!importedCount) return null

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div>
          <h4 className="font-semibold text-amber-900">Migration bereit</h4>
          <p className="text-sm text-amber-700">
            {importedCount} importierte Mitglieder warten auf Einladung.
          </p>
        </div>
      </div>
      <Button
        className="rounded-full bg-amber-600 hover:bg-amber-700 text-white gap-2"
        onClick={() => startTransition(() => { void activateImportedMembers(clubSlug) })}
        disabled={isPending}
      >
        <Send className="h-4 w-4" /> {isPending ? "Sende Einladungen..." : "Verein aktivieren & alle einladen"}
      </Button>
    </div>
  )
}
