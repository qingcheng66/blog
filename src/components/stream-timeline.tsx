"use client"

import { useRef } from "react"
import { useGSAP } from "@gsap/react"
import { gsap } from "@/lib/gsap"
import { streamItems } from "@/data/articles"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

export function StreamTimeline() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useGSAP(() => {
    if (reducedMotion) return
    gsap.from(wrapperRef.current, {
      y: 40,
      opacity: 0,
      duration: 0.7,
      delay: 0.2,
      ease: "power2.out",
      scrollTrigger: {
        trigger: wrapperRef.current,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    })
  }, { scope: wrapperRef, dependencies: [reducedMotion] })

  return (
    <section ref={wrapperRef} className="py-12 sm:py-16">
      {/* Inject styles for stream marker hover + object underline */}
      <style>{`
        @media (hover: hover) {
          .stream-row-card:hover .stream-marker-dot {
            background: var(--color-accent) !important;
            box-shadow: 0 0 0 4px rgba(var(--color-accent-rgb), 0.2);
          }
          .stream-row-card:hover .stream-object-link {
            color: var(--color-accent) !important;
          }
          .stream-object-link:hover::after {
            transform: scaleX(1);
          }
        }
        .stream-object-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 1px;
          background: var(--color-accent);
          transform: scaleX(0);
          transition: transform 150ms;
        }
      `}</style>

      {/* Section header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold relative pl-4" style={{ color: "var(--color-text)" }}>
          <span
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-[18px] rounded-sm"
            style={{
              background: `linear-gradient(180deg, var(--color-accent), var(--color-accent-secondary))`,
            }}
          />
          站点动态
        </h2>
        <div className="flex items-center gap-2 ml-4">
          <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>总访问 1,848</span>
          <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>·</span>
          <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>文章 19</span>
        </div>
      </div>

      {/* Timeline card */}
      <div
        className="relative overflow-hidden rounded-2xl h-[420px]"
        style={{ border: "1px solid var(--color-border)" }}
      >
        {/* Watermark */}
        <div
          className="absolute right-2.5 top-1/2 -translate-y-1/2 -rotate-45 text-[3.5rem] font-bold uppercase tracking-widest pointer-events-none select-none whitespace-nowrap z-0"
          style={{ color: "var(--color-accent)", opacity: 0.06 }}
        >
          TIMELINE
        </div>

        {/* Scrollable feed */}
        <div
          className="flex flex-col h-full overflow-y-auto py-4 pl-8 pr-4 relative z-10"
          style={{ scrollbarWidth: "thin" }}
        >
          {streamItems.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                还没有动态
              </span>
              <span className="text-xs" style={{ color: "var(--color-text-muted)", opacity: 0.5 }}>
                在 <code style={{ color: "var(--color-accent)" }}>src/data/articles.ts</code> 的
                <code style={{ color: "var(--color-accent)" }}>streamItems</code> 数组中添加动态
              </span>
            </div>
          )}
          {streamItems.map((item, i) => (
            <div
              key={i}
              className="stream-row-card relative flex items-center justify-between py-3 pl-4 group min-w-0"
              style={{
                borderBottom: i < streamItems.length - 1
                  ? "1px dashed var(--color-border)"
                  : "none",
              }}
            >
              {/* Left gradient line */}
              <span
                className="absolute left-0 top-0 bottom-0 w-[2px]"
                style={{
                  background: `linear-gradient(180deg, var(--color-accent), var(--color-accent-secondary))`,
                  ...(i === 0 ? { top: "50%", borderRadius: "1px 1px 0 0" } : {}),
                  ...(i === streamItems.length - 1 ? { bottom: "50%", borderRadius: "0 0 1px 1px" } : {}),
                }}
              />

              {/* Circular marker */}
              <span
                className="stream-marker-dot absolute left-[-5px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full z-10 transition-all duration-150"
                style={{
                  backgroundColor: "var(--color-bg-soft)",
                  border: "2px solid var(--color-accent)",
                }}
              />

              {/* Body */}
              <div className="flex items-center gap-1 text-[13px] leading-relaxed flex-1 min-w-0 overflow-hidden">
                <span className="flex-shrink-0" style={{ color: "var(--color-text-muted)" }}>
                  {item.verb}
                </span>
                <a
                  href={item.href}
                  className="stream-object-link font-medium truncate min-w-0 relative transition-colors duration-150"
                  style={{ color: "var(--color-text)" }}
                >
                  {item.target}
                </a>
              </div>

              {/* Time */}
              <span className="text-xs flex-shrink-0 ml-3" style={{ color: "var(--color-text-muted)" }}>
                {item.date}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
