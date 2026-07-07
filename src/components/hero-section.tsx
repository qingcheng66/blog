"use client"

import { useState, useEffect } from "react"
import { Download, Mail } from "lucide-react"
import { site } from "@/data/site"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { buttonVariants } from "@/components/ui/button"

const TAGLINES = [
  "AI 全栈工程师",
  "LLM 应用落地践行者",
  "用代码让想法成真",
]

const TYPING_SPEED = 80
const DELETING_SPEED = 40
const PAUSE_AFTER_TYPING = 2000
const PAUSE_AFTER_DELETING = 500

export function HeroSection() {
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
    <section className="flex flex-col items-center gap-10 md:flex-row md:items-start md:gap-16">
      {/* Avatar */}
      <div className="shrink-0">
        <div className="relative">
          <div className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 blur-md" />
          <Avatar
            size="lg"
            className="size-32 md:size-40 ring-2 ring-border/50"
          >
            <AvatarImage src="/avatar.jpg" alt={site.name} />
            <AvatarFallback className="text-3xl">
              {site.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Text */}
      <div className="space-y-5 text-center md:text-left">
        <div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {site.name}
          </h1>
          <p className="mt-1.5 text-xl text-muted-foreground">
            {site.title}
          </p>
        </div>

        {/* Typing effect */}
        <div className="h-7 flex items-center justify-center md:justify-start gap-0.5">
          <span className="text-lg text-primary font-medium">
            {TAGLINES[taglineIdx].slice(0, charIdx)}
          </span>
          <span className="inline-block w-[2px] h-5 bg-primary rounded-full animate-pulse" />
        </div>

        <p className="max-w-lg text-muted-foreground leading-relaxed">
          {site.bio}
        </p>

        <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
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
    </section>
  )
}
