"use client"

import { useTransition, useState } from "react"
import { updateProfile } from "@/app/actions"
import { useI18n } from "@/components/i18n/locale-provider"
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"

export function ProfileForm({ profile }: { profile: any }) {
  const [pending, startTransition] = useTransition()
  const [status, setStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const { t } = useI18n()

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus(null)
    const formData = new FormData(event.currentTarget)
    startTransition(async () => {
      const res = await updateProfile(formData)
      if (res?.success) {
        setStatus({ type: 'success', text: t("profile.saved") })
      } else {
        setStatus({ type: 'error', text: res?.error || t("profile.error") })
      }
    })
  }

  const inputClasses = "w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-white/20 outline-none focus:border-[#CBBF9A]/40 focus:ring-4 focus:ring-[#CBBF9A]/5 transition-all text-sm"
  const labelClasses = "text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2 block px-1"

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid gap-6">
        <div>
          <label htmlFor="first_name" className={labelClasses}>{t("profile.first_name")}</label>
          <input id="first_name" name="first_name" defaultValue={profile.first_name || ""} className={inputClasses} />
        </div>
        <div>
          <label htmlFor="last_name" className={labelClasses}>{t("profile.last_name")}</label>
          <input id="last_name" name="last_name" defaultValue={profile.last_name || ""} className={inputClasses} />
        </div>
        <div>
          <label htmlFor="phone" className={labelClasses}>{t("profile.phone")}</label>
          <input id="phone" name="phone" defaultValue={profile.phone || ""} className={inputClasses} />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <button 
          type="submit" 
          disabled={pending}
          className="h-12 w-full bg-[#CBBF9A] text-[#030504] rounded-xl font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center disabled:opacity-50"
        >
          {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : t("profile.save")}
        </button>

        <AnimatePresence>
          {status && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0 }}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-medium ${
                status.type === 'success' ? 'bg-[#10B981]/10 text-[#34D399] border border-[#10B981]/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}
            >
              {status.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {status.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </form>
  )
}
