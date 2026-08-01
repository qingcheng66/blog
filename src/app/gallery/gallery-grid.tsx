"use client"

import { useRef } from "react"
import { useGSAP } from "@gsap/react"
import { gsap } from "@/lib/gsap"
import { Camera } from "lucide-react"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { LightboxImage } from "@/components/lightbox"
import type { GalleryItem } from "@/lib/content"

const DEFAULT_ALBUM = "未分类"

/** 按 album 分组，保持首次出现顺序；无 album 的项归入「未分类」组 */
function groupByAlbum(images: GalleryItem[]): { album: string; items: GalleryItem[] }[] {
  const order: string[] = []
  const groups = new Map<string, GalleryItem[]>()
  for (const item of images) {
    const key = item.album?.trim() || DEFAULT_ALBUM
    if (!groups.has(key)) {
      groups.set(key, [])
      order.push(key)
    }
    groups.get(key)!.push(item)
  }
  return order.map((album) => ({ album, items: groups.get(album)! }))
}

export function GalleryGrid({ images }: { images: GalleryItem[] }) {
  const groups = groupByAlbum(images)
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
        .gallery-item button {
          display: block;
          width: 100%;
          height: 100%;
        }
      `}</style>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--color-text)" }}>
          相册
        </h1>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          生活中的瞬间 · 照片与图像记录
        </p>
      </div>

      {images.length === 0 && (
        <div className="col-span-full flex flex-col items-center justify-center py-16 gap-4 rounded-2xl" style={{ background: "var(--glass-bg-strong)", border: "1px solid var(--color-border)" }}>
          <div
            className="rounded-full p-4"
            style={{ background: "rgba(var(--color-accent-rgb), 0.06)" }}
          >
            <Camera size={32} style={{ color: "var(--color-accent)", opacity: 0.5 }} />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
              相册还是空的
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
              记录下生活中的美好瞬间吧
            </p>
          </div>
        </div>
      )}

      {groups.map(({ album, items }) => (
        <div key={album} className="mb-10">
          <div
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium backdrop-blur-md"
            style={{ background: "var(--glass-bg)", border: "1px solid var(--color-accent)" }}
          >
            <span className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
              {album}
            </span>
            <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              {items.length} 张
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="gallery-item rounded-xl aspect-square overflow-hidden cursor-pointer"
                style={{ background: "var(--glass-bg-strong)" }}
              >
                {item.src ? (
                  <LightboxImage src={item.src} alt={item.label} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                    <Camera size={32} style={{ color: "var(--color-text-muted)", opacity: 0.4 }} />
                    <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                      {item.label}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}
