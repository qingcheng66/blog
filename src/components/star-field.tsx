"use client"

import { useEffect, useRef, useState } from "react"
import { useTheme } from "@/hooks/use-theme"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

interface Star {
  x: number
  y: number
  size: number
  opacity: number
  speed: number
  phase: number
}

export function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { resolvedTheme } = useTheme()
  const reducedMotion = useReducedMotion()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === "dark"

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !isDark) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animId: number
    let stars: Star[] = []

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener("resize", resize)

    // Generate stars — fewer on mobile for performance
    const isMobile = window.innerWidth < 768
    const count = isMobile
      ? Math.min(40, Math.floor((window.innerWidth * window.innerHeight) / 15000))
      : Math.min(120, Math.floor((window.innerWidth * window.innerHeight) / 8000))
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: 0.5 + Math.random() * 1.5,
      opacity: 0.3 + Math.random() * 0.7,
      speed: 0.005 + Math.random() * 0.02,
      phase: Math.random() * Math.PI * 2,
    }))

    let time = 0
    const animate = () => {
      if (!canvas || !ctx) return
      time += 0.01
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

      for (const star of stars) {
        const twinkle = Math.sin(time * star.speed * 10 + star.phase) * 0.4 + 0.6
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * twinkle * 0.6})`
        ctx.fill()
      }

      animId = requestAnimationFrame(animate)
    }

    // If reduced motion, draw once statically
    if (reducedMotion) {
      for (const star of stars) {
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * 0.6})`
        ctx.fill()
      }
    } else {
      animate()
    }

    // Pause when tab hidden
    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(animId)
      } else if (!reducedMotion) {
        animId = requestAnimationFrame(animate)
      }
    }
    document.addEventListener("visibilitychange", handleVisibility)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", resize)
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [isDark, reducedMotion])

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none transition-opacity duration-700 ${isDark ? "opacity-100" : "opacity-0"}`}
      style={{ zIndex: -5 }}
      aria-hidden="true"
    />
  )
}
