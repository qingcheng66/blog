"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Search, SlidersHorizontal } from "lucide-react"
import { MagneticWrapper } from "@/components/magnetic-wrapper"
import { useAccentHue, PRESET_COLORS } from "@/hooks/use-accent-hue"
import { site } from "@/data/site"

const NAV_LINKS = [
  { href: "/", label: "首页" },
  { href: "/articles", label: "文章" },
  { href: "/thoughts", label: "碎碎念" },
  { href: "/projects", label: "项目" },
  { href: "/gallery", label: "相册" },
  { href: "/about", label: "关于" },
]

export function GlassHeader() {
  const pathname = usePathname()
  const headerRef = useRef<HTMLElement>(null)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [sliderOpen, setSliderOpen] = useState(false)
  const sliderRef = useRef<HTMLDivElement>(null)
  const { accent, setAccent, saturation, setSaturation, lightness, setLightness } = useAccentHue()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    if (menuOpen) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => { document.body.style.overflow = "" }
  }, [menuOpen])

  // Close slider panel on outside click
  useEffect(() => {
    if (!sliderOpen) return
    const onPointerDown = (e: PointerEvent) => {
      if (sliderRef.current && !sliderRef.current.contains(e.target as Node)) {
        setSliderOpen(false)
      }
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [sliderOpen])

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-50 flex items-center transition-all duration-300"
      style={{
        height: `calc(var(--header-height) + env(safe-area-inset-top, 0px))`,
        paddingTop: "env(safe-area-inset-top, 0px)",
        background: scrolled ? "var(--glass-bg-strong)" : "transparent",
        backdropFilter: scrolled ? "blur(var(--glass-blur))" : "none",
        WebkitBackdropFilter: scrolled ? "blur(var(--glass-blur))" : "none",
        borderBottom: scrolled ? "1px solid var(--color-border)" : "1px solid transparent",
      }}
    >
      <div className="mx-auto flex h-full w-full max-w-4xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <MagneticWrapper strength={0.2}>
          <Link
            href="/"
            className="text-lg font-bold tracking-tight"
            style={{ color: "var(--color-accent)" }}
          >
            {site.name} · Lab
          </Link>
        </MagneticWrapper>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((item) => (
            <MagneticWrapper key={item.label} strength={0.15}>
              <Link
                href={item.href}
                className="px-3 py-1.5 text-sm rounded-md transition-colors"
                style={{
                  color: pathname === item.href ? "var(--color-text)" : "var(--color-text-secondary)",
                  background: pathname === item.href ? "rgba(255,255,255,0.06)" : "transparent",
                }}
              >
                {item.label}
              </Link>
            </MagneticWrapper>
          ))}

          {/* Search button */}
          <button
            className="ml-2 inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs transition-colors hover-media:hover:bg-white/5 min-w-[44px] min-h-[44px] justify-center"
            style={{
              borderColor: "var(--color-border-hover)",
              color: "var(--color-text-muted)",
            }}
            onClick={() => {
              // Dispatch custom event for search modal
              window.dispatchEvent(new CustomEvent("toggle-search"))
            }}
            aria-label="搜索 (Ctrl+K)"
          >
            <Search size={13} />
            <span>Ctrl+K</span>
          </button>

          {/* Accent color dots */}
          <div className="flex items-center gap-1 mx-1">
            {PRESET_COLORS.map(({ hex, label }) => {
              const isActive = hex.toLowerCase() === accent.toLowerCase()
              return (
                <button
                  key={hex}
                  onClick={() => setAccent(hex)}
                  title={label}
                  className="rounded-full transition-all duration-200 hover-media:hover:scale-125 flex items-center justify-center"
                  style={{
                    width: "14px",
                    height: "14px",
                    minWidth: "14px",
                    minHeight: "14px",
                    backgroundColor: hex,
                    border: isActive ? "2px solid white" : "2px solid transparent",
                    boxShadow: isActive ? `0 0 8px ${hex}99` : "none",
                    outline: "none",
                  }}
                  aria-label={`主题色：${label}`}
                />
              )
            })}
          </div>

          {/* Background sliders toggle */}
          <div className="relative" ref={sliderRef}>
            <button
              onClick={() => setSliderOpen(!sliderOpen)}
              className="mx-1 p-2 rounded-md transition-colors hover-media:hover:bg-white/5 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="背景饱和度/亮度调节"
              style={{
                color: sliderOpen ? "var(--color-accent)" : "var(--color-text-muted)",
              }}
            >
              <SlidersHorizontal size={15} />
            </button>

            {/* Slider dropdown */}
            {sliderOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-56 sm:w-64 p-4 rounded-xl flex flex-col gap-4 z-50"
                style={{
                  background: "var(--glass-bg-strong)",
                  backdropFilter: "blur(var(--glass-blur))",
                  WebkitBackdropFilter: "blur(var(--glass-blur))",
                  border: "1px solid var(--color-border-hover)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                }}
              >
                {/* Saturation slider */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                      饱和度
                    </span>
                    <span className="text-xs font-mono" style={{ color: "var(--color-accent)" }}>
                      {saturation}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={60}
                    value={saturation}
                    onChange={(e) => setSaturation(parseInt(e.target.value, 10))}
                  />
                </div>

                {/* Lightness slider */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                      亮度
                    </span>
                    <span className="text-xs font-mono" style={{ color: "var(--color-accent)" }}>
                      {lightness}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={3}
                    max={40}
                    value={lightness}
                    onChange={(e) => setLightness(parseInt(e.target.value, 10))}
                  />
                </div>
              </div>
            )}
          </div>

        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-md"
          aria-label="菜单"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div
          className="fixed inset-0 top-16 md:hidden z-40"
          style={{
            background: "var(--glass-bg-strong)",
            backdropFilter: "blur(var(--glass-blur))",
            WebkitBackdropFilter: "blur(var(--glass-blur))",
            border: "1px solid var(--color-border)",
          }}
          onClick={() => setMenuOpen(false)}
        >
          <nav className="flex flex-col p-6 gap-2" onClick={(e) => e.stopPropagation()}>
            {NAV_LINKS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="py-3 px-4 rounded-lg text-lg transition-colors"
                style={{
                  color: pathname === item.href ? "var(--color-accent)" : "var(--color-text-secondary)",
                  background: pathname === item.href ? "rgba(255,255,255,0.1)" : "transparent",
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
