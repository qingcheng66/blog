"use client"

import { useRef, type ReactNode } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

gsap.registerPlugin(ScrollTrigger)

type Direction = "up" | "down" | "left" | "right"

interface ScrollAnimatorProps {
  children: ReactNode
  sectionId: string
  sectionClass?: string
  direction?: Direction
  /** GSAP ease string, default "back.out(1.2)" */
  easing?: string
  distance?: number
  stagger?: number
}

const directionMap: Record<Direction, { x?: number; y?: number }> = {
  up: { y: 1 },
  down: { y: -1 },
  left: { x: 1 },
  right: { x: -1 },
}

export function ScrollAnimator({
  children,
  sectionId,
  sectionClass = "",
  direction = "up",
  easing = "back.out(1.2)",
  distance = 50,
  stagger = 0.08,
}: ScrollAnimatorProps) {
  const ref = useRef<HTMLElement>(null)
  const reducedMotion = useReducedMotion()

  useGSAP(() => {
    if (reducedMotion) return

    const dir = directionMap[direction]
    const vars: GSAPTweenVars = {
      duration: 0.7,
      ease: easing,
      stagger,
      scrollTrigger: {
        trigger: ref.current,
        start: "top 82%",
      },
    }
    if (dir.x) vars.x = dir.x * distance
    if (dir.y) vars.y = dir.y * distance

    // Scope to this section only — avoids animating cards in other sections
    const cards = ref.current?.querySelectorAll(".scroll-card")
    if (cards?.length) {
      gsap.from(cards, vars)
    }
  }, { scope: ref, dependencies: [reducedMotion] })

  return (
    <section id={sectionId} className={sectionClass} ref={ref}>
      {children}
    </section>
  )
}
