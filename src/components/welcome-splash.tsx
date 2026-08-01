"use client"

import { useEffect, useState } from "react"
import { site } from "@/data/site"
import type { WelcomeConfig } from "@/lib/content"

export function WelcomeSplash({
  welcome,
}: {
  welcome?: WelcomeConfig | null
}) {
  // 兼容旧数据：未配置时默认启用
  if (!(welcome?.enabled ?? true)) return null

  return <WelcomeSplashInner welcome={welcome} />
}

function WelcomeSplashInner({ welcome }: { welcome?: WelcomeConfig | null }) {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false
    return !sessionStorage.getItem("welcome-dismissed")
  })
  const [fadeOut, setFadeOut] = useState(false)

  // 从配置读取，fallback 到原有硬编码值
  const title = welcome?.title?.trim() || `${site.name} · Lab`
  const subtitle = welcome?.subtitle?.trim() || "AI 全栈 · 构建与写作"
  const bgImage = welcome?.background?.trim() || ""
  const showParticles = welcome?.showParticles ?? true

  useEffect(() => {
    if (!visible) return

    // Auto-dismiss after 2.5s
    const timer = setTimeout(() => {
      setFadeOut(true)
      setTimeout(() => {
        setVisible(false)
        sessionStorage.setItem("welcome-dismissed", "1")
      }, 600)
    }, 2500)

    return () => clearTimeout(timer)
  }, [visible])

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
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: "var(--color-bg-soft)",
        opacity: fadeOut ? 0 : 1,
        transition: "opacity 0.6s ease-out",
      }}
      onClick={dismiss}
    >
      {/* 动态背景图（GIF/WebP 自然播放），置于文字与粒子之下 */}
      {bgImage && (
        <>
          <img
            src={bgImage}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
          />
          {/* 暗色遮罩保证文字可读 */}
          <div
            className="absolute inset-0"
            style={{ background: "rgba(20,12,6,0.45)" }}
          />
        </>
      )}

      {/* 暖金色微粒子 */}
      {showParticles && <WelcomeParticles />}

      {/* Animated greeting */}
      <div className={`relative z-10 ${fadeOut ? "animate-fade-out" : "animate-fade-in"}`} onClick={(e) => e.stopPropagation()}>
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
          {title}
        </h1>
      </div>

      <p
        className="relative z-10 text-sm sm:text-base"
        style={{
          color: bgImage ? "rgba(255,255,255,0.85)" : "var(--color-text-muted)",
          opacity: fadeOut ? 0 : 1,
          transition: "opacity 0.4s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {subtitle}
      </p>

      {/* Click hint */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          dismiss()
        }}
        className="relative z-10 mt-8 text-xs px-4 py-2 glass rounded-full transition-colors hover-media:hover:bg-white/10 opacity-60"
        style={{ color: bgImage ? "rgba(255,255,255,0.8)" : "var(--color-text-muted)" }}
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
          className="absolute rounded-full effect-animate"
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
