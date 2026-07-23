"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { Search, X, CornerDownLeft } from "lucide-react"

interface SearchResult {
  title: string
  excerpt: string
  category: string
}

const MOCK_RESULTS: SearchResult[] = [
  { title: "关于我与这个博客", excerpt: "这是我个人博客的第一篇文章。聊聊我是做什么的，为什么写博客...", category: "文章" },
  { title: "Docker 部署 Next.js 全流程指南", excerpt: "从 Dockerfile 编写到生产部署，详细介绍 Next.js 应用容器化的最佳实践...", category: "文章" },
  { title: "Next.js 16 新特性与迁移体验", excerpt: "从 Next.js 15 升级到 16 的实际体验，包括 Turbopack、React 19 集成...", category: "文章" },
  { title: "LLM 应用落地的技术选型思考", excerpt: "构建 LLM 应用时，如何选择模型、框架和架构？本文从实际项目出发...", category: "文章" },
  { title: "个人博客 & 作品集", excerpt: "基于 Next.js 16 构建的全栈个人网站，支持 MDX 博客、亮/暗主题...", category: "项目" },
  { title: "LLM 对话平台", excerpt: "企业级 LLM 对话应用，支持多模型切换、对话历史管理、RAG 知识库集成...", category: "项目" },
]

export function SearchModal() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [active, setActive] = useState(false) // for animation timing
  const inputRef = useRef<HTMLInputElement>(null)

  const results = query.length > 0
    ? MOCK_RESULTS.filter((r) =>
        r.title.toLowerCase().includes(query.toLowerCase()) ||
        r.excerpt.toLowerCase().includes(query.toLowerCase())
      )
    : MOCK_RESULTS

  const openModal = useCallback(() => {
    setOpen(true)
    requestAnimationFrame(() => {
      setActive(true)
      inputRef.current?.focus()
    })
  }, [])

  const closeModal = useCallback(() => {
    setActive(false)
    setTimeout(() => {
      setOpen(false)
      setQuery("")
    }, 200)
  }, [])

  // Listen for custom event from header button
  useEffect(() => {
    const handler = () => openModal()
    window.addEventListener("toggle-search", handler)
    return () => window.removeEventListener("toggle-search", handler)
  }, [openModal])

  // Ctrl+K / Cmd+K keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        open ? closeModal() : openModal()
      }
      if (e.key === "Escape" && open) {
        closeModal()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open, openModal, closeModal])

  // Prevent body scroll when open
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh]"
      style={{
        opacity: active ? 1 : 0,
        visibility: active ? "visible" : "hidden",
        transition: "opacity 0.2s ease, visibility 0s linear" + (active ? " 0s" : " 0.2s"),
      }}
      onClick={closeModal}
    >
      {/* Content */}
      <div
        className="relative w-[90%] max-w-[600px] max-h-[70vh] flex flex-col rounded-2xl overflow-hidden"
        style={{
          background: "rgba(20, 22, 29, 0.75)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          transform: active ? "translateY(0) scale(1)" : "translateY(-16px) scale(0.985)",
          transition: "transform 0.2s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: search input */}
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          <Search size={20} style={{ color: "var(--color-accent)", flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索文章、项目..."
            className="flex-1 bg-transparent border-none outline-none text-base px-3"
            style={{ color: "var(--color-accent)", caretColor: "var(--color-accent)" }}
            onKeyDown={(e) => {
              if (e.key === "Escape") closeModal()
            }}
          />
          <button
            onClick={closeModal}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover-media:hover:bg-white/5"
            style={{ color: "var(--color-accent)" }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="py-12 text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
              未找到结果
            </div>
          ) : (
            results.map((result, i) => (
              <a
                key={i}
                href="#"
                className="flex flex-col gap-1 px-4 py-3 rounded-lg transition-colors hover-media:hover:bg-white/[0.04]"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
                    {result.title}
                  </span>
                  <span
                    className="text-xs px-1.5 py-0.5 rounded"
                    style={{
                      color: "var(--color-accent)",
                      background: "rgba(var(--color-accent-rgb), 0.1)",
                    }}
                  >
                    {result.category}
                  </span>
                </div>
                <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  {result.excerpt}
                </span>
              </a>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div
          className="flex items-center justify-between px-4 py-2.5 text-xs"
          style={{ borderTop: "1px solid var(--color-border)", color: "var(--color-text-muted)" }}
        >
          <span>搜索结果 {results.length} 条</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded text-[10px] border" style={{ borderColor: "var(--color-border-hover)" }}>↑↓</kbd>
              导航
            </span>
            <span className="flex items-center gap-1">
              <kbd className="flex items-center px-1.5 py-0.5 rounded text-[10px] border" style={{ borderColor: "var(--color-border-hover)" }}>
                <CornerDownLeft size={10} />
              </kbd>
              选择
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded text-[10px] border" style={{ borderColor: "var(--color-border-hover)" }}>Esc</kbd>
              关闭
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
