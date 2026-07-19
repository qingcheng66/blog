"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { X, ZoomIn } from "lucide-react"

interface LightboxImageProps {
  src: string
  alt: string
  className?: string
}

export function LightboxImage({ src, alt, className = "" }: LightboxImageProps) {
  const [open, setOpen] = useState(false)
  const touchStartY = useRef(0)

  const handleOpen = useCallback(() => setOpen(true), [])
  const handleClose = useCallback(() => setOpen(false), [])

  // Body scroll lock when lightbox is open
  useEffect(() => {
    if (open) {
      const scrollY = window.scrollY
      document.body.style.position = "fixed"
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = "100%"
      return () => {
        document.body.style.position = ""
        document.body.style.top = ""
        document.body.style.width = ""
        window.scrollTo(0, scrollY)
      }
    }
  }, [open])

  // Swipe-to-dismiss on touch devices
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
  }, [])

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const deltaY = e.changedTouches[0].clientY - touchStartY.current
      if (deltaY > 80) {
        handleClose()
      }
    },
    [handleClose],
  )

  return (
    <>
      <button
        onClick={handleOpen}
        className="relative group cursor-zoom-in"
        aria-label={`放大图片: ${alt}`}
      >
        <img src={src} alt={alt} className={className} loading="lazy" />
        <div className="absolute top-2 right-2 size-7 rounded-full bg-background/80 flex items-center justify-center opacity-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <ZoomIn className="size-3.5 text-foreground" />
        </div>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={handleClose}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          role="dialog"
          aria-modal="true"
          aria-label={alt}
        >
          <button
            onClick={handleClose}
            className="absolute top-[calc(1rem+env(safe-area-inset-top,0px))] right-[calc(1rem+env(safe-area-inset-right,0px))] size-10 rounded-full bg-background/20 flex items-center justify-center hover:bg-background/40 transition-colors"
            aria-label="关闭"
          >
            <X className="size-5 text-white" />
          </button>
          <img
            src={src}
            alt={alt}
            className="max-h-[85vh] max-w-[90vw] rounded-lg shadow-2xl object-contain"
            style={{ touchAction: "pinch-zoom" }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
