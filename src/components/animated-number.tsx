"use client"

import { useEffect, useRef, useState } from "react"

type AnimatedNumberProps = {
  value: number
  durationMs?: number
}

export function AnimatedNumber({ value, durationMs = 900 }: AnimatedNumberProps) {
  const [display, setDisplay] = useState(0)
  const startRef = useRef<number | null>(null)

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (prefersReduced) {
      setDisplay(value)
      return
    }

    let raf = 0
    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts
      const elapsed = ts - startRef.current
      const t = Math.min(1, elapsed / durationMs)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(Math.round(value * eased))
      if (t < 1) raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [value, durationMs])

  return <span>{display}</span>
}
