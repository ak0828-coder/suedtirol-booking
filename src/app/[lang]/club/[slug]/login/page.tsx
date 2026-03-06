import { Suspense } from "react"
import MemberLoginClient from "./member-login-client"

export default function ClubMemberLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f5f5f7]" />}>
      <MemberLoginClient />
    </Suspense>
  )
}
