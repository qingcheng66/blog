"use client"

import { useRef } from "react"
import { useGSAP } from "@gsap/react"
import { gsap } from "@/lib/gsap"
import { Globe, MessageSquare, Mail, MapPin, Download } from "lucide-react"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import type { About } from "@/lib/content"

export function AboutSection({ about }: { about: About | null }) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useGSAP(() => {
    if (reducedMotion) return
    gsap.from(wrapperRef.current?.querySelectorAll(".about-fade-in") ?? [], {
      y: 30,
      stagger: 0.08,
      duration: 0.5,
      ease: "power2.out",
    })
  }, { scope: wrapperRef, dependencies: [reducedMotion] })

  if (!about) {
    return (
      <section ref={wrapperRef}>
        <div className="mb-8 about-fade-in">
          <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--color-text)" }}>
            关于我
          </h1>
        </div>
        <div
          className="rounded-2xl p-12 text-center"
          style={{ background: "var(--glass-bg-strong)", border: "1px solid var(--color-border)" }}
        >
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            关于信息尚未填写，请通过管理后台设置。
          </p>
        </div>
      </section>
    )
  }

  return (
    <section ref={wrapperRef}>
      <style>{`
        .about-contact-link {
          transition: all 0.2s ease;
        }
        .about-skill-tag {
          transition: all 0.2s ease;
        }
        @media (hover: hover) {
          .about-contact-link:hover {
            color: var(--color-accent) !important;
            transform: translateX(4px);
          }
          .about-skill-tag:hover {
            color: var(--color-accent) !important;
            border-color: rgba(var(--color-accent-rgb), 0.3) !important;
            transform: translateY(-1px);
          }
        }
      `}</style>

      <div className="mb-8 about-fade-in">
        <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--color-text)" }}>
          关于我
        </h1>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          个人简介与联系方式
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div
          className="about-fade-in lg:col-span-2 rounded-2xl p-6"
          style={{ background: "var(--glass-bg-strong)", border: "1px solid var(--color-border)" }}
        >
          <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--color-text)" }}>
            {about.name} · {about.title}
          </h2>

          <div className="flex items-center gap-2 mb-4 text-sm" style={{ color: "var(--color-text-muted)" }}>
            <MapPin size={14} style={{ color: "var(--color-accent)" }} />
            <span>{about.city}</span>
          </div>

          <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--color-text-secondary)" }}>
            {about.bio}
          </p>

          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--color-text)" }}>
            技术栈
          </h3>
          <div className="flex flex-wrap gap-2">
            {about.skills.map((skill) => (
              <span
                key={skill}
                className="about-skill-tag text-xs px-3 py-1 rounded-full"
                style={{
                  color: "var(--color-text-secondary)",
                  background: "var(--color-bg-mute)",
                  border: "1px solid var(--color-border)",
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div
          className="about-fade-in rounded-2xl p-6 h-fit"
          style={{ background: "var(--glass-bg-strong)", border: "1px solid var(--color-border)" }}
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--color-text)" }}>
            联系方式
          </h3>

          <div className="flex flex-col gap-3">
            <a
              href={about.contacts.github}
              target="_blank"
              rel="noopener noreferrer"
              className="about-contact-link flex items-center gap-3 text-sm py-2"
              style={{ color: "var(--color-text-secondary)" }}
            >
              <Globe size={16} style={{ color: "var(--color-accent)" }} />
              <span>GitHub</span>
            </a>
            <div
              className="about-contact-link flex items-center gap-3 text-sm py-2"
              style={{ color: "var(--color-text-secondary)" }}
            >
              <MessageSquare size={16} style={{ color: "var(--color-accent)" }} />
              <span className="truncate">{about.contacts.wechat}</span>
            </div>
            <a
              href={`mailto:${about.contacts.email}`}
              className="about-contact-link flex items-center gap-3 text-sm py-2"
              style={{ color: "var(--color-text-secondary)" }}
            >
              <Mail size={16} style={{ color: "var(--color-accent)" }} />
              <span className="truncate">{about.contacts.email}</span>
            </a>

            <a
              href="/resume.pdf"
              download
              className="mt-2 flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all duration-200"
              style={{
                color: "var(--color-accent)",
                borderColor: "var(--color-accent)",
                background: "rgba(var(--color-accent-rgb), 0.08)",
              }}
            >
              <Download size={15} />
              <span>下载简历</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
