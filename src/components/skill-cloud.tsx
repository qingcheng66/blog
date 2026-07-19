"use client"

import { useRef } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

interface SkillCloudProps {
  skills: { name: string; level?: number }[]
}

export function SkillCloud({ skills }: SkillCloudProps) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(() => {
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
  }, { scope: ref })

  return (
    <div ref={ref} className="flex flex-wrap gap-2.5">
      {skills.map((s) => (
        <span
          key={s.name}
          className="skill-tag inline-block rounded-full border bg-secondary/50 px-3.5 py-1.5 text-sm font-medium text-secondary-foreground hover:bg-secondary hover:border-primary/30 hover:text-primary transition-colors cursor-default"
        >
          {s.name}
        </span>
      ))}
    </div>
  )
}
