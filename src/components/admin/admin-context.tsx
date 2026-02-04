'use client'

import { createContext, useContext, type ReactNode } from "react"

type AdminContextValue = {
  slug: string
  club: any
  user: any
  isSuperAdmin: boolean
}

const AdminContext = createContext<AdminContextValue | null>(null)

export function AdminContextProvider({
  value,
  children,
}: {
  value: AdminContextValue
  children: ReactNode
}) {
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}

export function useAdminContext() {
  const ctx = useContext(AdminContext)
  if (!ctx) {
    throw new Error("useAdminContext must be used within AdminContextProvider")
  }
  return ctx
}