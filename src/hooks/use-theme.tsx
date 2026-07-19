"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"

type Theme = "light" | "dark"
type ResolvedTheme = Theme
type ThemeProviderProps = {
  children: ReactNode
  defaultTheme?: Theme | "system"
  storageKey?: string
}

interface ThemeContextValue {
  theme: Theme | "system"
  resolvedTheme: ResolvedTheme | undefined
  setTheme: (theme: Theme | "system") => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function getStoredTheme(storageKey: string): Theme | "system" | null {
  if (typeof window === "undefined") return null
  try {
    const stored = localStorage.getItem(storageKey)
    if (stored === "light" || stored === "dark" || stored === "system") return stored
  } catch {}
  return null
}

function applyTheme(resolved: Theme) {
  const root = document.documentElement
  root.classList.remove("light", "dark")
  root.classList.add(resolved)
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme | "system">(defaultTheme ?? "system")
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme | undefined>(undefined)
  const [mounted, setMounted] = useState(false)

  // Initialize from localStorage on mount
  useEffect(() => {
    const stored = getStoredTheme(storageKey)
    const initial = stored ?? defaultTheme
    setThemeState(initial)
    const resolved = initial === "system" ? getSystemTheme() : initial
    setResolvedTheme(resolved)
    applyTheme(resolved)
    setMounted(true)
  }, [defaultTheme, storageKey])

  // Listen for system theme changes
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = () => {
      if (theme === "system") {
        const resolved = getSystemTheme()
        setResolvedTheme(resolved)
        applyTheme(resolved)
      }
    }
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [theme])

  const setTheme = useCallback(
    (newTheme: Theme | "system") => {
      setThemeState(newTheme)
      try {
        localStorage.setItem(storageKey, newTheme)
      } catch {}
      const resolved = newTheme === "system" ? getSystemTheme() : newTheme
      setResolvedTheme(resolved)
      applyTheme(resolved)
    },
    [storageKey],
  )

  // Prevent flash: render children only after mount on client
  // Server renders with defaultTheme, client hydrates and immediately corrects
  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme: mounted ? resolvedTheme : undefined, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider")
  return ctx
}
