"use client"

import { useEffect, useRef, useState } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { Globe, Mail } from "lucide-react"
import { site } from "@/data/site"
import { useWeather } from "@/hooks/use-weather"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { useTouchDevice } from "@/hooks/use-touch-device"

// ── 天气时钟条 ──
function WeatherClock() {
  const [time, setTime] = useState("")
  const { temp, text: desc } = useWeather()

  // Clock tick
  useEffect(() => {
    const tick = () => {
      setTime(new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }))
    }
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="inline-flex items-center gap-3 glass rounded-full px-5 py-2 text-sm"
      style={{ color: "var(--color-text-secondary)" }}>
      <span>{time || "--:--"}</span>
      <span style={{ color: "var(--color-border-hover)" }}>·</span>
      <span>{site.city}</span>
      <span style={{ color: "var(--color-border-hover)" }}>·</span>
      <span>{desc || "☀️"}</span>
      <span style={{ color: "var(--color-accent)", fontWeight: 600 }}>{temp}</span>
    </div>
  )
}

// ── Typewriter slogan (REQ-016) ──
const SLOGANS = [
  "用代码让想法成真",
  "AI 全栈 · 构建与写作",
  "创造值得留存的事物",
]
const TYPE_MS = 80     // 逐字敲出
const DELETE_MS = 50   // 逐字删除
const HOLD_MS = 2000   // 敲满后停留
const GAP_MS = 300     // 删完后暂停再进下一句

