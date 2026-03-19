"use client"

import { useState } from "react"
import { updateLeaderboardOptOut } from "@/app/actions"
import { useI18n } from "@/components/i18n/locale-provider"
import { CheckCircle2, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"

type MemberSettingsFormProps = {
  clubSlug: string
  initialOptOut: boolean
}

export function MemberSettingsForm({ clubSlug, initialOptOut }: MemberSettingsFormProps) {
  const [optOut, setOptOut] = useState(initialOptOut)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const { t } = useI18n()

  const handleToggle = async () => {
    setSaving(true)
    setStatus(null)
    const next = !optOut
    const res = await updateLeaderboardOptOut(clubSlug, next)
    if (res?.success) {
      setOptOut(next)
      setStatus({ 
        type: 'success', 
        text: next ? t("member_settings.opt_out_on") : t("member_settings.opt_out_off") 
      })
    } else {
      setStatus({ 
        type: 'error', 
        text: res?.error || t("member_settings.save_error") 
      })
    }
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-white/40 leading-relaxed">
        {t("member_settings.leaderboard_desc")}
      </p>
      
      <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${optOut ? 'bg-white/5 text-white/20' : 'bg-[#10B981]/10 text-[#34D399]'}`}>
            {optOut ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </div>
          <div>
            <div className="text-sm font-bold text-white">
              {t("member_settings.visibility")}
            </div>
            <div className={`text-[10px] font-bold uppercase tracking-widest ${optOut ? 'text-white/30' : 'text-[#34D399]'}`}>
              {optOut ? t("member_settings.hidden") : t("member_settings.visible")}
            </div>
          </div>
        </div>

        <button
          onClick={handleToggle}
          disabled={saving}
          className={`h-10 px-6 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center min-w-[120px] ${
            optOut 
              ? 'bg-white/10 text-white hover:bg-white/20' 
              : 'bg-[#10B981] text-[#030504] hover:scale-105 shadow-lg shadow-[#10B981]/10'
          }`}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (optOut ? t("member_settings.activate") : t("member_settings.deactivate"))}
        </button>
      </div>

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
  )
}
