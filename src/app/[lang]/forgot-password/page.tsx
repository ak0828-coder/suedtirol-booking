"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { requestPasswordReset } from "@/app/actions"
import { Loader2, ArrowLeft, Mail } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useI18n } from "@/components/i18n/locale-provider"

export default function ForgotPasswordPage() {
  const params = useParams()
  const lang = typeof params?.lang === "string" ? params.lang : "de"
  const { t } = useI18n()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const res = await requestPasswordReset(email, lang)

    if (res.success) {
      setIsSuccess(true)
    } else {
      setError(res.error || t("auth.forgot.error", "Ein Fehler ist aufgetreten."))
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7] p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-lg border border-slate-200/60">
        <div className="mb-6">
          <Link
            href={`/${lang}/login`}
            className="text-sm text-slate-500 hover:text-slate-900 flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> {t("auth.forgot.back", "Zurück zum Login")}
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-2">{t("auth.forgot.title", "Passwort vergessen?")}</h1>
        <p className="text-slate-500 mb-6">
          {t("auth.forgot.subtitle", "Gib deine E-Mail ein. Wir senden dir einen Link, um ein neues Passwort zu setzen.")}
        </p>

        {isSuccess ? (
          <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg text-center">
            <Mail className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="font-medium">{t("auth.forgot.sent_title", "E-Mail gesendet!")}</p>
            <p className="text-sm mt-1">{t("auth.forgot.sent_subtitle", "Bitte prüfe deinen Posteingang (und Spam-Ordner).")}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder={t("auth.forgot.placeholder", "deine@email.com")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : t("auth.forgot.cta", "Link senden")}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
