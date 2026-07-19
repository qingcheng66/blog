"use client"

import { useState, useCallback } from "react"
import { X, ZoomIn } from "lucide-react"

interface LightboxImageProps {
  src: string
  alt: string
  className?: string
}

export function LightboxImage({ src, alt, className = "" }: LightboxImageProps) {
  const [open, setOpen] = useState(false)

  const handleClose = useCallback(() => setOpen(false), [])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative group cursor-zoom-in"
        aria-label={`放大图片: ${alt}`}
      >
        <img src={src} alt={alt} className={className} loading="lazy" />
        <div className="absolute top-2 right-2 size-7 rounded-full bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn className="size-3.5 text-foreground" />
        </div>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={handleClose}
          role="dialog"
          aria-modal="true"
          aria-label={alt}
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 size-10 rounded-full bg-background/20 flex items-center justify-center hover:bg-background/40 transition-colors"
            aria-label="关闭"
          >
            <X className="size-5 text-white" />
          </button>
          <img
            src={src}
            alt={alt}
            className="max-h-[85vh] max-w-[90vw] rounded-lg shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
