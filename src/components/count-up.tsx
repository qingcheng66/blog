"use client"

import { useRef, useState } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

gsap.registerPlugin(ScrollTrigger)

interface CountUpProps {
  end: number
  suffix?: string
  label: string
  duration?: number
}

export function CountUp({ end, suffix = "", label, duration = 2 }: CountUpProps) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const counted = useRef(false)
  const reducedMotion = useReducedMotion()

  useGSAP(() => {
    if (reducedMotion) {
      // Skip animation, show final value immediately
      setCount(end)
      return
    }

    if (counted.current) return
    ScrollTrigger.create({
      trigger: ref.current,
      start: "top 85%",
      once: true,
      onEnter: () => {
        counted.current = true
        const obj = { val: 0 }
        gsap.to(obj, {
          val: end,
          duration,
          ease: "power2.out",
          onUpdate: () => setCount(Math.floor(obj.val)),
        })
      },
    })
  }, { scope: ref, dependencies: [reducedMotion, end, duration] })

  return (
    <div ref={ref} className="text-center space-y-1">
      <span className="text-3xl md:text-4xl font-bold tabular-nums text-primary">
        {count}{suffix}
      </span>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}
