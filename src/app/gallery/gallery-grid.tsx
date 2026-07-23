"use client"

import { useRef } from "react"
import { useGSAP } from "@gsap/react"
import { gsap } from "@/lib/gsap"
import { Image } from "lucide-react"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

// Placeholder gallery — user will add real images later
const GALLERY_PLACEHOLDERS = Array.from({ length: 6 }, (_, i) => ({
  id: i,
  label: `图 ${i + 1}`,
}))

export function GalleryGrid() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useGSAP(() => {
    if (reducedMotion) return
    gsap.from(wrapperRef.current?.querySelectorAll(".gallery-item") ?? [], {
      y: 30,
      stagger: 0.06,
      duration: 0.5,
      ease: "power2.out",
    })
  }, { scope: wrapperRef, dependencies: [reducedMotion] })

  return (
    <section ref={wrapperRef}>
      <style>{`
        .gallery-item {
          border: 1px solid var(--color-border);
          transition: all 0.3s ease;
        }
        @media (hover: hover) {
          .gallery-item:hover {
            border-color: rgba(var(--color-accent-rgb), 0.3);
            transform: translateY(-2px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          }
        }
      `}</style>

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--color-text)" }}>
          相册
        </h1>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          生活中的瞬间 · 照片与图像记录
        </p>
      </div>

      {/* Gallery grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {GALLERY_PLACEHOLDERS.map((item) => (
          <div
            key={item.id}
            className="gallery-item rounded-xl aspect-square flex flex-col items-center justify-center gap-2 cursor-pointer"
            style={{ background: "var(--glass-bg-strong)" }}
          >
            <Image size={32} style={{ color: "var(--color-text-muted)", opacity: 0.4 }} />
            <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
