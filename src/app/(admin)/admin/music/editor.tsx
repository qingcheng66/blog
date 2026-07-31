"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Edit, ChevronUp, ChevronDown } from "lucide-react"
import { DeleteConfirmButton } from "@/components/admin-delete-button"
import type { MusicTrack } from "@/lib/content"

const EMPTY: MusicTrack = {
  id: "",
  trackName: "",
  artist: "",
  file: "",
}

export function MusicEditor({ initial }: { initial: MusicTrack[] }) {
  const router = useRouter()
  const [tracks, setTracks] = useState<MusicTrack[]>(initial)
  const [editing, setEditing] = useState<MusicTrack | null>(null)
  const [form, setForm] = useState<MusicTrack>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  function openNew() {
    setForm({ ...EMPTY, id: "" })
    setEditing(EMPTY)
  }

  function openEdit(t: MusicTrack) {
    setForm({ ...t, artist: t.artist ?? "" })
    setEditing(t)
  }

  function closeEdit() {
    setEditing(null)
    setError("")
  }

  async function handleSave() {
    if (!form.trackName.trim()) {
      setError("曲目名称不能为空")
      return
    }
    if (!form.file.trim()) {
      setError("文件路径不能为空")
      return
    }
    setSaving(true)
    setError("")

    try {
      const res = await fetch("/api/admin/music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: form.id || undefined,
          trackName: form.trackName.trim(),
          artist: (form.artist ?? "").trim() || undefined,
          file: form.file.trim(),
        }),
      })
      if (res.ok) {
        router.refresh()
        const fresh = await fetch("/api/admin/music").then((r) => r.json())
        setTracks(fresh)
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
    await fetch(`/api/admin/music?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    })
    router.refresh()
    setTracks(tracks.filter((t) => t.id !== id))
  }

  async function move(index: number, dir: -1 | 1) {
    const next = [...tracks]
    const target = index + dir
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    setTracks(next)
    const res = await fetch("/api/admin/music", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    })
    if (res.ok) router.refresh()
    else setTracks(tracks)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>
            音乐管理
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
            共 {tracks.length} 首曲目 · 音频文件请手动放入 public/music/，只填路径
          </p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90"
          style={{ background: "var(--color-accent)", color: "#fff" }}
        >
          <Plus size={16} />
          新增曲目
        </button>
      </div>

      {/* Edit / New form */}
      {editing && (
        <div
          className="rounded-xl p-5 mb-4 max-w-2xl"
          style={{
            background: "var(--glass-bg-strong)",
            border: "1px solid var(--color-border)",
          }}
        >
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--color-text)" }}>
            {editing.id ? "编辑曲目" : "新增曲目"}
          </h3>

          {error && (
            <div
              className="rounded-lg px-4 py-2 mb-4 text-xs"
              style={{ background: "rgba(255,85,85,0.1)", color: "#FF5555", border: "1px solid rgba(255,85,85,0.2)" }}
            >
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4 mb-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>曲目名称</span>
              <input
                value={form.trackName}
                onChange={(e) => setForm((f) => ({ ...f, trackName: e.target.value }))}
                placeholder="如：背景音乐"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: "var(--color-bg-mute)", color: "var(--color-text)", border: "1px solid var(--color-border)" }}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>艺术家（可选）</span>
              <input
                value={form.artist || ""}
                onChange={(e) => setForm((f) => ({ ...f, artist: e.target.value }))}
                placeholder="如：Serenity"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: "var(--color-bg-mute)", color: "var(--color-text)", border: "1px solid var(--color-border)" }}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>文件路径</span>
              <input
                value={form.file}
                onChange={(e) => setForm((f) => ({ ...f, file: e.target.value }))}
                placeholder="/music/bg.mp3"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: "var(--color-bg-mute)", color: "var(--color-text)", border: "1px solid var(--color-border)" }}
              />
              <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                音频文件放在 public/music/ 目录，此处填对应的 URL 路径，如 /music/bg.mp3
              </span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity disabled:opacity-40"
              style={{ background: "var(--color-accent)", color: "#fff" }}
            >
              {saving ? "保存中..." : "保存"}
            </button>
            <button
              onClick={closeEdit}
              className="px-4 py-2 rounded-lg text-sm transition-colors hover:bg-white/5"
              style={{ color: "var(--color-text-muted)" }}
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* Track list */}
      <div className="flex flex-col gap-2">
        {tracks.map((t, i) => (
          <div
            key={t.id}
            className="flex items-center gap-4 rounded-xl px-5 py-3 transition-all duration-200"
            style={{
              background: "var(--glass-bg-strong)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
              <button
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="p-1 rounded transition-colors hover:bg-white/5 disabled:opacity-25"
                style={{ color: "var(--color-text-muted)" }}
                aria-label="上移"
              >
                <ChevronUp size={14} />
              </button>
              <button
                onClick={() => move(i, 1)}
                disabled={i === tracks.length - 1}
                className="p-1 rounded transition-colors hover:bg-white/5 disabled:opacity-25"
                style={{ color: "var(--color-text-muted)" }}
                aria-label="下移"
              >
                <ChevronDown size={14} />
              </button>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium truncate" style={{ color: "var(--color-text)" }}>
                  {t.trackName}
                </h3>
                {t.artist && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ color: "var(--color-accent)", background: "rgba(var(--color-accent-rgb), 0.12)" }}>
                    {t.artist}
                  </span>
                )}
              </div>
              <p className="text-xs mt-1 truncate max-w-lg" style={{ color: "var(--color-text-muted)" }}>
                {t.file}
              </p>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => openEdit(t)}
                className="p-2 rounded-lg transition-colors hover:bg-white/5"
                style={{ color: "var(--color-text-muted)" }}
              >
                <Edit size={15} />
              </button>
              <DeleteConfirmButton slug={t.id} title={t.trackName} apiPath={`/api/admin/music?id=${encodeURIComponent(t.id)}`} />
            </div>
          </div>
        ))}

        {tracks.length === 0 && (
          <div
            className="rounded-xl px-5 py-8 text-center text-sm"
            style={{ background: "var(--glass-bg-strong)", border: "1px dashed var(--color-border)", color: "var(--color-text-muted)" }}
          >
            暂无曲目，点击右上角「新增曲目」添加第一首。
          </div>
        )}
      </div>
    </div>
  )
}
