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

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
      style={{
        background: "var(--color-bg-soft)",
        opacity: fadeOut ? 0 : 1,
        transition: "opacity 0.6s ease-out",
      }}
    >
      {/* Animated greeting */}
      <div className={fadeOut ? "animate-fade-out" : "animate-fade-in"}>
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
      >
        动态色相 · 玻璃拟态 · 粒子背景
      </p>

      {/* Click hint */}
      <button
        onClick={() => {
          setFadeOut(true)
          setTimeout(() => {
            setVisible(false)
            sessionStorage.setItem("welcome-dismissed", "1")
          }, 600)
        }}
        className="mt-8 text-xs px-4 py-2 glass rounded-full transition-colors hover-media:hover:bg-white/10"
        style={{ color: "var(--color-text-muted)" }}
      >
        点击任意位置进入
      </button>
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
