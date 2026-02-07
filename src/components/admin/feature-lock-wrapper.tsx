import { Lock } from "lucide-react"
import { cn } from "@/lib/utils"

export function FeatureLockWrapper({
  locked,
  children,
  className,
}: {
  locked: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("relative", className)}>
      <div className={cn(locked ? "pointer-events-none select-none blur-[1.5px] opacity-70" : null)}>
        {children}
      </div>
      {locked ? (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl border border-slate-200/70 bg-white/70 backdrop-blur-sm">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-sm">
            <Lock className="h-4 w-4" />
            Gesperrt - Upgrade erforderlich
          </div>
        </div>
      ) : null}
    </div>
  )
}
