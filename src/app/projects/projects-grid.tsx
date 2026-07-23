"use client"

import { useRef } from "react"
import { useGSAP } from "@gsap/react"
import { gsap } from "@/lib/gsap"
import { Globe, ExternalLink } from "lucide-react"
import { projects } from "@/data/projects"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

export function ProjectsGrid() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useGSAP(() => {
    if (reducedMotion) return
    gsap.from(wrapperRef.current?.querySelectorAll(".project-card") ?? [], {
      y: 30,
      stagger: 0.08,
      duration: 0.5,
      ease: "power2.out",
    })
  }, { scope: wrapperRef, dependencies: [reducedMotion] })

  return (
    <section ref={wrapperRef}>
      <style>{`
        .project-card {
          position: relative;
          border: 1px solid var(--color-border);
          transition: all 0.3s ease;
        }
        @media (hover: hover) {
          .project-card:hover {
            border-color: rgba(var(--color-accent-rgb), 0.3);
            transform: translateY(-2px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          }
          .project-card:hover .project-title {
            color: var(--color-accent) !important;
          }
        }
      `}</style>

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--color-text)" }}>
          项目集
        </h1>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          我构建和参与的开源项目
        </p>
      </div>

      {/* Project cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {projects.map((project) => (
          <div
            key={project.title}
            className="project-card rounded-2xl p-6 flex flex-col"
            style={{ background: "var(--glass-bg-strong)" }}
          >
            {/* Year badge */}
            {project.year && (
              <span
                className="self-start text-xs px-2 py-0.5 rounded-full mb-3"
                style={{
                  color: "var(--color-accent)",
                  background: "rgba(var(--color-accent-rgb), 0.1)",
                  border: "1px solid rgba(var(--color-accent-rgb), 0.15)",
                }}
              >
                {project.year}
              </span>
            )}

            <h3
              className="project-title text-lg font-semibold mb-2 transition-colors duration-200"
              style={{ color: "var(--color-text)" }}
            >
              {project.title}
            </h3>

            <p className="text-sm leading-relaxed mb-4 flex-1" style={{ color: "var(--color-text-secondary)" }}>
              {project.description}
            </p>

            {/* Tech tags */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {project.tech.map((t) => (
                <span
                  key={t}
                  className="text-xs px-2 py-0.5 rounded-md"
                  style={{
                    color: "var(--color-text-muted)",
                    background: "var(--color-bg-mute)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>

            {/* Links */}
            <div className="flex items-center gap-3">
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs transition-colors hover:text-[var(--color-accent)]"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  <Globe size={14} />
                  源码
                </a>
              )}
              {project.demo && (
                <a
                  href={project.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs transition-colors hover:text-[var(--color-accent)]"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  <ExternalLink size={14} />
                  演示
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
