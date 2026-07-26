"use client"

import { useRef } from "react"
import Link from "next/link"
import { useGSAP } from "@gsap/react"
import { gsap } from "@/lib/gsap"
import { Pin, Eye } from "lucide-react"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import type { Article } from "@/lib/content"

function formatIndex(i: number): string {
  return String(i + 1).padStart(2, "0")
}

export function ArticleFeed({ articles }: { articles: Article[] }) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useGSAP(() => {
    if (reducedMotion) return
    gsap.from(wrapperRef.current, {
      y: 40,
      opacity: 0,
      duration: 0.7,
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
      <style>{`
        .article-index-stroke {
          color: transparent;
          -webkit-text-stroke: 1.2px var(--color-accent);
          transition: all var(--duration-normal, 300ms);
          opacity: 0.5;
        }
        @media (hover: hover) {
          .article-row-card:hover .article-index-stroke {
            color: var(--color-accent);
            -webkit-text-fill-color: var(--color-accent);
            opacity: 1;
          }
          .article-row-card:hover .article-row-cover-img {
            transform: scale(1.08);
          }
          .article-row-card:hover .article-row-title {
            color: var(--color-accent) !important;
          }
        }
      `}</style>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold relative pl-4" style={{ color: "var(--color-text)" }}>
          <span
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-[18px] rounded-sm"
            style={{
              background: `linear-gradient(180deg, var(--color-accent), var(--color-accent-secondary))`,
            }}
          />
          近期笔记
        </h2>
      </div>

      <div
        className="relative overflow-hidden rounded-2xl p-4 h-[420px]"
        style={{ border: "1px solid var(--color-border)" }}
      >
        <div
          className="absolute right-2.5 top-1/2 -translate-y-1/2 -rotate-45 text-[3.5rem] font-bold uppercase tracking-widest pointer-events-none select-none whitespace-nowrap"
          style={{ color: "var(--color-accent)", opacity: 0.06 }}
        >
          ARTICLE
        </div>

        <div
          className="flex flex-col gap-3 h-full overflow-y-auto pr-2 relative z-10"
          style={{ scrollbarWidth: "thin" }}
        >
          {articles.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                还没有文章
              </span>
            </div>
          )}
          {articles.map((article, i) => (
            <Link
              key={article.slug}
              href={`/blog/${article.slug}`}
              className="article-row-card flex items-center gap-3 group pb-3 border-b border-dashed transition-all duration-150 hover-media:hover:translate-x-1"
              style={{
                borderBottomColor: article.pinned
                  ? "rgba(var(--color-accent-rgb), 0.15)"
                  : "var(--color-border)",
                borderBottomStyle: article.pinned ? "solid" : "dashed",
              }}
            >
              {article.pinned && (
                <span
                  className="absolute -top-0.5 right-0 z-10 transition-all duration-150 group-hover:scale-115 group-hover:-rotate-10"
                  style={{ color: "var(--color-accent)" }}
                >
                  <Pin size={18} />
                </span>
              )}

              <span className="article-index-stroke text-2xl font-extrabold italic flex-shrink-0 w-9 text-center">
                {formatIndex(i)}
              </span>

              <div
                className="w-20 h-14 rounded-lg overflow-hidden flex-shrink-0"
                style={{ border: "1px solid var(--color-border)" }}
              >
                <div
                  className="article-row-cover-img w-full h-full transition-transform duration-300"
                  style={{
                    background: `linear-gradient(135deg, var(--color-accent), var(--color-accent-secondary))`,
                    opacity: 0.3,
                  }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <h3
                  className="article-row-title text-sm font-medium truncate transition-colors duration-150"
                  style={{ color: "var(--color-text)" }}
                >
                  {article.title}
                </h3>
                <p className="text-xs truncate mt-1" style={{ color: "var(--color-text-muted)" }}>
                  {article.description}
                </p>
              </div>

              <span className="text-xs italic flex-shrink-0 ml-auto flex items-center gap-1" style={{ color: "#888" }}>
                <Eye size={12} />
                {article.views}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
