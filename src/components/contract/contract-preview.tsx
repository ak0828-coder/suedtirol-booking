"use client"

import React, { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { ContractPDF, ContractData } from "./contract-pdf"

const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((m) => m.PDFViewer),
  { ssr: false, loading: () => <p className="text-sm text-slate-500">Lade Vorschau...</p> }
)

class PreviewBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(error: unknown) {
    console.error("ContractPreview error:", error)
  }
  render() {
    if (this.state.hasError) {
      return <p className="text-sm text-slate-500">Vorschau konnte nicht geladen werden.</p>
    }
    return this.props.children
  }
}

export function ContractPreview({
  data,
  className,
}: {
  data: ContractData
  className?: string
}) {
  const [debouncedData, setDebouncedData] = useState(data)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedData(data), 250)
    return () => clearTimeout(t)
  }, [data])

  return (
    <div className={className}>
      <PreviewBoundary>
        <PDFViewer width="100%" height="100%" showToolbar={false} className="rounded-2xl border border-slate-200 shadow-xl">
          <ContractPDF data={debouncedData} />
        </PDFViewer>
      </PreviewBoundary>
    </div>
  )
}
