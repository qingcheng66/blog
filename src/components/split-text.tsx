"use client"

import { useRef, type ReactNode } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

interface SplitTextProps {
  children: ReactNode
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span"
  className?: string
  stagger?: number
  delay?: number
  scrollTrigger?: boolean
}

export function SplitText({
  children,
  as: Tag = "h2",
  className = "",
  stagger = 0.03,
  delay = 0,
  scrollTrigger = true,
}: SplitTextProps) {
  const ref = useRef<HTMLElement>(null)

  useGSAP(() => {
    const chars = ref.current?.querySelectorAll(".split-char")
    if (!chars?.length) return

    const config: GSAPTweenVars = {
      y: 40,
      opacity: 0,
      rotateX: -20,
      stagger,
      duration: 0.6,
      ease: "power2.out",
      delay,
    }

    if (scrollTrigger) {
      gsap.from(chars, {
        ...config,
        scrollTrigger: {
          trigger: ref.current,
          start: "top 85%",
        },
      })
    } else {
      gsap.from(chars, config)
    }
  }, { scope: ref })

  // Split text into individual character spans
  const splitContent = (node: ReactNode): ReactNode => {
    if (typeof node === "string") {
      return node.split("").map((char, i) => (
        <span key={i} className="split-char inline-block" aria-hidden="true">
          {char === " " ? " " : char}
        </span>
      ))
    }
    return node
  }

  return (
    <Tag ref={ref as never} className={className}>
      {splitContent(children)}
    </Tag>
  )
}
