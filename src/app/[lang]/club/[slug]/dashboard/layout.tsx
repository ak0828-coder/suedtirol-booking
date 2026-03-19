"use client"

import { MemberSidebar } from "@/components/member-sidebar"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { useParams, usePathname } from "next/navigation"

export default function MemberDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const params = useParams()
  const pathname = usePathname()
  const slug = params?.slug as string

  // Simple logic to determine active tab for mobile nav
  const getActiveTab = (): "dashboard" | "book" | "training" | "settings" | "leaderboard" => {
    if (pathname.includes("/book")) return "book"
    if (pathname.includes("/training")) return "training"
    if (pathname.includes("/settings")) return "settings"
    if (pathname.includes("/leaderboard")) return "leaderboard"
    return "dashboard"
  }

  return (
    <div className="flex min-h-screen bg-[#030504]">
      {/* Desktop Sidebar */}
      <MemberSidebar slug={slug} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>

      {/* Mobile Bottom Nav (only for dashboard area) */}
      <MobileBottomNav slug={slug} active={getActiveTab()} />
    </div>
  )
}
