"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"

export function DeleteConfirmButton({
  slug,
  title,
  apiPath,
}: {
  slug: string
  title: string
  apiPath?: string
}) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    try {
      const url = apiPath || `/api/admin/articles/${slug}`
      const res = await fetch(url, { method: "DELETE" })
      if (res.ok) {
        router.refresh()
      }
    } catch {
      // ignore
    } finally {
      setDeleting(false)
      setConfirming(false)
    }
  }

  if (!confirming) {
    return (
      <button
        onClick={(e) => { e.preventDefault(); setConfirming(true) }}
        className="p-2 rounded-lg transition-colors hover:bg-red-500/10"
        style={{ color: "var(--color-text-muted)" }}
        title={`删除 ${title}`}
      >
        <Trash2 size={15} />
      </button>
    )
  }

  return (
    <span className="flex items-center gap-1" onClick={(e) => e.preventDefault()}>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="px-2 py-1 rounded text-xs font-medium transition-colors"
        style={{ background: "rgba(255,85,85,0.15)", color: "#FF5555" }}
      >
        {deleting ? "删除中..." : "确认"}
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); setConfirming(false) }}
        disabled={deleting}
        className="px-2 py-1 rounded text-xs transition-colors"
        style={{ color: "var(--color-text-muted)" }}
      >
        取消
      </button>
    </span>
  )
}
