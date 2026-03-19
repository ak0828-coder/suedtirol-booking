export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#030504] pb-20 overflow-hidden">
      <div className="max-w-5xl mx-auto space-y-8 p-6 pt-12">
        {/* Header Skeleton */}
        <div className="space-y-4">
          <div className="h-3 w-24 rounded-full bg-white/5 anim-shimmer" />
          <div className="h-10 w-64 rounded-2xl bg-white/5 anim-shimmer" />
        </div>

        {/* Main Grid Skeleton */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="h-40 rounded-[2rem] bg-white/5 border border-white/5 anim-shimmer" />
          <div className="h-40 rounded-[2rem] bg-white/5 border border-white/5 anim-shimmer" />
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-3 gap-4">
          <div className="h-24 rounded-2xl bg-white/5 border border-white/5 anim-shimmer" />
          <div className="h-24 rounded-2xl bg-white/5 border border-white/5 anim-shimmer" />
          <div className="h-24 rounded-2xl bg-white/5 border border-white/5 anim-shimmer" />
        </div>

        {/* Lower Grid Skeleton */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="h-48 rounded-[2rem] bg-white/5 border border-white/5 anim-shimmer" />
          <div className="grid grid-cols-2 gap-4">
             <div className="h-24 rounded-2xl bg-white/5 border border-white/5 anim-shimmer" />
             <div className="h-24 rounded-2xl bg-white/5 border border-white/5 anim-shimmer" />
          </div>
        </div>
      </div>
    </div>
  )
}
