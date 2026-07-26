"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Edit } from "lucide-react"
import { DeleteConfirmButton } from "@/components/admin-delete-button"
import type { Thought } from "@/lib/content"

const EMPTY: Thought = {
  id: "",
  verb: "",
  target: "",
  href: "",
  date: "",
}

export function ThoughtsManager({ initial }: { initial: Thought[] }) {
  const router = useRouter()
  const [thoughts, setThoughts] = useState<Thought[]>(initial)
  const [editing, setEditing] = useState<Thought | null>(null)
  const [form, setForm] = useState<Thought>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  function openNew() {
    setForm({ ...EMPTY, id: "" })
    setEditing(EMPTY)
  }

  function openEdit(t: Thought) {
    setForm({ ...t })
    setEditing(t)
  }

  function closeEdit() {
    setEditing(null)
    setError("")
  }

  async function handleSave() {
    if (!form.verb.trim() || !form.target.trim()) {
      setError("操作和目标不能为空")
      return
    }
    setSaving(true)
    setError("")

    try {
      const res = await fetch("/api/admin/thoughts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        router.refresh()
        const data = await fetch("/api/admin/thoughts").then((r) => r.json())
        setThoughts(data)
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>
            碎碎念管理
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
            共 {thoughts.length} 条动态
          </p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90"
          style={{ background: "var(--color-accent)", color: "#fff" }}
        >
          <Plus size={16} />
          新建动态
        </button>
      </div>

      {/* Edit panel */}
      {editing && (
        <div className="rounded-xl p-5 mb-4" style={{ background: "var(--glass-bg-strong)", border: "1px solid var(--color-border)" }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--color-text)" }}>
            {editing.id ? "编辑动态" : "新建动态"}
          </h3>
          {error && (
            <div className="rounded-lg px-4 py-2 mb-4 text-xs" style={{ background: "rgba(255,85,85,0.1)", color: "#FF5555", border: "1px solid rgba(255,85,85,0.2)" }}>
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>操作 (verb)</span>
              <input value={form.verb} onChange={(e) => setForm((f) => ({ ...f, verb: e.target.value }))} placeholder="部署上线了" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "var(--color-bg-mute)", color: "var(--color-text)", border: "1px solid var(--color-border)" }} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>目标 (target)</span>
              <input value={form.target} onChange={(e) => setForm((f) => ({ ...f, target: e.target.value }))} placeholder="Serenity Lab" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "var(--color-bg-mute)", color: "var(--color-text)", border: "1px solid var(--color-border)" }} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>链接 (href)</span>
              <input value={form.href || ""} onChange={(e) => setForm((f) => ({ ...f, href: e.target.value }))} placeholder="https://..." className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "var(--color-bg-mute)", color: "var(--color-text)", border: "1px solid var(--color-border)" }} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>日期</span>
              <input value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} placeholder="7月23日" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "var(--color-bg-mute)", color: "var(--color-text)", border: "1px solid var(--color-border)" }} />
            </label>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity disabled:opacity-40" style={{ background: "var(--color-accent)", color: "#fff" }}>
              {saving ? "保存中..." : "保存"}
            </button>
            <button onClick={closeEdit} className="px-4 py-2 rounded-lg text-sm transition-colors hover:bg-white/5" style={{ color: "var(--color-text-muted)" }}>取消</button>
          </div>
        </div>
      )}

      {/* Thoughts list */}
      <div className="flex flex-col gap-2">
        {thoughts.map((t) => (
          <div key={t.id} className="flex items-center gap-4 rounded-xl px-5 py-3 transition-all duration-200" style={{ background: "var(--glass-bg-strong)", border: "1px solid var(--color-border)" }}>
            <div className="flex-1 min-w-0 flex items-center gap-1 text-sm">
              <span style={{ color: "var(--color-text-muted)" }}>{t.verb}</span>
              <a href={t.href || "#"} className="font-medium truncate max-w-xs" style={{ color: "var(--color-accent)" }}>{t.target}</a>
            </div>
            <span className="text-xs flex-shrink-0" style={{ color: "var(--color-text-muted)" }}>{t.date}</span>
            <div className="flex items-center gap-1 flex-shrink-0 ml-2">
              <button onClick={() => openEdit(t)} className="p-2 rounded-lg transition-colors hover:bg-white/5" style={{ color: "var(--color-text-muted)" }}><Edit size={15} /></button>
              <DeleteConfirmButton slug={t.id} title={t.target} apiPath={`/api/admin/thoughts/${t.id}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
