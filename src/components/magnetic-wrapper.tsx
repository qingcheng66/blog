"use client"

import { useRef, useCallback, type ReactNode } from "react"
import gsap from "gsap"

interface MagneticWrapperProps {
  children: ReactNode
  strength?: number
}

export function MagneticWrapper({ children, strength = 0.3 }: MagneticWrapperProps) {
  const ref = useRef<HTMLSpanElement>(null)

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
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
    [strength],
  )

  const handlePointerLeave = useCallback(() => {
    gsap.to(ref.current, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: "power2.out",
    })
  }, [])

  return (
    <span
      ref={ref}
      className="inline-block"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {children}
    </span>
  )
}
