"use client"

import { useRef } from "react"
import { useGSAP } from "@gsap/react"
import { gsap } from "@/lib/gsap"
import { FileText, FolderGit2, MessageCircle, User, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

const NAV_ITEMS = [
  {
    href: "/articles",
    icon: FileText,
    label: "文章",
    desc: "技术笔记与实践记录",
  },
  {
    href: "/projects",
    icon: FolderGit2,
    label: "项目",
    desc: "独立完成的开源作品",
  },
  {
    href: "/thoughts",
    icon: MessageCircle,
    label: "碎碎念",
    desc: "随想、动态与近况",
  },
  {
    href: "/about",
    icon: User,
    label: "关于",
    desc: "了解更多关于我",
  },
]

export function NavCards() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useGSAP(() => {
    if (reducedMotion) return
    gsap.from(wrapperRef.current?.querySelectorAll(".nav-card") ?? [], {
      y: 28,
      opacity: 0,
      stagger: 0.1,
      duration: 0.55,
      ease: "power2.out",
    })
  }, { scope: wrapperRef, dependencies: [reducedMotion] })

  return (
    <section ref={wrapperRef} className="pb-12 pt-4">
      <style>{`
        .nav-card {
          border: 1px solid var(--color-border);
          transition: all 0.3s ease;
        }
        @media (hover: hover) {
          .nav-card:hover {
            border-color: rgba(var(--color-accent-rgb), 0.3);
            transform: translateY(-3px);
            box-shadow: 0 6px 24px rgba(0, 0, 0, 0.06);
          }
          .nav-card:hover .nav-card-arrow {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {NAV_ITEMS.map(({ href, icon: Icon, label, desc }) => (
          <Link
            key={href}
            href={href}
            className="nav-card group rounded-2xl p-5 flex flex-col items-center text-center gap-3"
            style={{ background: "var(--glass-bg-strong)" }}
          >
            <div
              className="rounded-xl p-2.5"
              style={{ background: "rgba(var(--color-accent-rgb), 0.08)" }}
            >
              <Icon size={22} style={{ color: "var(--color-accent)" }} />
            </div>
            <div>
              <h3 className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
                {label}
              </h3>
              <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                {desc}
              </p>
            </div>
            <span
              className="nav-card-arrow text-xs flex items-center gap-1 transition-all duration-200"
              style={{
                color: "var(--color-accent)",
                opacity: 0.6,
                transform: "translateX(-4px)",
              }}
            >
              前往 <ArrowRight size={12} />
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
