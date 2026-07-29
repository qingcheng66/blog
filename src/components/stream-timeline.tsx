"use client"

import { useRef } from "react"
import { useGSAP } from "@gsap/react"
import { gsap } from "@/lib/gsap"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { ArrowUpRight } from "lucide-react"
import type { Thought } from "@/lib/content"

// ── 工具函数 ──

interface MonthGroup {
  year: number
  month: number
  label: string         // "2026年7月"
  items: Thought[]
}

interface ParsedDate {
  month: number
  day: number
  year?: number
  hour?: number
  minute?: number
}

/** 解析日期字符串，支持：
 *  "7月23日"           → { month: 7, day: 23 }
 *  "7月29日 14:30"     → { month: 7, day: 29, hour: 14, minute: 30 }
 *  "2026年7月23日"     → { year: 2026, month: 7, day: 23 }
 *  "2026年7月23日 09:15" → { year: 2026, month: 7, day: 23, hour: 9, minute: 15 }
 */
function parseDate(dateStr: string): ParsedDate | null {
  // 完整格式 "2026年7月23日 09:15"
  const full = dateStr.match(/(\d{4})年(\d+)月(\d+)日(?:\s+(\d{1,2}):(\d{2}))?/)
  if (full) {
    return {
      year: parseInt(full[1], 10),
      month: parseInt(full[2], 10),
      day: parseInt(full[3], 10),
      hour: full[4] !== undefined ? parseInt(full[4], 10) : undefined,
      minute: full[5] !== undefined ? parseInt(full[5], 10) : undefined,
    }
  }
  // 短格式 "7月23日" 或 "7月29日 14:30"
  const short = dateStr.match(/(\d+)月(\d+)日(?:\s+(\d{1,2}):(\d{2}))?/)
  if (short) {
    return {
      month: parseInt(short[1], 10),
      day: parseInt(short[2], 10),
      hour: short[3] !== undefined ? parseInt(short[3], 10) : undefined,
      minute: short[4] !== undefined ? parseInt(short[4], 10) : undefined,
    }
  }
  return null
}

/** 判断是否有可访问的外部链接 */
function hasExternalHref(href?: string): boolean {
  return !!href && href !== "#" && href !== ""
}

/** 按日期倒序分组：最新月份在最上面，同月按日→时→分倒序 */
function groupByMonth(all: Thought[]): MonthGroup[] {
  const sorted = [...all].sort((a, b) => {
    const da = parseDate(a.date)
    const db = parseDate(b.date)
    if (!da || !db) return 0
    if (da.month !== db.month) return db.month - da.month
    if (da.day !== db.day) return db.day - da.day
    // 同一天内，有时分的按时间倒序（没有时间的当 00:00）
    const aMin = (da.hour ?? 0) * 60 + (da.minute ?? 0)
    const bMin = (db.hour ?? 0) * 60 + (db.minute ?? 0)
    return bMin - aMin
  })

  const map = new Map<string, Thought[]>()
  const currentYear = new Date().getFullYear()
  for (const item of sorted) {
    const d = parseDate(item.date)
    if (!d) continue
    const year = d.year ?? currentYear
    const key = `${year}-${String(d.month).padStart(2, "0")}`
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(item)
  }

  const groups: MonthGroup[] = []
  for (const [key, items] of map) {
    const [year, month] = key.split("-").map(Number)
    groups.push({ year, month, label: `${year}年${month}月`, items })
  }

  // 按年月倒序
  groups.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year
    return b.month - a.month
  })

  return groups
}

