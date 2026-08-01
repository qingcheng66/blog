"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react"

const DEFAULT_META = {
  title: "",
  slug: "",
  description: "",
  date: new Date().toISOString().slice(0, 10),
  tags: [] as string[],
  cover: "",
  pinned: false,
  views: 0,
}

export default function ArticleEditor({
  initial,
}: {
  initial?: {
    meta: {
      title: string
      slug: string
      description: string
      date: string
      tags: string[]
      cover?: string
      pinned?: boolean
      views: number
    }
    content: string
  }
}) {
  const router = useRouter()
  const isNew = !initial
  const [meta, setMeta] = useState(
    initial?.meta || DEFAULT_META
  )
  const [content, setContent] = useState(initial?.content || "")
  const [tagsInput, setTagsInput] = useState(
    (initial?.meta.tags || []).join(", ")
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  // 按需从 tagsInput 解析 tags 数组（避免 effect 中同步 setState）
  function resolveTags(): string[] {
    return tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
  }

  // Auto-generate slug from title 按需取值（避免 effect 中同步 setState）
  function resolveSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9一-鿿]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80)
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (isNew && meta.title && !meta.slug) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMeta((m) => ({ ...m, slug: resolveSlug(meta.title) }))
    }
  }, [meta.title, isNew])

  async function handleSave() {
    if (!meta.title.trim()) {
      setError("请填写文章标题")
      return
    }
    if (!meta.slug.trim()) {
      setError("请填写 slug")
      return
    }

    setSaving(true)
    setError("")

    try {
      const url = isNew
        ? "/api/admin/articles"
        : `/api/admin/articles/${encodeURIComponent(meta.slug)}`

      const method = isNew ? "POST" : "PUT"

      const resolvedMeta = { ...meta, tags: resolveTags() }
      if (isNew && !resolvedMeta.slug) {
        resolvedMeta.slug = resolveSlug(resolvedMeta.title)
      }
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meta: resolvedMeta, content }),
      })

      if (res.ok) {
        router.push("/admin/articles")
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error || "保存失败")
      }
    } catch {
      setError("网络错误，请重试")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg transition-colors hover:bg-white/5"
            style={{ color: "var(--color-text-muted)" }}
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>
            {isNew ? "新建文章" : "编辑文章"}
          </h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90 disabled:opacity-40"
          style={{ background: "var(--color-accent)", color: "#fff" }}
        >
          <Save size={16} />
          {saving ? "保存中..." : "保存"}
        </button>
      </div>

      {error && (
        <div
          className="rounded-lg px-4 py-3 mb-4 text-sm"
          style={{
            background: "rgba(255,85,85,0.1)",
            color: "#FF5555",
            border: "1px solid rgba(255,85,85,0.2)",
          }}
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Meta panel */}
        <div
          className="lg:col-span-1 rounded-xl p-5 h-fit flex flex-col gap-4"
          style={{
            background: "var(--glass-bg-strong)",
            border: "1px solid var(--color-border)",
          }}
        >
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
              标题
            </span>
            <input
              value={meta.title}
              onChange={(e) => setMeta((m) => ({ ...m, title: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{
                background: "var(--color-bg-mute)",
                color: "var(--color-text)",
                border: "1px solid var(--color-border)",
              }}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
              Slug
            </span>
            <input
              value={meta.slug}
              onChange={(e) => setMeta((m) => ({ ...m, slug: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg text-sm font-mono outline-none"
              style={{
                background: "var(--color-bg-mute)",
                color: "var(--color-text)",
                border: "1px solid var(--color-border)",
              }}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
              描述
            </span>
            <textarea
              value={meta.description}
              onChange={(e) => setMeta((m) => ({ ...m, description: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
              style={{
                background: "var(--color-bg-mute)",
                color: "var(--color-text)",
                border: "1px solid var(--color-border)",
              }}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
              日期
            </span>
            <input
              type="date"
              value={meta.date}
              onChange={(e) => setMeta((m) => ({ ...m, date: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{
                background: "var(--color-bg-mute)",
                color: "var(--color-text)",
                border: "1px solid var(--color-border)",
              }}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
              标签（逗号分隔）
            </span>
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Docker, Next.js, 部署"
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{
                background: "var(--color-bg-mute)",
                color: "var(--color-text)",
                border: "1px solid var(--color-border)",
              }}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
              封面图路径
            </span>
            <input
              value={meta.cover || ""}
              onChange={(e) => setMeta((m) => ({ ...m, cover: e.target.value }))}
              placeholder="/content/uploads/cover-xxx.jpg"
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{
                background: "var(--color-bg-mute)",
                color: "var(--color-text)",
                border: "1px solid var(--color-border)",
              }}
            />
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={meta.pinned || false}
              onChange={(e) => setMeta((m) => ({ ...m, pinned: e.target.checked }))}
              className="rounded accent-[var(--color-accent)]"
            />
            <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              置顶
            </span>
          </label>
        </div>

        {/* Content area */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div
            className="rounded-xl p-5 flex-1 flex flex-col"
            style={{
              background: "var(--glass-bg-strong)",
              border: "1px solid var(--color-border)",
            }}
          >
            <span className="text-xs font-medium mb-3" style={{ color: "var(--color-text-secondary)" }}>
              Markdown 正文
            </span>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 w-full px-3 py-2 rounded-lg text-sm font-mono outline-none resize-none min-h-[400px]"
              style={{
                background: "var(--color-bg-mute)",
                color: "var(--color-text)",
                border: "1px solid var(--color-border)",
                lineHeight: 1.8,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
