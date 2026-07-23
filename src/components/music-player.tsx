"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { Music, Play, Pause } from "lucide-react"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

const VOLUME_KEY = "serenity-music-volume"
const DEFAULT_VOLUME = 0.5

// Format seconds to m:ss
function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds <= 0) return "0:00"
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const spectrumConnectedRef = useRef(false)
  const spectrumRafRef = useRef<number>(0)
  const barsRef = useRef<HTMLDivElement>(null)
  const progressFillRef = useRef<HTMLDivElement>(null)
  const lastTimeUpdateRef = useRef(0)

  const [isPlaying, setIsPlaying] = useState(false)
  const [isExpanded, setExpanded] = useState(false)
  const [volume, setVolume] = useState(DEFAULT_VOLUME)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const knobRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  // Init audio element + restore volume
  useEffect(() => {
    const audio = new Audio("/music/bg.mp3")
    audio.loop = true
    audio.preload = "auto"
    audioRef.current = audio

    let v = DEFAULT_VOLUME
    try {
      const stored = localStorage.getItem(VOLUME_KEY)
      if (stored !== null) v = parseFloat(stored)
    } catch {}
    audio.volume = v
    setVolume(v)

    return () => {
      audio.pause()
      audio.src = ""
      audioRef.current = null
      // Cleanup audio context
      if (spectrumRafRef.current) cancelAnimationFrame(spectrumRafRef.current)
      if (sourceRef.current) { try { sourceRef.current.disconnect() } catch {} }
      if (analyserRef.current) { try { analyserRef.current.disconnect() } catch {} }
      if (audioCtxRef.current) { audioCtxRef.current.close().catch(() => {}) }
    }
  }, [])

  // Sync audio events + timeupdate
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onTimeUpdate = () => {
      // Direct DOM: smooth progress bar
      if (progressFillRef.current && audio.duration > 0) {
        const pct = (audio.currentTime / audio.duration) * 100
        progressFillRef.current.style.width = `${pct}%`
      }
      // Throttled React state for time labels (~4fps)
      const now = Date.now()
      if (now - lastTimeUpdateRef.current > 250) {
        lastTimeUpdateRef.current = now
        setCurrentTime(audio.currentTime)
        setDuration(audio.duration)
      }
    }
    const onLoadedMeta = () => {
      setDuration(audio.duration)
    }
    audio.addEventListener("play", onPlay)
    audio.addEventListener("pause", onPause)
    audio.addEventListener("timeupdate", onTimeUpdate)
    audio.addEventListener("loadedmetadata", onLoadedMeta)
    return () => {
      audio.removeEventListener("play", onPlay)
      audio.removeEventListener("pause", onPause)
      audio.removeEventListener("timeupdate", onTimeUpdate)
      audio.removeEventListener("loadedmetadata", onLoadedMeta)
    }
  }, [])

  // Initialize Web Audio spectrum analyser
  const initSpectrum = useCallback(() => {
    const audio = audioRef.current
    if (!audio || spectrumConnectedRef.current) return
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      audioCtxRef.current = audioCtx
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 64
      analyser.smoothingTimeConstant = 0.85
      analyserRef.current = analyser
      const source = audioCtx.createMediaElementSource(audio)
      source.connect(analyser)
      analyser.connect(audioCtx.destination)
      sourceRef.current = source
      spectrumConnectedRef.current = true
      if (audioCtx.state === "suspended") audioCtx.resume()
    } catch {
      // createMediaElementSource already called — ignore
    }
  }, [])

  // Spectrum animation loop
  const startSpectrumLoop = useCallback(() => {
    const analyser = analyserRef.current
    const bars = barsRef.current
    if (!analyser || !bars) return
    if (spectrumRafRef.current) cancelAnimationFrame(spectrumRafRef.current)
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    const childBars = Array.from(bars.children) as HTMLElement[]
    const step = Math.max(1, Math.floor(bufferLength / childBars.length))

    const draw = () => {
      spectrumRafRef.current = requestAnimationFrame(draw)
      analyser.getByteFrequencyData(dataArray)
      for (let i = 0, barIdx = 0; i < bufferLength && barIdx < childBars.length; i += step, barIdx++) {
        const value = dataArray[i]
        const h = Math.max(3, (value / 255) * 32)
        childBars[barIdx].style.height = `${h}px`
        childBars[barIdx].style.opacity = `${0.3 + (value / 255) * 0.7}`
      }
    }
    draw()
  }, [])

  const stopSpectrumLoop = useCallback(() => {
    if (spectrumRafRef.current) {
      cancelAnimationFrame(spectrumRafRef.current)
      spectrumRafRef.current = 0
    }
    if (barsRef.current) {
      for (const bar of barsRef.current.children) {
        (bar as HTMLElement).style.height = "3px"
        ;(bar as HTMLElement).style.opacity = "0.3"
      }
    }
  }, [])

  // Start/stop spectrum on expand or reduced motion change
  useEffect(() => {
    if (isExpanded && !reducedMotion) {
      initSpectrum()
      startSpectrumLoop()
    } else {
      stopSpectrumLoop()
    }
    return () => stopSpectrumLoop()
  }, [isExpanded, reducedMotion, initSpectrum, startSpectrumLoop, stopSpectrumLoop])

  // Play/pause toggle
  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (!hasInteracted) {
      setHasInteracted(true)
      initSpectrum()
    }
    if (isPlaying) {
      audio.pause()
    } else {
      audio.play().catch(() => {})
    }
  }, [isPlaying, hasInteracted, initSpectrum])

  // Apply volume
  const applyVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v))
    setVolume(clamped)
    if (audioRef.current) audioRef.current.volume = clamped
    try { localStorage.setItem(VOLUME_KEY, String(clamped)) } catch {}
  }, [])

  // Circular knob — angle computation
  const computeAngle = useCallback((clientX: number, clientY: number): number => {
    const el = knobRef.current
    if (!el) return 0
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    let angle = Math.atan2(-(clientY - cy), clientX - cx) * (180 / Math.PI)
    return ((angle % 360) + 360) % 360
  }, [])

  const angleToVolume = useCallback((angle: number): number => {
    const START = 210  // ~7 o'clock = 0
    let norm = angle - START
    if (norm < 0) norm += 360
    return Math.max(0, Math.min(1, norm / 300))
  }, [])

  // Knob pointer handlers
  const handleKnobDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    setIsDragging(true)
    applyVolume(angleToVolume(computeAngle(e.clientX, e.clientY)))
  }, [applyVolume, angleToVolume, computeAngle])

  useEffect(() => {
    if (!isDragging) return
    const onMove = (e: PointerEvent) => {
      applyVolume(angleToVolume(computeAngle(e.clientX, e.clientY)))
    }
    const onUp = () => setIsDragging(false)
    document.addEventListener("pointermove", onMove)
    document.addEventListener("pointerup", onUp)
    return () => {
      document.removeEventListener("pointermove", onMove)
      document.removeEventListener("pointerup", onUp)
    }
  }, [isDragging, applyVolume, angleToVolume, computeAngle])

  // Progress bar seek
  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    if (!audio || audio.duration <= 0) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    audio.currentTime = ratio * audio.duration
  }, [])

  // Close panel on outside click
  useEffect(() => {
    if (!isExpanded) return
    const onPointerDown = (e: PointerEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setExpanded(false)
      }
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [isExpanded])

  // Circular knob SVG values
  const arcR = 18
  const circumference = 2 * Math.PI * arcR
  const arcDeg = 300
  const arcLen = circumference * (arcDeg / 360)
  const dashOffset = arcLen * (1 - volume)

  return (
    <div
      className="fixed z-40 flex flex-col items-end gap-3
        bottom-6 right-6
        max-md:right-1/2 max-md:translate-x-1/2 max-md:items-center"
      ref={panelRef}
      style={{
        bottom: `calc(1.5rem + env(safe-area-inset-bottom, 0px))`,
      }}
    >
      {/* Expanded panel */}
      {isExpanded && (
        <div
          className="flex flex-col gap-3 rounded-xl px-4 py-3 w-[260px] max-w-[calc(100vw-2rem)]"
          style={{
            background: "var(--glass-bg-strong)",
            backdropFilter: "blur(var(--glass-blur))",
            WebkitBackdropFilter: "blur(var(--glass-blur))",
            border: "1px solid var(--color-border-hover)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          {/* Track name */}
          <span className="text-xs truncate" style={{ color: "var(--color-text-muted)" }}>
            背景音乐
          </span>

          {/* Progress bar */}
          <div
            className="relative w-full cursor-pointer group flex items-center"
            style={{ height: "16px" }}
            onClick={handleSeek}
            role="slider"
            aria-label="播放进度"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={duration > 0 ? Math.round((currentTime / duration) * 100) : 0}
          >
            <div
              className="absolute left-0 right-0 rounded-full"
              style={{ height: "4px", background: "var(--color-border-hover)" }}
            />
            <div
              ref={progressFillRef}
              className="absolute left-0 rounded-full pointer-events-none transition-[width] duration-[50ms]"
              style={{
                height: "4px",
                width: "0%",
                background: "var(--color-accent)",
                boxShadow: "0 0 6px rgba(var(--color-accent-rgb), 0.5)",
              }}
            />
          </div>

          {/* Time */}
          <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          {/* Controls row: play, spectrum, knob */}
          <div className="flex items-center justify-between mt-1">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="flex items-center justify-center rounded-full transition-colors flex-shrink-0"
              style={{
                width: "36px",
                height: "36px",
                color: "var(--color-accent)",
                background: "rgba(var(--color-accent-rgb), 0.12)",
              }}
              aria-label={isPlaying ? "暂停" : "播放"}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>

            {/* Spectrum bars */}
            <div
              ref={barsRef}
              className="flex items-end gap-[2px]"
              style={{ height: "36px" }}
            >
              {Array.from({ length: 16 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-full"
                  style={{
                    width: "3px",
                    height: "3px",
                    minHeight: "3px",
                    backgroundColor: "var(--color-accent)",
                    opacity: 0.3,
                    transition: "none",
                  }}
                />
              ))}
            </div>

            {/* Circular volume knob */}
            <div
              ref={knobRef}
              onPointerDown={handleKnobDown}
              className="flex-shrink-0 flex items-center justify-center"
              style={{
                width: "44px",
                height: "44px",
                cursor: "pointer",
                touchAction: "none",
              }}
              aria-label="音量调节"
              role="slider"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(volume * 100)}
            >
              <svg width="44" height="44" viewBox="0 0 44 44">
                {/* Background track */}
                <circle cx="22" cy="22" r={arcR} fill="none"
                  stroke="var(--color-border-hover)" strokeWidth="3.5" />
                {/* Filled arc */}
                <g style={{ transform: "rotate(-135deg)", transformOrigin: "22px 22px" }}>
                  <circle cx="22" cy="22" r={arcR} fill="none"
                    stroke="var(--color-accent)" strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeDasharray={`${arcLen.toFixed(2)} ${circumference.toFixed(2)}`}
                    strokeDashoffset={dashOffset.toFixed(2)}
                    style={{
                      filter: "drop-shadow(0 0 4px rgba(var(--color-accent-rgb), 0.5))",
                      transition: isDragging ? "none" : "stroke-dashoffset 0.15s ease",
                    }}
                  />
                </g>
                {/* Inner dot */}
                <circle cx="22" cy="22" r="8" fill="var(--glass-bg-strong)"
                  stroke="var(--color-border-hover)" strokeWidth="1.5" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Floating toggle button */}
      <button
        onClick={() => setExpanded(!isExpanded)}
        className="rounded-full flex items-center justify-center transition-all duration-300"
        style={{
          width: "48px",
          height: "48px",
          background: isExpanded
            ? "rgba(var(--color-accent-rgb), 0.2)"
            : "var(--glass-bg-strong)",
          backdropFilter: "blur(var(--glass-blur))",
          WebkitBackdropFilter: "blur(var(--glass-blur))",
          border: isExpanded
            ? "1px solid rgba(var(--color-accent-rgb), 0.4)"
            : "1px solid var(--color-border-hover)",
          boxShadow: isExpanded
            ? "0 0 16px rgba(var(--color-accent-rgb), 0.25)"
            : "0 4px 16px rgba(0,0,0,0.3)",
          opacity: hasInteracted ? 1 : 0.7,
          animation: isPlaying && !reducedMotion ? "music-spin 3s linear infinite" : "none",
        }}
        aria-label={isExpanded ? "收起播放器" : "展开播放器"}
      >
        <Music
          size={20}
          style={{
            color: isExpanded ? "var(--color-accent)" : "var(--color-text-secondary)",
            transition: "color 0.3s ease",
          }}
        />
      </button>

      {/* Spin keyframes */}
      <style>{`
        @keyframes music-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