export function StreamTimeline({ items }: { items: Thought[] }) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  const groups = groupByMonth(items)

  // GSAP stagger 入场：每张月份卡片依次淡入
  useGSAP(() => {
    if (reducedMotion) return
    gsap.from(".stream-month-card", {
      y: 32,
      opacity: 0,
      stagger: 0.12,
      duration: 0.6,
      ease: "power2.out",
      scrollTrigger: {
        trigger: wrapperRef.current,
        start: "top 88%",
        toggleActions: "play none none none",
      },
    })
  }, { scope: wrapperRef, dependencies: [reducedMotion, groups.length] })

  return (
    <section ref={wrapperRef} className="py-12 sm:py-16">
      {/* ── 标题行 ── */}
      <div className="flex items-center justify-between mb-3">
        <h2
          className="text-lg font-semibold relative pl-4"
          style={{ color: "var(--color-text)" }}
        >
          <span
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-[18px] rounded-sm"
            style={{
              background: `linear-gradient(180deg, var(--color-accent), var(--color-accent-secondary))`,
            }}
          />
          站点动态
        </h2>
        <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          共 {items.length} 条
        </span>
      </div>

      {/* 标题下方细渐变分隔线 */}
      <div
        className="mb-8 h-px w-full"
        style={{
          background: `linear-gradient(90deg, var(--color-accent) 0%, var(--color-border) 80px, var(--color-border))`,
          opacity: 0.3,
        }}
      />

      {/* ── 空状态 ── */}
      {groups.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            还没有动态
          </span>
        </div>
      )}

      {/* ── 月份卡片 ── */}
      <div className="flex flex-col gap-6">
        {groups.map((group) => (
          <div
            key={group.label}
            className="stream-month-card rounded-2xl px-5 py-4 sm:px-6 sm:py-5"
            style={{
              background: "var(--glass-bg-strong)",
              backdropFilter: "blur(var(--glass-blur))",
              WebkitBackdropFilter: "blur(var(--glass-blur))",
              border: "1px solid var(--color-border)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
            }}
          >
            {/* 月份标签 */}
            <div className="mb-3 sm:mb-4">
              <span
                className="inline-block text-[11px] tracking-wide px-3 py-1 rounded-full"
                style={{
                  color: "var(--color-accent)",
                  background: "rgba(var(--color-accent-rgb), 0.08)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {group.label}
              </span>
            </div>

            {/* 动态行 */}
            <div className="flex flex-col">
              {group.items.map((item, i) => {
                const isLink = hasExternalHref(item.href)
                const d = parseDate(item.date)
                const dayStr = d
                  ? `${d.month}.${String(d.day).padStart(2, "0")}${d.hour !== undefined ? ` ${String(d.hour).padStart(2, "0")}:${String(d.minute ?? 0).padStart(2, "0")}` : ""}`
                  : item.date

                return (
                  <div
                    key={item.id}
                    className="stream-row flex items-center gap-2 sm:gap-3 py-2.5 group min-w-0"
                    style={{
                      borderTop:
                        i === 0 ? "none" : "1px solid var(--color-border)",
                    }}
                  >
                    {/* 日期胶囊 */}
                    <span
                      className="flex-shrink-0 text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full"
                      style={{
                        color: "var(--color-accent)",
                        background: "rgba(var(--color-accent-rgb), 0.1)",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {dayStr}
                    </span>

                    {/* 动词 */}
                    <span
                      className="text-xs flex-shrink-0"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {item.verb}
                    </span>

                    {/* 目标 */}
                    {isLink ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="stream-target-link text-xs font-medium inline-flex items-center gap-1 min-w-0 relative transition-colors duration-150"
                        style={{ color: "var(--color-accent)" }}
                      >
                        <span className="truncate">{item.target}</span>
                        <ArrowUpRight
                          size={12}
                          className="flex-shrink-0 opacity-50"
                        />
                      </a>
                    ) : (
                      <span
                        className="text-xs truncate min-w-0"
                        style={{ color: "var(--color-text)" }}
                      >
                        {item.target}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ── 链接 hover 下划线动画 ── */}
      <style>{`
        .stream-target-link::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 100%;
          height: 1px;
          background: var(--color-accent);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 200ms var(--ease-out, cubic-bezier(0.16, 1, 0.3, 1));
        }
        @media (hover: hover) {
          .stream-row:hover .stream-target-link::after {
            transform: scaleX(1);
          }
        }
      `}</style>
    </section>
  )
}
