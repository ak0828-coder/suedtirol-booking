"use client"

import { MemberSidebar } from "@/components/member-sidebar"
import { useParams } from "next/navigation"

export default function MemberDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const params = useParams()
  const slug = params?.slug as string

  return (
    <div className="flex min-h-screen bg-[#030504]">
      {/* Desktop Sidebar */}
      <MemberSidebar slug={slug} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  )
}
