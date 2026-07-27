import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 只拦截 /admin 下的路由
  if (!pathname.startsWith("/admin")) return NextResponse.next()

  // 所有 /admin/* 路径都需要隐藏博客外壳，通过 x-is-admin header 告知 layout
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set("x-is-admin", "1")

  // 排除登录页和登录 API
  if (pathname === "/admin/login") {
    return NextResponse.next({ request: { headers: requestHeaders } })
  }
  if (pathname.startsWith("/api/admin/login")) {
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  // 检查 cookie
  const token = req.cookies.get("admin_token")?.value
  const password = process.env.ADMIN_PASSWORD

  if (!password || !token || token !== password) {
    // 如果是 API 请求，返回 401 JSON
    if (pathname.startsWith("/api/admin/")) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }
    // 页面请求，重定向到登录页
    return NextResponse.redirect(new URL("/admin/login", req.url))
  }

  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
}
