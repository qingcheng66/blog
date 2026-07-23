"use client"

import { useRef } from "react"
import { useGSAP } from "@gsap/react"
import { gsap } from "@/lib/gsap"
import { Image } from "lucide-react"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

// 在 public/images/gallery/ 下放置图片后，将路径加入此数组
const GALLERY_IMAGES: { id: number; src: string; label: string }[] = [
  // 示例：{ id: 1, src: "/images/gallery/photo-1.jpg", label: "照片标题" },
]

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
        {GALLERY_IMAGES.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 gap-3 rounded-2xl" style={{ background: "var(--glass-bg-strong)", border: "1px solid var(--color-border)" }}>
            <Image size={36} style={{ color: "var(--color-text-muted)", opacity: 0.4 }} />
            <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              还没有照片
            </span>
            <span className="text-xs text-center" style={{ color: "var(--color-text-muted)", opacity: 0.5 }}>
              将图片放入 <code style={{ color: "var(--color-accent)" }}>public/images/gallery/</code>，
              然后在 <code style={{ color: "var(--color-accent)" }}>gallery-grid.tsx</code> 的
              <code style={{ color: "var(--color-accent)" }}>GALLERY_IMAGES</code> 数组中添加路径
            </span>
          </div>
        )}
        {GALLERY_IMAGES.map((item) => (
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
