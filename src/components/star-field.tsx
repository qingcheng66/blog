"use client"

import { useEffect, useRef, useState } from "react"
import { useTheme } from "@/hooks/use-theme"

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
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)

    // Generate stars
    const count = Math.min(120, Math.floor((canvas.width * canvas.height) / 8000))
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 0.5 + Math.random() * 1.5,
      opacity: 0.3 + Math.random() * 0.7,
      speed: 0.005 + Math.random() * 0.02,
      phase: Math.random() * Math.PI * 2,
    }))

    let time = 0
    const animate = () => {
      if (!canvas || !ctx) return
      time += 0.01
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const star of stars) {
        const twinkle = Math.sin(time * star.speed * 10 + star.phase) * 0.4 + 0.6
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * twinkle * 0.6})`
        ctx.fill()
      }

      animId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", resize)
    }
  }, [isDark])

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none transition-opacity duration-700 ${isDark ? "opacity-100" : "opacity-0"}`}
      style={{ zIndex: -5 }}
      aria-hidden="true"
    />
  )
}
