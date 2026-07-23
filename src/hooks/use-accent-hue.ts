"use client"

import { useCallback, useEffect, useRef, useState } from "react"

// Serenity 核心：hex 颜色 → HSL → 色相差值计算背景色
// 来源: /tmp/wangxinyang.html applyAccent() 函数

type HSL = { h: number; s: number; l: number }

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!m) return null
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) }
}

function hexToRgbString(hex: string): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return "255, 121, 198"
  return `${rgb.r}, ${rgb.g}, ${rgb.b}`
}

function hexToHsl(hex: string): HSL | null {
  const rgb = hexToRgb(hex)
  if (!rgb) return null
  const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

export const DEFAULT_ACCENT = "#FF79C6" // 品红 — Serenity 默认色
export const STORAGE_KEY = "serenity-accent"
export const SAT_KEY = "serenity-bg-sat"
export const LIT_KEY = "serenity-bg-lit"
export const DEFAULT_SAT = 20
export const DEFAULT_LIT = 9
export const SAT_MIN = 5
export const SAT_MAX = 60
export const LIT_MIN = 3
export const LIT_MAX = 40

export const PRESET_COLORS = [
  { hex: "#FF79C6", label: "品红" },
  { hex: "#50FA7B", label: "青绿" },
  { hex: "#8BE9FD", label: "天蓝" },
  { hex: "#FFB86C", label: "暖橙" },
  { hex: "#BD93F9", label: "紫罗兰" },
  { hex: "#FF5555", label: "赤红" },
]

export function applyAccent(hex: string, bgSat = DEFAULT_SAT, bgLit = DEFAULT_LIT) {
  const root = document.documentElement
  const hsl = hexToHsl(hex)
  const rgbStr = hexToRgbString(hex)

  root.style.setProperty("--color-accent", hex)
  root.style.setProperty("--color-accent-rgb", rgbStr)

  if (hsl) {
    const h = hsl.h
    const s = hsl.s
    const l = hsl.l

    // Secondary accent: hue + 20°
    const sh = (h + 20) % 360
    root.style.setProperty("--color-accent-secondary", `hsl(${sh}, ${s}%, ${l}%)`)
    root.style.setProperty("--color-accent-secondary-rgb", hexToRgbString(hslToHex(sh, s, l)))

    // 背景色：色相跟随 accent，饱和度 + 亮度由用户 slider 控制
    root.style.setProperty("--color-bg", `hsl(${h}, ${bgSat}%, ${bgLit}%)`)
    root.style.setProperty("--color-bg-soft", `hsl(${(h + 15) % 360}, ${Math.max(0, bgSat - 4)}%, ${Math.max(0, bgLit - 2)}%)`)
    root.style.setProperty("--color-bg-mute", `hsl(${(h + 10) % 360}, ${Math.max(0, bgSat - 6)}%, ${bgLit + 5}%)`)
  }
}

function hslToHex(h: number, s: number, l: number): string {
  const a = s / 100 * Math.min(l / 100, 1 - l / 100)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l / 100 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))
    return Math.round(255 * color).toString(16).padStart(2, "0")
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

export function useAccentHue(initialAccent = DEFAULT_ACCENT) {
  const initialized = useRef(false)
  const [accent, setAccentState] = useState(initialAccent)
  const [saturation, setSaturationState] = useState(DEFAULT_SAT)
  const [lightness, setLightnessState] = useState(DEFAULT_LIT)

  const setAccent = useCallback((hex: string) => {
    try { localStorage.setItem(STORAGE_KEY, hex) } catch {}
    setAccentState(hex)
  }, [])

  const setSaturation = useCallback((sat: number) => {
    try { localStorage.setItem(SAT_KEY, String(sat)) } catch {}
    setSaturationState(sat)
  }, [])

  const setLightness = useCallback((lit: number) => {
    try { localStorage.setItem(LIT_KEY, String(lit)) } catch {}
    setLightnessState(lit)
  }, [])

  // Apply accent + background whenever accent, sat, or lit changes
  useEffect(() => {
    applyAccent(accent, saturation, lightness)
  }, [accent, saturation, lightness])

  // 初始化：从 localStorage 恢复 accent / sat / lit
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    let target = initialAccent
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) target = stored
    } catch {}

    let sat = DEFAULT_SAT
    try {
      const stored = localStorage.getItem(SAT_KEY)
      if (stored) sat = parseInt(stored, 10)
    } catch {}

    let lit = DEFAULT_LIT
    try {
      const stored = localStorage.getItem(LIT_KEY)
      if (stored) lit = parseInt(stored, 10)
    } catch {}

    if (target !== accent) setAccentState(target)
    if (sat !== DEFAULT_SAT) setSaturationState(sat)
    if (lit !== DEFAULT_LIT) setLightnessState(lit)

    applyAccent(target, sat, lit)
  }, [initialAccent]) // eslint-disable-line react-hooks/exhaustive-deps

  return { accent, setAccent, saturation, setSaturation, lightness, setLightness }
}
