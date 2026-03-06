"use client"

import { useState } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { updateUserPassword } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

export default function ChangePasswordPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const lang = typeof params?.lang === "string" ? params.lang : "de"

  const afterRaw = searchParams?.get("after") || ""
  const afterUrl = afterRaw.startsWith("/") && !afterRaw.startsWith("//") ? afterRaw : null

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const strength = (() => {
    if (password.length === 0) return 0
    let s = 0
    if (password.length >= 8) s++
    if (/[A-Z]/.test(password)) s++
    if (/[0-9]/.test(password)) s++
    if (/[^A-Za-z0-9]/.test(password)) s++
    return s
  })()
  const strengthLabel = ["", "Schwach", "Mittel", "Gut", "Stark"][strength]
  const strengthColor = ["", "bg-red-400", "bg-amber-400", "bg-blue-400", "bg-green-500"][strength]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password.length < 8) {
      toast.warning("Passwort muss mindestens 8 Zeichen haben.")
      return
    }
    if (password !== confirm) {
      toast.error("Die Passwörter stimmen nicht überein.")
      return
    }

    setIsLoading(true)
    const res = await updateUserPassword(password)

    if (res.success) {
      toast.success("Passwort erfolgreich gesetzt!")
      router.refresh()
      if (afterUrl) {
        router.push(afterUrl)
      } else {
        router.push(`/${lang}`)
      }
    } else {
      toast.error("Fehler: " + res.error)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7] p-4">
      <Card className="w-full max-w-md rounded-3xl border border-slate-200/60 bg-white shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle>Passwort festlegen</CardTitle>
          <CardDescription>
            Wähle ein sicheres Passwort für deinen Account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="password">Neues Passwort</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Mindestens 8 Zeichen"
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  onClick={() => setShowPw((v) => !v)}
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Strength bar */}
              {password.length > 0 && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${i <= strength ? strengthColor : "bg-slate-100"}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">{strengthLabel}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm">Passwort bestätigen</Label>
              <div className="relative">
                <Input
                  id="confirm"
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  placeholder="Passwort wiederholen"
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  onClick={() => setShowConfirm((v) => !v)}
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirm.length > 0 && password === confirm && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Passwörter stimmen überein
                </p>
              )}
              {confirm.length > 0 && password !== confirm && (
                <p className="text-xs text-red-500">Passwörter stimmen nicht überein</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full rounded-full"
              disabled={isLoading || password !== confirm || password.length < 8}
            >
              {isLoading ? (
                <Loader2 className="animate-spin mr-2" />
              ) : (
                "Passwort speichern"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
