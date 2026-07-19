"use client"

import { useRef, type ReactNode } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

interface ScrollAnimatorProps {
  children: ReactNode
  sectionId: string
  sectionClass?: string
}

export function ScrollAnimator({ children, sectionId, sectionClass = "" }: ScrollAnimatorProps) {
  const ref = useRef<HTMLElement>(null)

  useGSAP(() => {
    gsap.from(".scroll-card", {
      y: 40,
      opacity: 0,
      stagger: 0.1,
      duration: 0.6,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ref.current,
        start: "top 80%",
      },
    })
  }, { scope: ref })

  return (
    <section id={sectionId} className={sectionClass} ref={ref}>
      {children}
    </section>
  )
}
