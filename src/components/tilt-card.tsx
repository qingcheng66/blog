"use client"

import { useRef, useCallback, type ReactNode } from "react"
import gsap from "gsap"
import { useTouchDevice } from "@/hooks/use-touch-device"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

interface TiltCardProps {
  children: ReactNode
  className?: string
  maxTilt?: number
  glare?: boolean
}

export function TiltCard({ children, className = "", maxTilt = 8, glare = true }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const glareRef = useRef<HTMLDivElement>(null)
  const isTouch = useTouchDevice()
  const reducedMotion = useReducedMotion()

  // Skip tilt on touch devices or if user prefers reduced motion
  const tiltDisabled = isTouch || reducedMotion

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (tiltDisabled) return
      const card = cardRef.current
      if (!card) return

      const rect = card.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const x = (e.clientX - centerX) / (rect.width / 2)
      const y = (e.clientY - centerY) / (rect.height / 2)

      gsap.to(card, {
        rotateX: -y * maxTilt,
        rotateY: x * maxTilt,
        transformPerspective: 800,
        duration: 0.4,
        ease: "power2.out",
        overwrite: "auto",
      })

      if (glare && glareRef.current) {
        gsap.to(glareRef.current, {
          opacity: 1,
          background: `linear-gradient(
            ${45 + x * 20}deg,
            rgba(255,255,255,0) 0%,
            rgba(255,255,255,0.08) ${50 + y * 15}%,
            rgba(255,255,255,0) ${80 + x * 10}%
          )`,
          duration: 0.3,
          overwrite: "auto",
        })
      }
    },
    [maxTilt, glare, tiltDisabled],
  )

  const handlePointerLeave = useCallback(() => {
    if (tiltDisabled) return
    const card = cardRef.current
    if (!card) return

    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.6,
      ease: "power2.out",
    })

    if (glare && glareRef.current) {
      gsap.to(glareRef.current, {
        opacity: 0,
        duration: 0.5,
      })
    }
  }, [glare, tiltDisabled])

  return (
    <div
      ref={cardRef}
      className={`relative ${className}`}
      style={{
        transformStyle: tiltDisabled ? "flat" : "preserve-3d",
        touchAction: "manipulation",
      }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {children}

      {glare && !tiltDisabled && (
        <div
          ref={glareRef}
          className="absolute inset-0 rounded-[inherit] pointer-events-none opacity-0"
          style={{ mixBlendMode: "overlay" }}
        />
      )}
    </div>
  )
}
