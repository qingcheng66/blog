"use client"

import { useRef, useState } from "react"
import { Save, Upload, ImageOff } from "lucide-react"
import type { Settings } from "@/lib/content"
import { site } from "@/data/site"

export function SettingsEditor({ initial }: { initial: Settings }) {
  const bg = initial.background
  const wl = initial.welcome

  // ── 背景图 ──
  const [mode, setMode] = useState<"image" | "none">(bg?.mode ?? "none")
  const [src, setSrc] = useState(bg?.src ?? "")
  const [overlay, setOverlay] = useState(bg?.overlay ?? "rgba(20,12,6,0.45)")
  const [animation, setAnimation] = useState<"kenburns" | "none">(
    bg?.animation ?? "kenburns"
  )
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Welcome 启动屏 ──
  const [welcomeEnabled, setWelcomeEnabled] = useState(wl?.enabled ?? true)
  const [welcomeTitle, setWelcomeTitle] = useState(wl?.title ?? `${site.name} · Lab`)
  const [welcomeSubtitle, setWelcomeSubtitle] = useState(
    wl?.subtitle ?? "AI 全栈 · 构建与写作"
  )
  const [welcomeBg, setWelcomeBg] = useState(wl?.background ?? "")
  const [showParticles, setShowParticles] = useState(wl?.showParticles ?? true)
  const [welcomeUploading, setWelcomeUploading] = useState(false)
  const welcomeFileInputRef = useRef<HTMLInputElement>(null)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [ok, setOk] = useState(false)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError("")
    setOk(false)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()

      if (res.ok && data.url) {
        setSrc(data.url)
        setMode("image")
      } else {
        setError(data.error || "上传失败")
      }
    } catch {
      setError("网络错误")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  async function handleWelcomeUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setWelcomeUploading(true)
    setError("")
    setOk(false)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()

      if (res.ok && data.url) {
        setWelcomeBg(data.url)
      } else {
        setError(data.error || "上传失败")
      }
    } catch {
      setError("网络错误")
    } finally {
      setWelcomeUploading(false)
      if (welcomeFileInputRef.current) welcomeFileInputRef.current.value = ""
    }
  }

  async function handleSave() {
    if (mode === "image" && !src.trim()) {
      setError("请上传背景图或填入图片地址")
      return
    }
    setSaving(true)
    setError("")
    setOk(false)

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          background: {
            mode,
            src: src.trim(),
            overlay: overlay.trim() || "rgba(20,12,6,0.45)",
            animation,
          },
          welcome: {
            enabled: welcomeEnabled,
            title: welcomeTitle.trim() || `${site.name} · Lab`,
            subtitle: welcomeSubtitle.trim() || "AI 全栈 · 构建与写作",
            background: welcomeBg.trim() || undefined,
            showParticles,
          },
        } satisfies Settings),
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
            站点设置
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
            背景图、动效与 Welcome 启动屏配置
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
        <h3 className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
          背景图
        </h3>

        {/* Mode toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setMode("none")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors"
            style={{
              background: mode === "none" ? "rgba(var(--color-accent-rgb), 0.12)" : "var(--color-bg-mute)",
              color: mode === "none" ? "var(--color-accent)" : "var(--color-text-secondary)",
              border: "1px solid var(--color-border)",
            }}
          >
            <ImageOff size={14} />
            无背景（暖纸色）
          </button>
          <button
            onClick={() => setMode("image")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors"
            style={{
              background: mode === "image" ? "rgba(var(--color-accent-rgb), 0.12)" : "var(--color-bg-mute)",
              color: mode === "image" ? "var(--color-accent)" : "var(--color-text-secondary)",
              border: "1px solid var(--color-border)",
            }}
          >
            <Upload size={14} />
            背景图
          </button>
        </div>

        {mode === "image" && (
          <>
            {/* Upload + preview */}
            <div className="flex items-start gap-4">
              <div
                className="w-40 h-24 rounded-lg flex items-center justify-center overflow-hidden"
                style={{ background: "var(--color-bg-mute)", border: "1px solid var(--color-border)" }}
              >
                {src ? (
                  <img src={src} alt="背景图预览" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    无预览
                  </span>
                )}
              </div>
              <label
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90 cursor-pointer"
                style={{ background: "var(--color-accent)", color: "#fff" }}
              >
                <Upload size={16} />
                {uploading ? "上传中..." : "上传图片"}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleUpload}
                  className="hidden"
                />
              </label>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>图片地址</span>
              <input
                value={src}
                onChange={(e) => setSrc(e.target.value)}
                placeholder="/content/uploads/bg.webp"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: "var(--color-bg-mute)", color: "var(--color-text)", border: "1px solid var(--color-border)" }}
              />
              <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                全屏背景用 cover 裁切；现有 800×450 水墨飞鸟 GIF 分辨率偏低，建议上传高清静态图（WebP/JPEG）
              </span>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>暗色遮罩</span>
              <input
                value={overlay}
                onChange={(e) => setOverlay(e.target.value)}
                placeholder="rgba(20,12,6,0.45)"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none font-mono"
                style={{ background: "var(--color-bg-mute)", color: "var(--color-text)", border: "1px solid var(--color-border)" }}
              />
              <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                保证玻璃卡片与背景图对比度，数值越大越暗。格式如 rgba(20,12,6,0.45)
              </span>
            </label>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>动效</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setAnimation("kenburns")}
                  className="px-3 py-2 rounded-lg text-sm transition-colors"
                  style={{
                    background: animation === "kenburns" ? "rgba(var(--color-accent-rgb), 0.12)" : "var(--color-bg-mute)",
                    color: animation === "kenburns" ? "var(--color-accent)" : "var(--color-text-secondary)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  Ken Burns 慢缩放
                </button>
                <button
                  onClick={() => setAnimation("none")}
                  className="px-3 py-2 rounded-lg text-sm transition-colors"
                  style={{
                    background: animation === "none" ? "rgba(var(--color-accent-rgb), 0.12)" : "var(--color-bg-mute)",
                    color: animation === "none" ? "var(--color-accent)" : "var(--color-text-secondary)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  静止
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Welcome 启动屏 ── */}
      <div
        className="rounded-xl p-5 flex flex-col gap-4 max-w-2xl mt-6"
        style={{ background: "var(--glass-bg-strong)", border: "1px solid var(--color-border)" }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
            Welcome 启动屏
          </h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={welcomeEnabled}
              onChange={(e) => setWelcomeEnabled(e.target.checked)}
              className="rounded accent-[var(--color-accent)]"
            />
            <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              启用 Welcome
            </span>
          </label>
        </div>

        {welcomeEnabled && (
          <>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>标题</span>
              <input
                value={welcomeTitle}
                onChange={(e) => setWelcomeTitle(e.target.value)}
                placeholder="刘 · Lab"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: "var(--color-bg-mute)", color: "var(--color-text)", border: "1px solid var(--color-border)" }}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>副标题</span>
              <input
                value={welcomeSubtitle}
                onChange={(e) => setWelcomeSubtitle(e.target.value)}
                placeholder="AI 全栈 · 构建与写作"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: "var(--color-bg-mute)", color: "var(--color-text)", border: "1px solid var(--color-border)" }}
              />
            </label>

            {/* 动态图 Upload + preview */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>动态背景图</span>
              <div className="flex items-start gap-4">
                <div
                  className="w-40 h-24 rounded-lg flex items-center justify-center overflow-hidden"
                  style={{ background: "var(--color-bg-mute)", border: "1px solid var(--color-border)" }}
                >
                  {welcomeBg ? (
                    <img src={welcomeBg} alt="Welcome 动态图预览" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                      无预览
                    </span>
                  )}
                </div>
                <label
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90 cursor-pointer"
                  style={{ background: "var(--color-accent)", color: "#fff" }}
                >
                  <Upload size={16} />
                  {welcomeUploading ? "上传中..." : "上传图片"}
                  <input
                    ref={welcomeFileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleWelcomeUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <input
                value={welcomeBg}
                onChange={(e) => setWelcomeBg(e.target.value)}
                placeholder="/content/uploads/welcome-bg.gif"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: "var(--color-bg-mute)", color: "var(--color-text)", border: "1px solid var(--color-border)" }}
              />
              <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                GIF/WebP 动图会自然播放；留空则使用暖纸色背景。渲染时叠加暗色遮罩保证文字可读
              </span>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showParticles}
                onChange={(e) => setShowParticles(e.target.checked)}
                className="rounded accent-[var(--color-accent)]"
              />
              <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                显示微粒子（暖金光点）
              </span>
            </label>
          </>
        )}
      </div>
    </div>
  )
}
