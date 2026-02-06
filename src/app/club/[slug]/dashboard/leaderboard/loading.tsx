export default function LeaderboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 pb-20">
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm">
          <div className="h-6 w-52 rounded bg-slate-200/70 anim-shimmer" />
          <div className="mt-3 h-4 w-40 rounded bg-slate-200/70 anim-shimmer" />
        </div>
        <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm">
          <div className="h-4 w-40 rounded bg-slate-200/70 anim-shimmer" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 rounded bg-slate-200/70 anim-shimmer" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
