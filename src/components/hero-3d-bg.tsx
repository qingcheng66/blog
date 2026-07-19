"use client"

import { useRef, useCallback } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"

export function Hero3DBg() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  const layer1Ref = useRef<HTMLDivElement>(null)
  const layer2Ref = useRef<HTMLDivElement>(null)
  const layer3Ref = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    mouseRef.current = { x, y }
  }, [])

  useGSAP(() => {
    const loop = () => {
      const { x, y } = mouseRef.current

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

      requestAnimationFrame(loop)
    }

    const raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  })

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 -z-5 overflow-hidden pointer-events-none"
      onPointerMove={handlePointerMove}
      aria-hidden="true"
    >
      {/* Layer 1 — Dot grid (closest, slowest) */}
      <div
        ref={layer1Ref}
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Layer 2 — Larger dots */}
      <div
        ref={layer2Ref}
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle, currentColor 1.5px, transparent 1.5px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* Layer 3 — Line grid (farthest, fastest) */}
      <div
        ref={layer3Ref}
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
          backgroundSize: "120px 120px",
        }}
      />

      {/* Mouse-follow glow */}
      <div
        ref={glowRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-20 dark:opacity-15"
        style={{
          background:
            "radial-gradient(circle at center, var(--primary), transparent 70%)",
        }}
      />
    </div>
  )
}
