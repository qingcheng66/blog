"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { PRESET_COLORS, SAT_MIN, SAT_MAX, LIT_MIN, LIT_MAX } from "@/hooks/use-accent-hue"

interface BgStyleSheetProps {
  open: boolean
  onClose: () => void
  accent: string
  setAccent: (hex: string) => void
  saturation: number
  setSaturation: (sat: number) => void
  lightness: number
  setLightness: (lit: number) => void
}

export function BgStyleSheet({
  open,
  onClose,
  accent,
  setAccent,
  saturation,
  setSaturation,
  lightness,
  setLightness,
}: BgStyleSheetProps) {
  const [mounted, setMounted] = useState(false)
  const [active, setActive] = useState(false)

  useEffect(() => {
    if (open) {
      setMounted(true)
      requestAnimationFrame(() => setActive(true))
    } else {
      setActive(false)
      const timer = setTimeout(() => setMounted(false), 300)
      return () => clearTimeout(timer)
    }
  }, [open])

  // Body scroll lock
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  if (!mounted) return null

  return (
    <div
      className="fixed inset-0 z-[60] md:hidden"
      style={{
        background: active ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0)",
        transition: `background var(--duration-normal) var(--ease-out)`,
      }}
      onClick={onClose}
    >
      {/* Sheet panel */}
      <div
        className="absolute bottom-0 left-0 right-0 rounded-t-2xl p-6 pt-4"
        style={{
          background: "var(--glass-bg-strong)",
          backdropFilter: "blur(var(--glass-blur))",
          WebkitBackdropFilter: "blur(var(--glass-blur))",
          border: "1px solid var(--color-border-hover)",
          borderBottom: "none",
          boxShadow: "0 -8px 32px rgba(0,0,0,0.4)",
          transform: active ? "translateY(0)" : "translateY(100%)",
          transition: `transform var(--duration-normal) var(--ease-out)`,
          paddingBottom: `calc(1.5rem + env(safe-area-inset-bottom, 0px))`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center mb-4">
          <div
            className="w-10 h-1 rounded-full"
            style={{ background: "var(--color-border-hover)" }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <span className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
            外观调整
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-md transition-colors"
            style={{ color: "var(--color-text-muted)" }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Accent color dots: 28px for touch */}
        <div className="mb-5">
          <span className="text-xs mb-2 block" style={{ color: "var(--color-text-muted)" }}>
            主题色
          </span>
          <div className="flex items-center gap-3 mt-2">
            {PRESET_COLORS.map(({ hex, label }) => {
              const isActive = hex.toLowerCase() === accent.toLowerCase()
              return (
                <button
                  key={hex}
                  onClick={() => setAccent(hex)}
                  title={label}
                  className="rounded-full transition-all duration-200 flex items-center justify-center"
                  style={{
                    width: "28px",
                    height: "28px",
                    backgroundColor: hex,
                    border: isActive ? "2px solid white" : "2px solid transparent",
                    boxShadow: isActive ? `0 0 12px ${hex}99` : "none",
                    outline: "none",
                  }}
                  aria-label={`主题色：${label}`}
                />
              )
            })}
          </div>
        </div>

        {/* Saturation slider */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              背景饱和度
            </span>
            <span className="text-xs font-mono" style={{ color: "var(--color-accent)" }}>
              {saturation}%
            </span>
          </div>
          <input
            type="range"
            min={SAT_MIN}
            max={SAT_MAX}
            value={saturation}
            onChange={(e) => setSaturation(parseInt(e.target.value, 10))}
          />
        </div>

        {/* Lightness slider */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              背景亮度
            </span>
            <span className="text-xs font-mono" style={{ color: "var(--color-accent)" }}>
              {lightness}%
            </span>
          </div>
          <input
            type="range"
            min={LIT_MIN}
            max={LIT_MAX}
            value={lightness}
            onChange={(e) => setLightness(parseInt(e.target.value, 10))}
          />
        </div>
      </div>
    </div>
  )
}
