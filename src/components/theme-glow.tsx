"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "@/hooks/use-theme"

export function ThemeGlow() {
  const { resolvedTheme } = useTheme()
  const prevRef = useRef<string | undefined>(undefined)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const prev = prevRef.current
    const current = resolvedTheme
    if (prev && current && prev !== current) {
      const overlay = overlayRef.current
      if (overlay) {
        overlay.style.opacity = "0.15"
        overlay.style.transform = "scale(1)"
        requestAnimationFrame(() => {
          overlay.style.transition = "opacity 0.6s ease, transform 0.6s ease"
          overlay.style.opacity = "0"
          overlay.style.transform = "scale(1.5)"
        })
      }
    }
    prevRef.current = current
  }, [resolvedTheme])

  // Set background color after mount to avoid hydration mismatch
  useEffect(() => {
    const overlay = overlayRef.current
    if (!overlay) return
    if (resolvedTheme === "dark") {
      overlay.style.background =
        "radial-gradient(circle at 50% 50%, oklch(0.65 0.15 30 / 0.15), transparent 70%)"
    } else {
      overlay.style.background =
        "radial-gradient(circle at 50% 50%, oklch(0.55 0.15 30 / 0.08), transparent 70%)"
    }
  }, [resolvedTheme])

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] pointer-events-none opacity-0"
      style={{ transform: "scale(0.5)" }}
      aria-hidden="true"
    />
  )
}
