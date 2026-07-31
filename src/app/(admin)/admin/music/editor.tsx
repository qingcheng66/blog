"use client"

import { useState } from "react"
import { Save } from "lucide-react"
import type { MusicConfig } from "@/lib/content"

export function MusicEditor({ initial }: { initial: MusicConfig | null }) {
  const [trackName, setTrackName] = useState(initial?.trackName ?? "")
  const [artist, setArtist] = useState(initial?.artist ?? "")
  const [file, setFile] = useState(initial?.file ?? "")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [ok, setOk] = useState(false)

  async function handleSave() {
    if (!trackName.trim()) {
      setError("曲目名称不能为空")
      return
    }
    if (!file.trim()) {
      setError("文件路径不能为空")
      return
    }
    setSaving(true)
    setError("")
    setOk(false)

    try {
      const res = await fetch("/api/admin/music", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackName: trackName.trim(),
          artist: artist.trim() || undefined,
          file: file.trim(),
        }),
      })
      if (res.ok) {
        setOk(true)
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
            音乐管理
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
            配置背景音乐曲目（音频文件请手动放入 public/music/）
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
          保存成功！刷新页面后生效。
        </div>
      )}

      <div
        className="rounded-xl p-5 flex flex-col gap-4 max-w-2xl"
        style={{ background: "var(--glass-bg-strong)", border: "1px solid var(--color-border)" }}
      >
        <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--color-text)" }}>
          曲目信息
        </h3>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>曲目名称</span>
          <input value={trackName} onChange={(e) => setTrackName(e.target.value)} placeholder="如：背景音乐" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "var(--color-bg-mute)", color: "var(--color-text)", border: "1px solid var(--color-border)" }} />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>艺术家（可选）</span>
          <input value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="如：Serenity" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "var(--color-bg-mute)", color: "var(--color-text)", border: "1px solid var(--color-border)" }} />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>文件路径</span>
          <input value={file} onChange={(e) => setFile(e.target.value)} placeholder="/music/bg.mp3" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "var(--color-bg-mute)", color: "var(--color-text)", border: "1px solid var(--color-border)" }} />
          <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>音频文件放在 public/music/ 目录，此处填对应的 URL 路径，如 /music/bg.mp3</span>
        </label>
      </div>
    </div>
  )
}
