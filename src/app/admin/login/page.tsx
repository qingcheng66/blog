"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Lock } from "lucide-react"

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!password.trim()) return
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (res.ok) {
        router.push("/admin")
      } else {
        setError(data.error || "登录失败")
      }
    } catch {
      setError("网络错误，请重试")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div
        className="w-full max-w-sm rounded-2xl p-8"
        style={{
          background: "var(--glass-bg-strong)",
          backdropFilter: "blur(var(--glass-blur))",
          WebkitBackdropFilter: "blur(var(--glass-blur))",
          border: "1px solid var(--color-border)",
        }}
      >
        <div className="flex flex-col items-center mb-6">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
            style={{
              background: "rgba(var(--color-accent-rgb), 0.12)",
              color: "var(--color-accent)",
            }}
          >
            <Lock size={22} />
          </div>
          <h1 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>
            管理后台
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
            请输入管理员密码
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="密码"
            autoFocus
            className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-colors"
            style={{
              background: "var(--color-bg-mute)",
              color: "var(--color-text)",
              border: `1px solid ${error ? "rgba(255,85,85,0.4)" : "var(--color-border)"}`,
            }}
          />

          {error && (
            <p className="text-xs" style={{ color: "#FF5555" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="w-full py-3 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-40"
            style={{
              background: "var(--color-accent)",
              color: "#fff",
            }}
          >
            {loading ? "验证中..." : "登录"}
          </button>
        </form>

        <p className="text-xs text-center mt-6" style={{ color: "var(--color-text-muted)" }}>
          <Link href="/" className="hover:underline" style={{ color: "var(--color-accent)" }}>
            ← 返回博客
          </Link>
        </p>
      </div>
    </div>
  )
}
