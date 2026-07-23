"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { Music, Play, Pause, Volume2 } from "lucide-react"

const VOLUME_KEY = "serenity-music-volume"
const DEFAULT_VOLUME = 0.5

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isExpanded, setExpanded] = useState(false)
  const [volume, setVolume] = useState(DEFAULT_VOLUME)
  const [hasInteracted, setHasInteracted] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

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
    }
  }, [])

  // Sync audio events
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    audio.addEventListener("play", onPlay)
    audio.addEventListener("pause", onPause)
    return () => {
      audio.removeEventListener("play", onPlay)
      audio.removeEventListener("pause", onPause)
    }
  }, [])

  // Play/pause toggle — first play must be from user gesture
  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    if (!hasInteracted) setHasInteracted(true)

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play().catch(() => {
        // Browser blocked autoplay — ignore silently
      })
    }
  }, [isPlaying, hasInteracted])

  // Volume change
  const handleVolume = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value)
    setVolume(v)
    if (audioRef.current) audioRef.current.volume = v
    try {
      localStorage.setItem(VOLUME_KEY, String(v))
    } catch {}
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

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3" ref={panelRef}>
      {/* Expanded panel */}
      {isExpanded && (
        <div
          className="flex items-center gap-4 rounded-xl px-4 py-3"
          style={{
            background: "var(--glass-bg-strong)",
            backdropFilter: "blur(var(--glass-blur))",
            WebkitBackdropFilter: "blur(var(--glass-blur))",
            border: "1px solid var(--color-border-hover)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          {/* Play/Pause button */}
          <button
            onClick={togglePlay}
            className="flex items-center justify-center rounded-full transition-colors"
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

          {/* Vertical volume slider */}
          <div className="flex flex-col items-center gap-1.5">
            <Volume2
              size={13}
              style={{ color: "var(--color-text-muted)" }}
            />
            <div
              className="relative flex items-center justify-center"
              style={{ height: "80px", width: "24px" }}
            >
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={handleVolume}
                aria-label="音量"
                className="volume-vertical-slider"
                style={{
                  width: "80px",
                  transform: "rotate(-90deg)",
                  transformOrigin: "center center",
                }}
              />
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
          opacity: hasInteracted ? 1 : 0.45,
          animation: isPlaying ? "music-spin 3s linear infinite" : "none",
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
