"use client"

import { Suspense } from "react"
import LoginClient from "./login-client"

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f5f5f7]" />}>
      <LoginClient />
    </Suspense>
  )
}
