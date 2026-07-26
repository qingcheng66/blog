"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Upload, Edit, ImageIcon } from "lucide-react"
import { DeleteConfirmButton } from "@/components/admin-delete-button"
import type { GalleryItem } from "@/lib/content"

export function GalleryManager({ initial }: { initial: GalleryItem[] }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [items, setItems] = useState<GalleryItem[]>(initial)
  const [uploading, setUploading] = useState(false)
  const [editingLabel, setEditingLabel] = useState<string | null>(null)
  const [labelInput, setLabelInput] = useState("")
  const [error, setError] = useState("")

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()

      if (res.ok && data.url) {
        // Add to gallery
        const newItem: GalleryItem & { id?: string } = {
          id: "",
          src: data.url,
          label: file.name.split(".")[0],
        }
        const saveRes = await fetch("/api/admin/gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newItem),
        })
        if (saveRes.ok) {
          router.refresh()
          const updated = await fetch("/api/admin/gallery").then((r) => r.json())
          setItems(updated)
        }
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

  async function saveLabel(id: string) {
    if (!labelInput.trim()) return
    await fetch(`/api/admin/gallery/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: labelInput.trim() }),
    })
    router.refresh()
    setItems(items.map((g) => (g.id === id ? { ...g, label: labelInput.trim() } : g)))
    setEditingLabel(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>
            相册管理
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
            共 {items.length} 张照片
          </p>
        </div>
        <label
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90 cursor-pointer"
          style={{ background: "var(--color-accent)", color: "#fff" }}
        >
          <Upload size={16} />
          {uploading ? "上传中..." : "上传图片"}
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        </label>
      </div>

      {error && (
        <div className="rounded-lg px-4 py-2 mb-4 text-xs" style={{ background: "rgba(255,85,85,0.1)", color: "#FF5555", border: "1px solid rgba(255,85,85,0.2)" }}>
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-xl overflow-hidden transition-all duration-200 hover:scale-[1.02]"
            style={{ background: "var(--glass-bg-strong)", border: "1px solid var(--color-border)" }}
          >
            {/* Image preview */}
            <div className="aspect-square flex items-center justify-center" style={{ background: "var(--color-bg-mute)" }}>
              {item.src ? (
                <img src={item.src} alt={item.label} className="w-full h-full object-cover" />
              ) : (
                <ImageIcon size={32} style={{ color: "var(--color-text-muted)", opacity: 0.3 }} />
              )}
            </div>

            {/* Label + actions */}
            <div className="p-3 flex items-center justify-between">
              {editingLabel === item.id ? (
                <div className="flex items-center gap-1 flex-1">
                  <input
                    value={labelInput}
                    onChange={(e) => setLabelInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") saveLabel(item.id); if (e.key === "Escape") setEditingLabel(null) }}
                    autoFocus
                    className="flex-1 px-2 py-1 rounded text-xs outline-none"
                    style={{ background: "var(--color-bg-mute)", color: "var(--color-text)", border: "1px solid var(--color-border)" }}
                  />
                  <button onClick={() => saveLabel(item.id)} className="text-xs px-2 py-1 rounded" style={{ color: "var(--color-accent)" }}>确定</button>
                </div>
              ) : (
                <>
                  <span className="text-xs truncate" style={{ color: "var(--color-text-secondary)" }}>{item.label}</span>
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => { setEditingLabel(item.id); setLabelInput(item.label) }}
                      className="p-1.5 rounded transition-colors hover:bg-white/5" style={{ color: "var(--color-text-muted)" }}
                    >
                      <Edit size={13} />
                    </button>
                    <DeleteConfirmButton slug={item.id} title={item.label} apiPath={`/api/admin/gallery/${item.id}`} />
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
