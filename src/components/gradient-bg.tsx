"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "@/hooks/use-theme"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

interface Blob {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
}

const LIGHT_BLOBS = [
  { r: 255, g: 150, b: 120, a: 0.15 },
  { r: 255, g: 200, b: 100, a: 0.12 },
  { r: 240, g: 160, b: 180, a: 0.10 },
]

const DARK_BLOBS = [
  { r: 200, g: 100, b: 80, a: 0.12 },
  { r: 200, g: 150, b: 70, a: 0.10 },
  { r: 180, g: 110, b: 130, a: 0.08 },
]

export function GradientBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { resolvedTheme } = useTheme()
  const reducedMotion = useReducedMotion()
  const isDark = resolvedTheme === "dark"

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const blobs: (Blob & { colors: (typeof LIGHT_BLOBS)[number] })[] = []
    const colorSet = isDark ? DARK_BLOBS : LIGHT_BLOBS

    function resize() {
      if (!canvas) return
      // Use devicePixelRatio for sharp rendering, capped at 2x for performance
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener("resize", resize)

    // Proportional blob sizing based on viewport
    const minDim = Math.min(window.innerWidth, window.innerHeight)
    // Mobile: fewer, smaller blobs
    const isMobile = window.innerWidth < 768
    const blobColors = isMobile ? colorSet.slice(0, 2) : colorSet

    for (const c of blobColors) {
      blobs.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: isMobile
          ? minDim * 0.15 + Math.random() * minDim * 0.2 // 56-130px on 375px phone
          : 200 + Math.random() * 300, // 200-500px desktop
        colors: c,
      })
    }

    // If reduced motion, draw once statically
    if (reducedMotion) {
      for (const b of blobs) {
        const gradient = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.radius)
        gradient.addColorStop(0, `rgba(${b.colors.r},${b.colors.g},${b.colors.b},${b.colors.a})`)
        gradient.addColorStop(1, `rgba(${b.colors.r},${b.colors.g},${b.colors.b},0)`)
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)
      }
      return () => {
        window.removeEventListener("resize", resize)
      }
    }

    let frame: number
    let tick = 0
    function animate() {
      if (!canvas || !ctx) return
      tick++

      // Skip every other frame on mobile for 30fps
      if (isMobile && tick % 2 !== 0) {
        frame = requestAnimationFrame(animate)
        return
      }

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

      for (const b of blobs) {
        b.x += b.vx
        b.y += b.vy
        if (b.x < -b.radius || b.x > window.innerWidth + b.radius) b.vx *= -1
        if (b.y < -b.radius || b.y > window.innerHeight + b.radius) b.vy *= -1

        const gradient = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.radius)
        gradient.addColorStop(0, `rgba(${b.colors.r},${b.colors.g},${b.colors.b},${b.colors.a})`)
        gradient.addColorStop(1, `rgba(${b.colors.r},${b.colors.g},${b.colors.b},0)`)
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)
      }

      frame = requestAnimationFrame(animate)
    }
    animate()

    // Pause when tab hidden
    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame)
      } else {
        frame = requestAnimationFrame(animate)
      }
    }
    document.addEventListener("visibilitychange", handleVisibility)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("resize", resize)
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [isDark, reducedMotion])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 h-full w-full"
      aria-hidden="true"
    />
  )
}
