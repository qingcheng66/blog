"use client"

import { useEffect, useState } from "react"

/**
 * Detects whether the current device has a coarse pointer (touch screen).
 * Returns false during SSR to avoid hydration mismatch.
 */
export function useTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(
    () =>
      typeof window !== "undefined" &&
      (window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window)
  )

  useEffect(() => {
    const mq2 = window.matchMedia("(pointer: coarse)")
    const handler = (e: MediaQueryListEvent) => setIsTouch(e.matches || "ontouchstart" in window)
    mq2.addEventListener("change", handler)
    return () => mq2.removeEventListener("change", handler)
  }, [])

  return isTouch
}
