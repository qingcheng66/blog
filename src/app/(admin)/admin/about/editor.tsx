"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Save } from "lucide-react"
import type { About } from "@/lib/content"

const DEFAULT: About = {
  name: "",
  title: "",
  city: "",
  bio: "",
  skills: [],
  contacts: { github: "", wechat: "", email: "" },
}

export function AboutEditor({ initial }: { initial: About | null }) {
  const router = useRouter()
  const [form, setForm] = useState<About>(initial || DEFAULT)
  const [skillsInput, setSkillsInput] = useState(
    (initial?.skills || []).join(", ")
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [ok, setOk] = useState(false)

  // Sync skillsInput → form.skills
  function updateSkills(input: string) {
    setSkillsInput(input)
    setForm((f) => ({
      ...f,
      skills: input
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    }))
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setError("名称不能为空")
      return
    }
    setSaving(true)
    setError("")
    setOk(false)

    try {
      const res = await fetch("/api/admin/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setOk(true)
        router.refresh()
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
            关于页管理
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
            编辑个人简介和联系方式
          </p>
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
        <div className="rounded-lg px-4 py-3 mb-4 text-sm" style={{ background: "rgba(255,85,85,0.1)", color: "#FF5555", border: "1px solid rgba(255,85,85,0.2)" }}>
          {error}
        </div>
      )}
      {ok && (
        <div className="rounded-lg px-4 py-3 mb-4 text-sm" style={{ background: "rgba(80,250,123,0.1)", color: "#50FA7B", border: "1px solid rgba(80,250,123,0.2)" }}>
          保存成功！
        </div>
      )}

      <div
        className="rounded-xl p-5 flex flex-col gap-4 max-w-2xl"
        style={{ background: "var(--glass-bg-strong)", border: "1px solid var(--color-border)" }}
      >
        <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--color-text)" }}>
          基本信息
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>名称</span>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "var(--color-bg-mute)", color: "var(--color-text)", border: "1px solid var(--color-border)" }} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>头衔</span>
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "var(--color-bg-mute)", color: "var(--color-text)", border: "1px solid var(--color-border)" }} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>城市</span>
            <input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "var(--color-bg-mute)", color: "var(--color-text)", border: "1px solid var(--color-border)" }} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>技能（逗号分隔）</span>
            <input value={skillsInput} onChange={(e) => updateSkills(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "var(--color-bg-mute)", color: "var(--color-text)", border: "1px solid var(--color-border)" }} />
          </label>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>个人简介</span>
          <textarea value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} rows={3} className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none" style={{ background: "var(--color-bg-mute)", color: "var(--color-text)", border: "1px solid var(--color-border)" }} />
        </label>

        <h3 className="text-sm font-semibold mt-2 mb-2" style={{ color: "var(--color-text)" }}>
          联系方式
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>GitHub</span>
            <input value={form.contacts.github} onChange={(e) => setForm((f) => ({ ...f, contacts: { ...f.contacts, github: e.target.value } }))} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "var(--color-bg-mute)", color: "var(--color-text)", border: "1px solid var(--color-border)" }} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>微信</span>
            <input value={form.contacts.wechat} onChange={(e) => setForm((f) => ({ ...f, contacts: { ...f.contacts, wechat: e.target.value } }))} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "var(--color-bg-mute)", color: "var(--color-text)", border: "1px solid var(--color-border)" }} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>邮箱</span>
            <input value={form.contacts.email} onChange={(e) => setForm((f) => ({ ...f, contacts: { ...f.contacts, email: e.target.value } }))} className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "var(--color-bg-mute)", color: "var(--color-text)", border: "1px solid var(--color-border)" }} />
          </label>
        </div>
      </div>
    </div>
  )
}
