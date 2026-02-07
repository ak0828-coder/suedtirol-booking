"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { getUserRole } from "@/app/actions"
import { Loader2 } from "lucide-react"

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    async function checkUser() {
      // Wir fragen Supabase: Wer ist gerade da?
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        setIsLoading(false)
        return
      }

      const role = await getUserRole()
      if (role?.type === "super_admin") {
        setIsAuthorized(true)
      } else if (role?.type === "multi") {
        const isAdmin = (role.roles || []).some((r: any) => r.role === "club_admin")
        if (isAdmin) {
          setIsAuthorized(true)
        } else {
          router.push("/login")
        }
      } else {
        router.push("/login")
      }
      setIsLoading(false)
    }

    checkUser()
  }, [router])

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