function TypewriterSlogan() {
  const reducedMotion = useReducedMotion()
  const ref = useRef<HTMLHeadingElement>(null)
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [phase, setPhase] = useState<"enter" | "typing" | "holding" | "deleting" | "gap">("enter")

  // Entrance: fade in + translateY for first appearance
  useGSAP(() => {
    if (reducedMotion) return
    gsap.fromTo(ref.current,
      { y: 30, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.6, ease: "power2.out",
        onComplete: () => setPhase("typing"),
      },
    )
  }, { dependencies: [reducedMotion] })

  // Typewriter state machine
  useEffect(() => {
    if (reducedMotion) return
    if (phase === "enter") return // wait for entrance animation callback

    const current = SLOGANS[phraseIndex]
    let timer: ReturnType<typeof setTimeout> | undefined

    if (phase === "typing") {
      if (charCount < current.length) {
        timer = setTimeout(() => setCharCount((c) => c + 1), TYPE_MS)
      } else {
        timer = setTimeout(() => setPhase("holding"), TYPE_MS)
      }
    } else if (phase === "holding") {
      timer = setTimeout(() => setPhase("deleting"), HOLD_MS)
    } else if (charCount > 0) {
      timer = setTimeout(() => setCharCount((c) => c - 1), DELETE_MS)
    } else {
      // charCount === 0, just finished deleting → switch to gap
      timer = setTimeout(() => {
        setPhase("typing")
        setPhraseIndex((i) => (i + 1) % SLOGANS.length)
      }, GAP_MS)
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [phraseIndex, charCount, phase, reducedMotion])

  const shownText = reducedMotion
    ? SLOGANS[0]
    : SLOGANS[phraseIndex].slice(0, charCount)
  const showCaret = reducedMotion || phase !== "enter"

  return (
    <>
      <style>{`
        .serenity-caret {
          display: inline-block;
          width: 2px;
          height: 1.05em;
          margin-left: 3px;
          border-radius: 2px;
          background: var(--color-accent);
          vertical-align: -0.12em;
          animation: serenity-caret-blink 1s step-end infinite;
        }
        @keyframes serenity-caret-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
      <h2
        ref={ref}
        className="text-2xl sm:text-3xl md:text-4xl font-bold select-none"
        style={{
          opacity: reducedMotion ? 1 : 0, // hidden until entrance animation
          background: `linear-gradient(135deg, var(--color-accent), var(--color-accent-secondary))`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        <span>{shownText}</span>
        {showCaret && <span className="serenity-caret" aria-hidden="true" />}
      </h2>
    </>
  )
}

// ── 头像发光环 ──
function AvatarGlow() {
  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Pulse glow ring */}
      <div
        className="absolute inset-0 rounded-full animate-pulse"
        style={{
          background: `conic-gradient(from 0deg, var(--color-accent), var(--color-accent-secondary), var(--color-accent))`,
          filter: "blur(8px)",
          opacity: 0.3,
          transform: "scale(1.15)",
        }}
      />
      {/* Inner static glow */}
      <div
        className="absolute -inset-2 rounded-full"
        style={{
          background: `linear-gradient(135deg, rgba(var(--color-accent-rgb), 0.3), rgba(var(--color-accent-rgb), 0.1))`,
          filter: "blur(16px)",
        }}
      />
      {/* Avatar circle */}
      <div
        className="relative size-24 md:size-32 rounded-full flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, var(--color-accent), var(--color-accent-secondary))`,
          border: "3px solid rgba(255,255,255,0.3)",
          boxShadow: `0 0 30px rgba(var(--color-accent-rgb), 0.3)`,
        }}
      >
        <span className="text-4xl md:text-5xl font-bold text-white select-none">
          L
        </span>
      </div>
    </div>
  )
}

// ── 社交图标 ──
function SocialLinks() {
  const isTouch = useTouchDevice()
  const links = [
    { href: site.social.github, icon: Globe, label: "GitHub" },
    { href: `mailto:${site.social.email}`, icon: Mail, label: "Email" },
  ]

  return (
    <div className="flex items-center gap-3 justify-center">
      {links.map(({ href, icon: Icon, label }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="glass rounded-full p-3 transition-all duration-200"
          style={{
            "--hover-bg": "rgba(var(--color-accent-rgb), 0.15)",
          } as React.CSSProperties}
          {...(!isTouch && {
            onMouseEnter: (e: React.MouseEvent<HTMLAnchorElement>) => {
              e.currentTarget.style.background = "rgba(var(--color-accent-rgb), 0.15)"
              e.currentTarget.style.borderColor = "rgba(var(--color-accent-rgb), 0.3)"
              e.currentTarget.style.color = "var(--color-accent)"
            },
            onMouseLeave: (e: React.MouseEvent<HTMLAnchorElement>) => {
              e.currentTarget.style.background = "var(--glass-bg)"
              e.currentTarget.style.borderColor = "var(--color-border)"
              e.currentTarget.style.color = ""
            },
          })}
        >
          <Icon size={20} />
        </a>
      ))}
    </div>
  )
}

// ── Hero 主体 ──
export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const avatarRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useGSAP(() => {
    if (reducedMotion) return
    gsap.from(avatarRef.current, {
      scale: 0.6,
      opacity: 0,
      duration: 0.8,
      ease: "back.out(1.4)",
    })
    gsap.from(contentRef.current?.children ?? [], {
      y: 24,
      stagger: 0.12,
      duration: 0.6,
      delay: 0.3,
      ease: "power2.out",
    })
  }, { scope: containerRef, dependencies: [reducedMotion] })

  return (
    <section
      ref={containerRef}
      className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-8 pt-16 pb-8"
    >
      {/* 弥散光晕背景 — 暖橙 radial-gradient，纯装饰（zhheo 风格） */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div
          className="absolute left-1/2 top-[18%] -translate-x-1/2 w-[min(680px,90vw)] aspect-square rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(var(--color-accent-rgb), 0.18), transparent 62%)",
            filter: "blur(40px)",
          }}
        />
        <div
          className="absolute right-[5%] bottom-[6%] w-[min(420px,58vw)] aspect-square rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(var(--color-accent-secondary-rgb), 0.12), transparent 62%)",
            filter: "blur(52px)",
          }}
        />
      </div>

      {/* Avatar + glow ring */}
      <div ref={avatarRef} className="relative">
        <AvatarGlow />
      </div>

      {/* Content block */}
      <div ref={contentRef} className="relative flex flex-col items-center gap-5 max-w-lg text-center">
        {/* Name */}
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          {site.name}
        </h1>

        {/* Weather + clock pill */}
        <WeatherClock />

        {/* Typewriter slogan */}
        <TypewriterSlogan />

        {/* Bio */}
        <p style={{ color: "var(--color-text-secondary)" }} className="leading-relaxed text-sm sm:text-base">
          {site.bio}
        </p>

        {/* Social icons */}
        <SocialLinks />
      </div>
    </section>
  )
}
