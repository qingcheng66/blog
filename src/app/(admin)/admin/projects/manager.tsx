"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Edit, Globe, ExternalLink } from "lucide-react"
import { DeleteConfirmButton } from "@/components/admin-delete-button"
import type { Project } from "@/lib/content"

const EMPTY: Project = {
  id: "",
  title: "",
  description: "",
  tech: [],
  github: "",
  demo: "",
  year: new Date().getFullYear().toString(),
}

export function ProjectsManager({ initial }: { initial: Project[] }) {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>(initial)
  const [editing, setEditing] = useState<Project | null>(null)
  const [form, setForm] = useState<Project>(EMPTY)
  const [techInput, setTechInput] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  function openNew() {
    setForm({ ...EMPTY, id: "" })
    setTechInput("")
    setEditing(EMPTY)
  }

  function openEdit(p: Project) {
    setForm({ ...p })
    setTechInput(p.tech.join(", "))
    setEditing(p)
  }

  function closeEdit() {
    setEditing(null)
    setError("")
  }

  // Sync techInput → form.tech
  function updateTech(input: string) {
    setTechInput(input)
    setForm((f) => ({
      ...f,
      tech: input
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    }))
  }

  async function handleSave() {
    if (!form.title.trim()) {
      setError("项目名称不能为空")
      return
    }
    setSaving(true)
    setError("")

    try {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        router.refresh()
        // Reload projects
        const data = await fetch("/api/admin/projects").then((r) => r.json())
        setProjects(data)
        closeEdit()
      } else {
        const d = await res.json()
        setError(d.error || "保存失败")
      }
    } catch {
      setError("网络错误")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/admin/projects/${id}`, { method: "DELETE" })
    router.refresh()
    setProjects(projects.filter((p) => p.id !== id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>
            项目管理
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
            共 {projects.length} 个项目
          </p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90"
          style={{ background: "var(--color-accent)", color: "#fff" }}
        >
          <Plus size={16} />
          新建项目
        </button>
      </div>

      {/* Edit panel */}
      {editing && (
        <div
          className="rounded-xl p-5 mb-4"
          style={{
            background: "var(--glass-bg-strong)",
            border: "1px solid var(--color-border)",
          }}
        >
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--color-text)" }}>
            {editing.id ? "编辑项目" : "新建项目"}
          </h3>

          {error && (
            <div className="rounded-lg px-4 py-2 mb-4 text-xs" style={{ background: "rgba(255,85,85,0.1)", color: "#FF5555", border: "1px solid rgba(255,85,85,0.2)" }}>
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>名称</span>
              <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "var(--color-bg-mute)", color: "var(--color-text)", border: "1px solid var(--color-border)" }} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>年份</span>
              <input value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "var(--color-bg-mute)", color: "var(--color-text)", border: "1px solid var(--color-border)" }} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>技术栈（逗号分隔）</span>
              <input value={techInput} onChange={(e) => updateTech(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "var(--color-bg-mute)", color: "var(--color-text)", border: "1px solid var(--color-border)" }} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>GitHub 链接</span>
              <input value={form.github || ""} onChange={(e) => setForm((f) => ({ ...f, github: e.target.value }))} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "var(--color-bg-mute)", color: "var(--color-text)", border: "1px solid var(--color-border)" }} />
            </label>
            <label className="sm:col-span-2 flex flex-col gap-1.5">
              <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>描述</span>
              <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none" style={{ background: "var(--color-bg-mute)", color: "var(--color-text)", border: "1px solid var(--color-border)" }} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>演示链接</span>
              <input value={form.demo || ""} onChange={(e) => setForm((f) => ({ ...f, demo: e.target.value }))} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "var(--color-bg-mute)", color: "var(--color-text)", border: "1px solid var(--color-border)" }} />
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity disabled:opacity-40" style={{ background: "var(--color-accent)", color: "#fff" }}>
              {saving ? "保存中..." : "保存"}
            </button>
            <button onClick={closeEdit} className="px-4 py-2 rounded-lg text-sm transition-colors hover:bg-white/5" style={{ color: "var(--color-text-muted)" }}>
              取消
            </button>
          </div>
        </div>
      )}

      {/* Project list */}
      <div className="flex flex-col gap-2">
        {projects.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-4 rounded-xl px-5 py-4 transition-all duration-200"
            style={{
              background: "var(--glass-bg-strong)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium" style={{ color: "var(--color-text)" }}>{p.title}</h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ color: "var(--color-accent)", background: "rgba(var(--color-accent-rgb), 0.12)" }}>{p.year}</span>
              </div>
              <p className="text-xs mt-1 truncate max-w-lg" style={{ color: "var(--color-text-muted)" }}>{p.description}</p>
              <div className="flex items-center gap-2 mt-2">
                {p.tech.slice(0, 4).map((t) => (
                  <span key={t} className="text-[10px] px-1.5 py-0.5 rounded" style={{ color: "var(--color-text-muted)", background: "var(--color-bg-mute)", border: "1px solid var(--color-border)" }}>{t}</span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => openEdit(p)} className="p-2 rounded-lg transition-colors hover:bg-white/5" style={{ color: "var(--color-text-muted)" }}><Edit size={15} /></button>
              <DeleteConfirmButton slug={p.id} title={p.title} apiPath={`/api/admin/projects/${p.id}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
