"use client"

import { useRef, useCallback, useEffect } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { useTouchDevice } from "@/hooks/use-touch-device"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

export function Hero3DBg() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  const idlePhaseRef = useRef(Math.random() * Math.PI * 2)
  const rafRef = useRef<number>(0)
  const layer1Ref = useRef<HTMLDivElement>(null)
  const layer2Ref = useRef<HTMLDivElement>(null)
  const layer3Ref = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const isTouch = useTouchDevice()
  const reducedMotion = useReducedMotion()

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    mouseRef.current = { x, y }
  }, [])

  useGSAP(() => {
    if (reducedMotion) return

    const loop = () => {
      let x: number, y: number

      if (isTouch) {
        // Auto-drift idle animation for touch devices
        idlePhaseRef.current += 0.003
        x = 0.5 + Math.sin(idlePhaseRef.current) * 0.2
        y = 0.5 + Math.cos(idlePhaseRef.current * 0.7) * 0.15
      } else {
        x = mouseRef.current.x
        y = mouseRef.current.y
      }

      gsap.to(layer1Ref.current, {
        x: (x - 0.5) * 30,
        y: (y - 0.5) * 20,
        duration: 1.2,
        ease: "power2.out",
        overwrite: "auto",
      })
      gsap.to(layer2Ref.current, {
        x: (x - 0.5) * 60,
        y: (y - 0.5) * 40,
        duration: 1.5,
        ease: "power2.out",
        overwrite: "auto",
      })
      gsap.to(layer3Ref.current, {
        x: (x - 0.5) * 100,
        y: (y - 0.5) * 70,
        duration: 2,
        ease: "power2.out",
        overwrite: "auto",
      })
      gsap.to(glowRef.current, {
        x: (x - 0.5) * 80,
        y: (y - 0.5) * 60,
        duration: 1.8,
        ease: "power2.out",
        overwrite: "auto",
      })

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)

    // Pause when tab is hidden (save mobile battery)
    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafRef.current)
      } else {
        rafRef.current = requestAnimationFrame(loop)
      }
    }
    document.addEventListener("visibilitychange", handleVisibility)

    return () => {
      cancelAnimationFrame(rafRef.current)
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [isTouch, reducedMotion])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 -z-5 overflow-hidden"
      onPointerMove={handlePointerMove}
      aria-hidden="true"
    >
      {/* Layer 1 — Dot grid (closest, slowest) */}
      <div
        ref={layer1Ref}
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Layer 2 — Larger dots */}
      <div
        ref={layer2Ref}
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, currentColor 1.5px, transparent 1.5px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* Layer 3 — Line grid (farthest, fastest) */}
      <div
        ref={layer3Ref}
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
          backgroundSize: "120px 120px",
        }}
      />

      {/* Mouse-follow glow — responsive sizing */}
      <div
        ref={glowRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(500px,80vw)] h-[min(500px,80vw)] rounded-full opacity-20 dark:opacity-15 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at center, var(--primary), transparent 70%)",
        }}
      />
    </div>
  )
}
