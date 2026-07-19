"use client"

import { useRef } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

gsap.registerPlugin(ScrollTrigger)

interface SkillCloudProps {
  skills: { name: string; level?: number }[]
}

export function SkillCloud({ skills }: SkillCloudProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useGSAP(() => {
    if (reducedMotion) {
      // Show all tags immediately at final state
      gsap.set(".skill-tag", { scale: 1, opacity: 1, rotation: 0 })
      return
    }

    gsap.from(".skill-tag", {
      scale: 0,
      opacity: 0,
      rotation: () => gsap.utils.random(-15, 15),
      stagger: 0.04,
      duration: 0.5,
      ease: "back.out(1.7)",
      scrollTrigger: {
        trigger: ref.current,
        start: "top 82%",
      },
    })
  }, { scope: ref, dependencies: [reducedMotion] })

  return (
    <div ref={ref} className="flex flex-wrap gap-2.5">
      {skills.map((s) => (
        <span
          key={s.name}
          className="skill-tag inline-block rounded-full border bg-secondary/50 px-3.5 py-1.5 text-sm font-medium text-secondary-foreground hover-media:hover:bg-secondary hover-media:hover:border-primary/30 hover-media:hover:text-primary transition-colors cursor-default"
        >
          {s.name}
        </span>
      ))}
    </div>
  )
}
