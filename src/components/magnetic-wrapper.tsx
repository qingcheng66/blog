"use client"

import { useRef, useCallback, type ReactNode } from "react"
import gsap from "gsap"
import { useTouchDevice } from "@/hooks/use-touch-device"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

interface MagneticWrapperProps {
  children: ReactNode
  strength?: number
}

export function MagneticWrapper({ children, strength = 0.3 }: MagneticWrapperProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isTouch = useTouchDevice()
  const reducedMotion = useReducedMotion()

  // Skip magnetic effect on touch devices or if user prefers reduced motion
  const disabled = isTouch || reducedMotion

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (disabled) return
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left - rect.width / 2
      const y = e.clientY - rect.top - rect.height / 2
      gsap.to(el, {
        x: x * strength,
        y: y * strength,
        duration: 0.4,
        ease: "power2.out",
        overwrite: "auto",
      })
    },
    [strength, disabled],
  )

  const handlePointerLeave = useCallback(() => {
    if (disabled) return
    gsap.to(ref.current, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: "power2.out",
    })
  }, [disabled])

  // On touch devices or reduced motion, just render children without effects
  if (disabled) {
    return <span className="inline-block">{children}</span>
  }

  return (
    <span
      ref={ref}
      className="inline-block"
      style={{ touchAction: "none" }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {children}
    </span>
  )
}
