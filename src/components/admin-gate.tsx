"use client"

import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

/**
 * 在客户端侧根据当前路径隐藏/显示内容。
 * 用于解决：服务端 headers() 在客户端导航时不更新导致布局切换失效。
 */
export function AdminGate({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith("/admin")

  if (isAdmin) return null
  return <>{children}</>
}
