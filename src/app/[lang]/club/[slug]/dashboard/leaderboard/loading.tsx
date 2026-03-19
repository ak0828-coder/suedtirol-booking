export default function LeaderboardLoading() {
  return (
    <div className="min-h-screen bg-[#030504] pb-20 overflow-hidden">
      <div className="max-w-5xl mx-auto space-y-8 p-6 pt-12">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div className="space-y-4">
            <div className="h-3 w-24 rounded-full bg-white/5 anim-shimmer" />
            <div className="h-10 w-48 rounded-2xl bg-white/5 anim-shimmer" />
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/5 anim-shimmer" />
        </div>

        <div className="grid lg:grid-cols-[0.8fr_1fr] gap-12 pt-8">
          <div className="space-y-8">
             <div className="h-4 w-32 rounded-full bg-white/5 anim-shimmer" />
             <div className="grid grid-cols-3 items-end gap-3 h-48">
                <div className="h-32 rounded-2xl bg-white/5 anim-shimmer" />
                <div className="h-40 rounded-2xl bg-white/5 anim-shimmer" />
                <div className="h-28 rounded-2xl bg-white/5 anim-shimmer" />
             </div>
             <div className="h-32 rounded-3xl bg-white/5 anim-shimmer" />
          </div>
          <div className="space-y-6">
             <div className="h-4 w-40 rounded-full bg-white/5 anim-shimmer" />
             <div className="h-[400px] rounded-[2.5rem] bg-white/5 border border-white/5 anim-shimmer" />
          </div>
        </div>
      </div>
    </div>
  )
}
