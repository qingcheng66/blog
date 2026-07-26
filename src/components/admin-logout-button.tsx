"use client"

import { LogOut } from "lucide-react"

export function LogoutButton() {
  return (
    <button
      onClick={async () => {
        await fetch("/api/admin/logout", { method: "POST" })
        window.location.href = "/admin/login"
      }}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors hover:bg-white/5 w-full text-left"
      style={{ color: "var(--color-text-muted)" }}
    >
      <LogOut size={17} />
      <span>退出登录</span>
    </button>
  )
}
