"use client"

import { useEffect, useState } from "react"

/**
 * Detects whether the user prefers reduced motion.
 * Returns false during SSR to avoid hydration mismatch.
 * Use this in GSAP/rAF components to skip or simplify animations.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  return reduced
}
