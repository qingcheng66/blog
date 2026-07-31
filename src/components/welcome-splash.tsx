"use client"

import { useEffect, useState } from "react"
import { site } from "@/data/site"

export function WelcomeSplash() {
  const [visible, setVisible] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    // sessionStorage — only show once per session
    const dismissed = sessionStorage.getItem("welcome-dismissed")
    if (dismissed) return

    setVisible(true)

    // Auto-dismiss after 2.5s
    const timer = setTimeout(() => {
      setFadeOut(true)
      setTimeout(() => {
        setVisible(false)
        sessionStorage.setItem("welcome-dismissed", "1")
      }, 600)
    }, 2500)

    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  const dismiss = () => {
    setFadeOut(true)
    setTimeout(() => {
      setVisible(false)
      sessionStorage.setItem("welcome-dismissed", "1")
    }, 600)
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
      style={{
        background: "var(--color-bg-soft)",
        opacity: fadeOut ? 0 : 1,
        transition: "opacity 0.6s ease-out",
      }}
      onClick={dismiss}
    >
      {/* 暖金色微粒子 */}
      <WelcomeParticles />

      {/* Animated greeting */}
      <div className={fadeOut ? "animate-fade-out" : "animate-fade-in"} onClick={(e) => e.stopPropagation()}>
        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4"
          style={{
            background: `linear-gradient(135deg, var(--color-accent), var(--color-accent-secondary), var(--color-accent))`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            backgroundSize: "200% 200%",
            animation: fadeOut ? undefined : "shimmer 2s ease-in-out infinite",
          }}
        >
          {site.name} · Lab
        </h1>
      </div>

      <p
        className="text-sm sm:text-base"
        style={{
          color: "var(--color-text-muted)",
          opacity: fadeOut ? 0 : 1,
          transition: "opacity 0.4s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        AI 全栈 · 构建与写作
      </p>

      {/* Click hint */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          dismiss()
        }}
        className="mt-8 text-xs px-4 py-2 glass rounded-full transition-colors hover-media:hover:bg-white/10 opacity-60"
        style={{ color: "var(--color-text-muted)" }}
      >
        点击任意位置进入
      </button>
    </div>
  )
}

// ── 暖金色微粒子 ──
const PARTICLE_COUNT = 10

// 预生成光点布局：相对位置 / 直径 / 透明度 / 动画延迟
const PARTICLES = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  left: `${8 + ((i * 37) % 84)}%`,
  top: `${10 + ((i * 53) % 76)}%`,
  size: 2 + (i % 2), // 2px 或 3px
  opacity: 0.3 + ((i * 13) % 30) / 100, // 0.3 ~ 0.6
  delay: `${(i % 8) * 0.35}s`,
}))

function WelcomeParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            left: p.left,
            top: p.top,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            background: "hsl(44, 80%, 55%)",
            animation: `float-welcome 3s ease-in-out infinite`,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  )
}

// Inject keyframe styles
const styles = `
@keyframes fade-in {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fade-out {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-20px); }
}
@keyframes shimmer {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
.animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
.animate-fade-out { animation: fade-out 0.6s ease-out forwards; }
`

if (typeof document !== "undefined") {
  const sheet = document.createElement("style")
  sheet.textContent = styles
  document.head.appendChild(sheet)
}
