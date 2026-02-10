export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 pb-20">
      <div className="max-w-4xl mx-auto space-y-6 p-6">
        <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm">
          <div className="h-6 w-48 rounded bg-slate-200/70 anim-shimmer" />
          <div className="mt-3 h-4 w-64 rounded bg-slate-200/70 anim-shimmer" />
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm">
              <div className="h-4 w-32 rounded bg-slate-200/70 anim-shimmer" />
              <div className="mt-4 h-8 w-24 rounded bg-slate-200/70 anim-shimmer" />
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm">
          <div className="h-4 w-40 rounded bg-slate-200/70 anim-shimmer" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 rounded bg-slate-200/70 anim-shimmer" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
