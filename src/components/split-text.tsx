"use client"

import { useRef, type ReactNode } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

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
  const reducedMotion = useReducedMotion()

  useGSAP(() => {
    if (reducedMotion) return

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
  }, { scope: ref, dependencies: [reducedMotion] })

  // Extract plain text for screen reader accessibility
  const plainText = typeof children === "string" ? children : ""

  // Split text into individual character spans
  // Use inline-block with white-space handling for proper wrapping
  const splitContent = (node: ReactNode): ReactNode => {
    if (typeof node === "string") {
      return node.split("").map((char, i) => (
        <span
          key={i}
          className="split-char inline-block"
          aria-hidden="true"
          style={{ whiteSpace: char === " " ? "pre" : undefined }}
        >
          {char === " " ? " " : char}
        </span>
      ))
    }
    return node
  }

  return (
    <Tag
      ref={ref as never}
      className={className}
      aria-label={plainText || undefined}
    >
      {/* Screen-reader-only full text for accessibility */}
      {plainText && <span className="sr-only">{plainText}</span>}
      {/* Animated split characters (hidden from screen readers) */}
      <span aria-hidden={plainText ? "true" : undefined}>
        {splitContent(children)}
      </span>
    </Tag>
  )
}
