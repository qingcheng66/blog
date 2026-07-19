"use client"

import { useEffect, useRef } from "react"

export function ReadingProgress() {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let rafId: number

    const handleScroll = () => {
      // Use rAF to throttle and avoid React re-renders
      if (rafId) return
      rafId = requestAnimationFrame(() => {
        rafId = 0
        const scrollTop = window.scrollY
        const docHeight = document.documentElement.scrollHeight - window.innerHeight
        if (docHeight > 0 && barRef.current) {
          const progress = Math.min(scrollTop / docHeight, 1)
          barRef.current.style.width = `${progress * 100}%`
        }
      })
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-[3px] bg-transparent pointer-events-none" aria-hidden="true">
      <div
        ref={barRef}
        className="h-full bg-gradient-to-r from-primary to-accent transition-[width] duration-100 ease-out"
        style={{ width: "0%" }}
      />
    </div>
  )
}
