"use client"

import { Suspense } from "react"
import AuthCallbackClient from "./auth-callback-client"

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f5f5f7]" />}>
      <AuthCallbackClient />
    </Suspense>
  )
}

