"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "next-themes"

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
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)

    for (const c of colorSet) {
      blobs.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: 200 + Math.random() * 300,
        colors: c,
      })
    }

    let frame: number
    function animate() {
      if (!canvas || !ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const b of blobs) {
        b.x += b.vx
        b.y += b.vy
        if (b.x < -b.radius || b.x > canvas.width + b.radius) b.vx *= -1
        if (b.y < -b.radius || b.y > canvas.height + b.radius) b.vy *= -1

        const gradient = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.radius)
        gradient.addColorStop(0, `rgba(${b.colors.r},${b.colors.g},${b.colors.b},${b.colors.a})`)
        gradient.addColorStop(1, `rgba(${b.colors.r},${b.colors.g},${b.colors.b},0)`)
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      frame = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("resize", resize)
    }
  }, [isDark])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 h-full w-full"
      aria-hidden="true"
    />
  )
}
