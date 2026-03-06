"use client"

import { useTransition, useState } from "react"
import { useRouter } from "next/navigation"
import { createBillingPortalSession, cancelMembershipAtPeriodEnd } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Loader2, ExternalLink } from "lucide-react"
import { toast } from "sonner"

export function BillingPortalButton({
  clubSlug,
  returnPath,
  hasStripeCustomer,
}: {
  clubSlug: string
  returnPath: string
  hasStripeCustomer: boolean
}) {
  const [pending, startTransition] = useTransition()

  const handleClick = () => {
    startTransition(async () => {
      const res = await createBillingPortalSession(clubSlug, returnPath)
      if (res?.url) {
        window.location.href = res.url
      } else {
        toast.error(res?.error || "Portal konnte nicht geöffnet werden.")
      }
    })
  }

  if (!hasStripeCustomer) return null

  return (
    <Button
      variant="outline"
      size="sm"
      className="rounded-full gap-2"
      onClick={handleClick}
      disabled={pending}
    >
      {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ExternalLink className="w-3.5 h-3.5" />}
      Abo verwalten
    </Button>
  )
}

export function CancelMembershipButton({ clubSlug }: { clubSlug: string }) {
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const handleCancel = () => {
    startTransition(async () => {
      const res = await cancelMembershipAtPeriodEnd(clubSlug)
      if (res?.success) {
        toast.success("Kündigung zum Ende der Laufzeit eingereicht.")
        router.refresh()
      } else {
        toast.error(res?.error || "Kündigung fehlgeschlagen.")
      }
    })
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="rounded-full text-slate-400 hover:text-red-600 text-xs">
          Kündigen
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Mitgliedschaft kündigen?</AlertDialogTitle>
          <AlertDialogDescription>
            Deine Mitgliedschaft bleibt bis zum Ende der aktuellen Laufzeit aktiv. Danach wird sie nicht verlängert.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancel}
            disabled={pending}
            className="bg-red-600 hover:bg-red-700"
          >
            {pending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Ja, kündigen
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
