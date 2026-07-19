"use client"

import { useEffect, useState } from "react"

/**
 * Detects whether the current device has a coarse pointer (touch screen).
 * Returns false during SSR to avoid hydration mismatch.
 */
export function useTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    // Double-check: pointer:coarse covers most touch devices,
    // ontouchstart covers older edge cases
    const hasCoarsePointer = window.matchMedia("(pointer: coarse)").matches
    const hasTouchStart = "ontouchstart" in window
    setIsTouch(hasCoarsePointer || hasTouchStart)

    // Listen for changes (e.g., docking/undocking a tablet)
    const mq = window.matchMedia("(pointer: coarse)")
    const handler = (e: MediaQueryListEvent) => setIsTouch(e.matches || "ontouchstart" in window)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  return isTouch
}
