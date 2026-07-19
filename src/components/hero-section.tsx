"use client"

import { useState, useEffect, useRef } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { Download, Mail } from "lucide-react"
import { site } from "@/data/site"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { buttonVariants } from "@/components/ui/button"
import { Hero3DBg } from "./hero-3d-bg"
import { CountUp } from "./count-up"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

const TAGLINES = [
  "AI 全栈工程师",
  "LLM 应用落地践行者",
  "用代码让想法成真",
]

const TYPING_SPEED = 80
const DELETING_SPEED = 40
const PAUSE_AFTER_TYPING = 2000

interface HeroSectionProps {
  postCount: number
  projectCount: number
}

export function HeroSection({ postCount, projectCount }: HeroSectionProps) {
  const containerRef = useRef<HTMLElement>(null)
  const avatarRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const actionsRef = useRef<HTMLDivElement>(null)
  const typingRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useGSAP(() => {
    if (reducedMotion) return

    gsap.from(avatarRef.current, {
      scale: 0.6,
      opacity: 0,
      duration: 0.8,
      ease: "back.out(1.4)",
    })
    gsap.from(textRef.current, {
      y: 30,
      opacity: 0,
      duration: 0.6,
      delay: 0.3,
      ease: "power2.out",
    })
    gsap.from(actionsRef.current?.children ?? [], {
      y: 20,
      opacity: 0,
      stagger: 0.15,
      duration: 0.5,
      delay: 0.6,
      ease: "power2.out",
    })
    gsap.from(typingRef.current?.children ?? [], {
      y: 20,
      opacity: 0,
      stagger: 0.1,
      duration: 0.5,
      delay: 0.5,
      ease: "power2.out",
    })
  }, { scope: containerRef, dependencies: [reducedMotion] })

  const [taglineIdx, setTaglineIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = TAGLINES[taglineIdx]
    const timer = setTimeout(
      () => {
        if (!deleting) {
          if (charIdx < current.length) {
            setCharIdx((c) => c + 1)
          } else {
            setTimeout(() => setDeleting(true), PAUSE_AFTER_TYPING)
          }
        } else {
          if (charIdx > 0) {
            setCharIdx((c) => c - 1)
          } else {
            setDeleting(false)
            setTaglineIdx((i) => (i + 1) % TAGLINES.length)
          }
        }
      },
      deleting ? DELETING_SPEED : TYPING_SPEED,
    )
    return () => clearTimeout(timer)
  }, [charIdx, deleting, taglineIdx])

  return (
    <section className="relative space-y-8 md:space-y-16 pt-4 md:pt-12" ref={containerRef}>
      <Hero3DBg />

      {/* Row 1: Text left, Avatar right */}
      <div className="flex flex-col-reverse md:grid md:grid-cols-5 md:items-center gap-8 md:gap-12">
        {/* Text — left 3/5 columns */}
        <div className="space-y-5 text-center md:text-left md:col-span-3 max-w-xl" ref={textRef}>
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
              {site.name}
            </h1>
            <p className="mt-1.5 text-lg md:text-xl text-muted-foreground">
              {site.title}
            </p>
          </div>

          {/* Typing + Stats — between Title and Bio */}
          <div ref={typingRef} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
            {/* Typing effect — left */}
            <div className="h-8 flex items-center gap-0.5" aria-live="polite" aria-atomic="true">
              <span className="text-base md:text-lg text-primary font-medium">
                {TAGLINES[taglineIdx].slice(0, charIdx)}
              </span>
              <span className="inline-block w-[2px] h-5 bg-primary rounded-full animate-pulse" aria-hidden="true" />
            </div>

            {/* Stats — right */}
            <div className="flex gap-4 sm:gap-6 md:gap-10 shrink-0 justify-center">
              <CountUp end={postCount} label="篇文章" />
              <CountUp end={projectCount} label="个项目" />
              <CountUp end={2} suffix="+" label="年经验" />
            </div>
          </div>

          <p className="max-w-lg text-muted-foreground leading-relaxed">
            {site.bio}
          </p>

          <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start" ref={actionsRef}>
            <a
              href={site.resumeUrl}
              download
              className={buttonVariants({ variant: "default" })}
            >
              <Download className="mr-1.5 size-4" />
              下载简历
            </a>
            <a
              href={`mailto:${site.social.email}`}
              className={buttonVariants({ variant: "outline" })}
            >
              <Mail className="mr-1.5 size-4" />
              联系我
            </a>
          </div>
        </div>

        {/* Avatar — centered in right 2/5 columns, moved up */}
        <div className="flex justify-center md:col-span-2 -mt-8 md:-mt-20" ref={avatarRef}>
          <div className="relative">
            <div className="absolute -inset-4 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 blur-2xl" />
            <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 blur-md" />
            <Avatar
              className="size-24 md:size-40 ring-2 ring-border/30 shadow-stack-lg"
            >
              <AvatarImage src="/avatar.jpg" alt={site.name} />
              <AvatarFallback className="text-6xl">
                {site.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </section>
  )
}
